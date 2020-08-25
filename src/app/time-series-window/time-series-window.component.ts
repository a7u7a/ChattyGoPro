// Adapted from: https://gist.github.com/robyngit/89327a78e22d138cff19c6de7288c1cf
// Using this reference: https://medium.com/better-programming/reactive-charts-in-angular-8-using-d3-4550bb0b4255

import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { timeFormat, xml } from 'd3';

@Component({
  selector: 'app-time-series-window',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './time-series-window.component.html',
  styleUrls: ['./time-series-window.component.scss']
})
export class TimeSeriesWindowComponent implements OnInit {
  hostElement; // Native element hosting the container
  
  // Dataset
  dataset;
  metricCount;
  metricMonths;

  // Chart sizing
  optwidth = 800;
  optheight = 370;
  margin;
  width;
  height;
  margin_context;
  height_context;
  
  // Data ranges
  dataXrange;
  dataYrange;
  mindate;
  maxdate;
  DateFormat;
  dynamicDateFormat;

  // Axis
  x:any;
  y;
  xAxis;
  yAxis;
  x2;
  y2;
  xAxis_context;

  // Plotted line and area
  line;
  area;
  area_context;
  line_context;
  brush;
  zoom;

  focus;

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
}

  ngOnInit(): void {
    this.createChart();
  }

private createChart(){

  this.setChartDimensions();

  this.prepareData();

  this.setDataRanges();

  this.createAxis();

  console.log(this.dataset)

  
  
  

}

private createAxis(){

  // Focus chart
  this.x = d3.scaleTime() // not sure if this is working right
      .range([0,(this.width)])
      .domain(this.dataXrange);
  
  this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain(this.dataYrange);
  
  this.xAxis = d3.axisBottom(this.x)
      .tickSize(-(this.height))
      .ticks(this.customTickFunction)
      .tickFormat(this.dynamicDateFormat);

  this.yAxis = d3.axisRight(this.y)
      .ticks(4)
      .tickSize(-(this.width));
  
  // Context chart
  this.x2 = d3.scaleTime()
      .range([0, this.width])
      .domain([this.mindate, this.maxdate]);
  
  this.y2 = d3.scaleLinear()
      .range([this.height_context,0])
      .domain(this.y.domain());

  this.xAxis_context = d3.axisBottom(this.x2)
      .ticks(this.customTickFunction)
      .tickFormat(this.dynamicDateFormat);

  // Focus chart: plotted line and area variables
  this.line = d3.line()
      .x(function(d: any){ return this.x(d.month); })
      .y(function(d: any) { return this.y(d.count); });

  this.area = d3.area()
      .x(function(d: any) { return this.x(d.month); })
      .y0((this.height))
      .y1(function(d: any) { return this.y(d.count); });

  // Context chart: plotted line and area variables
  this.area_context = d3.area()
      .x(function(d:any) { return this.x2(d.month); })
      .y0((this.height_context))
      .y1(function(d: any) { return this.y2(d.count); })
  
  this.line_context = d3.line()
      .x(function(d: any) { return this.x2(d.month); })
      .y(function(d:any) { return this.y2(d.count); });

  this.brush = d3.brushX()
      .extent([[0,this.width], [0, this.height_context]])
      .on("brushed", this.brushed)
      .on("brushend", this.brushend);
}

private brushend() {
  // When brush stops moving:
  // Check whether chart was scrolled out of bounds and fix
  var b = this.brush.extend();
  var out_of_bounds = this.brush.extent().some(function(e: any) { return e < this.mindate || e > this.maxdate; });
  if (out_of_bounds) {
     b = this.moveInBounds(b);
    };
}

private moveInBounds(b) {
  // Move back to boundaries if user pans outside min and max date.
  
}

private brushed(){
  this.x.domain(this.brush.empty() ? this.x2.domain() : this.brush.extent()); // when brush is empty
  this.focus.select(".area").attr("d", this.area);
  this.focus.select(".line").attr("d", this.line);
  this.focus.select(".x.axis").call(this.xAxis);
  // Reset zoom scale's domain
  this.zoom.x(this.x);
  this.updateDisplayDates();
  this.setYdomain();
}

private setYdomain(){
  // This function dynamically changes the y-axis to fit the data in focus

  // Get the min and max date in focus
  var xleft: any;
  xleft = new Date(this.x.domain()[0]);
  var xright: any;
  xright = new Date(this.x.domain()[1]);

  // A function that finds the nearest point to the right of a point
  var bisectDate = d3.bisector(function(d: any) {return d.month; }).right;

  // Get the y value of the line at the left edge of view port
  var iL = bisectDate(this.dataset, xleft);

  if (this.dataset[iL] !== undefined && this.dataset[iL] !== undefined){
    var left_dateBefore = this.dataset[iL-1].month;
    var left_dateAfter = this.dataset[iL].month;

    var intfun = d3.interpolateNumber(this.dataset[iL - 1], this.dataset[iL].count);
    var yleft = intfun((xleft - left_dateBefore) / (left_dateAfter - left_dateBefore));
  } else {
    var yleft = 0;
  }

  // Get the x value of the line at the right edge of view port:
  var iR = bisectDate(this.dataset, xright);

  if (this.dataset[iR] !== undefined && this.dataset[iR - 1] !== undefined){
    var right_dateBefore = this.dataset[iR - 1].count;
    var right_dateAfter = this.dataset[iR].count;

    var intfun = d3.interpolateNumber(this.dataset[iR - 1].count, this.dataset[iR].count);
    var yright = intfun((xright - right_dateBefore) / (right_dateAfter - right_dateBefore));
  } else { 
    var yright = 0;
  }

  // Get the y values of all the actual data points that are in view
  var dataSubset = this.dataset.filter(function(d: any){ return d.month >= xleft && d.month <= xright; });
  var countSubset = [];
  dataSubset.map(function(d) { countSubset.push(d.count); });

  // Add the edge values of the line to the array of counts in view, get the max y;
  countSubset.push(yleft);
  countSubset.push(yright);
  var ymax_new = d3.max(countSubset);

  if (ymax_new == 0){
    ymax_new = this.dataYrange[1];
  }

  // Reset and redraw the yaxis
  this.y.domain([0, ymax_new * 1.05]);
  this.focus.select(".y.axis").call(this.yAxis);
}

private updateDisplayDates(){

  // update the text that shows the range of displayed dates
  var b = this.brush.extent();
  var localBrushDateStart = (this.brush.empty()) ? this.DateFormat(this.dataXrange[0]) : this.DateFormat(b[0]);
  var localBrushDateEnd   = (this.brush.empty()) ? this.DateFormat(this.dataXrange[1]) : this.DateFormat(b[1]);

  d3.select("#displayDates")
    .text(localBrushDateEnd == localBrushDateEnd ? localBrushDateStart : localBrushDateStart + " - " + localBrushDateEnd);
};

private setDataRanges(){

  // Compute range of available data
  this.dataXrange = d3.extent(this.dataset, function(d:any) { return d.month; });
  this.dataYrange = [0, d3.max(this.dataset, function(d:any) { return d.count; })];
   
  // Maximum date range allowed to display
  this.mindate = this.dataXrange[0];
  this.maxdate = this.dataXrange[1];

  this.DateFormat = d3.timeFormat("%b %Y");
  
  this.dynamicDateFormat = this.timeFormat([
    [d3.timeFormat("%Y"), function() { return true; }], // <-- how to display when Jan 1 YYYY
    [d3.timeFormat("%b %Y"), function(d) { return d.getMonth(); }],
    [function() { return ""; }, function(d) { return d.getdDate() != 1; }]
  ]);
}


private timeFormat(formats){
  return function(date) {
    var i = formats.length - 1, f = formats[i];
    while (!f[1](date)) f = formats[--i];
    return f[0](date);
  };
}

private setChartDimensions(){

  // Set focus chart size
  this.margin = {top: 20, right: 30, bottom: 100, left: 20};
  this.width = this.optwidth - this.margin.left - this.margin.right;
  this.height = this.optheight - this.margin.top - this.margin.bottom;

  // Set Context chart size
  this.margin_context = {top: 320, right: 30, bottom: 20, left: 20};
  this.height_context = this.optheight - this.margin_context.top - this.margin_context.bottom;
}


  private prepareData(){

    this.metricCount = [1, 3, 1, 2, 1, 1, 1, 1, 2, 2, 3, 1, 2, 1, 4, 3, 2, 1, 1, 1, 1, 1, 4, 2, 1, 2, 8, 2, 1, 4, 2, 4, 1, 3, 1, 2, 1, 1, 3, 1, 1, 5, 1, 1, 4];
    this. metricMonths = ["2018-06", "2013-04", "2015-11", "2012-10", "2014-09", "2014-02", "2016-02", "2016-04", "2016-06", "2014-12", "2013-07", "2017-01", "2015-10", "2012-12", "2013-05", "2018-04", "2015-06", "2017-03", "2014-08",
    "2017-07", "2013-02", "2012-07", "2016-03", "2017-06", "2018-07", "2014-10", "2013-01", "2013-10", "2017-11", "2014-05", "2012-11", "2015-01", "2018-03", "2015-12", "2015-08", "2016-08", "2014-11", "2014-01",
    "2013-06", "2012-08", "2015-09", "2016-07", "2013-03", "2012-09", "2016-05"];

    // Combine the months and count array to make "data"
    this.dataset = [];
    for (var i=0; i < this.metricCount.length; i++){
      var obj = {count: this.metricCount[i], month: this.metricMonths[i]}
      this.dataset.push(obj);
    }
    
    // Format month as a date
    var parseTime = d3.timeParse("%Y-%m"); // used instead of d.month = d3.time.format("%Y-%m").parse(d.month);
    this.dataset.forEach(function (d){
      d.month = parseTime(d.month);
    })

    // Sort dataset by month
    this.dataset.sort(function(x, y){
      return d3.ascending(x.month, y.month);
    })
  }

  private customTickFunction(t0,t1,dt){
    var labelSize = 42;
    var maxTotalLabels = Math.floor(this.width / labelSize);

    function step(date,offset) {
      date.setMonth(date.getMonth() + offset);
    }
    var time = d3.timeMonth.ceil(t0);
    var times = [];
    var monthFactors = [1,3,4,12];

    while(time < t1) times.push(new Date(+time)),step(time, 1);
    var timesCopy = times;
    var i;
    for(i = 0; times.length > maxTotalLabels; i++)
      times = timesCopy.filter(function(d){
        return (d.getMonth()) % monthFactors[i] == 0;
      });
      return times;
  };

}
