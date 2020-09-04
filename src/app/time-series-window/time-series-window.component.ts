import { Component, OnInit, ViewEncapsulation, Input, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
 
@Component({
  selector: 'app-time-series-window',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './time-series-window.component.html',
  styleUrls: ['./time-series-window.component.scss']
})

export class TimeSeriesWindowComponent implements OnInit {
  @Input() xmax = 200;
  @Input() ymax = 200;
  hostElement;
  static svg;
  static x;
  static x2;
  y;
  y2;
  static xAxis;
  xAxis2;
  yAxis;
  margin;
  margin2;
  height;
  height2;
  static width;
  static brush;
  static zoom;
  static area;
  area2;
  static focus;
  static context;

  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
}

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://gist.githubusercontent.com/tristanwietsma/f4997974b5602a5b48ec8eba104335d4/raw/8c077d84249752e4ed16354aa25040590243ce4b/sp500.csv",
     { responseType: 'text' }).subscribe(data => {
      var objs = d3.csvParse(data, function(d:any) {
        return {
          date : d3.timeParse("%b %Y")(d.date),
          price: +d.price 
        }
      });
      this.createChart(objs);
   });

   
  }

private createChart(objs){
  // test if dates are being parsed right
  // objs.forEach(e => {
  //   console.log("e",e.date);
  // });

  //console.log(objs);

  var data = objs;

  this.setChart();
  
  // Set axis range and domain
  TimeSeriesWindowComponent.x = d3.scaleTime().range([0, TimeSeriesWindowComponent.width]);
  TimeSeriesWindowComponent.x.domain(d3.extent(data, (d:any)=> { return d.date; }));

  TimeSeriesWindowComponent.x2 = d3.scaleTime().range([0, TimeSeriesWindowComponent.width]);
  TimeSeriesWindowComponent.x2.domain(TimeSeriesWindowComponent.x.domain());

  this.y = d3.scaleLinear().range([this.height, 0]);
  this.y.domain([0, d3.max(data, function(d:any) { return d.price; })]);

  this.y2 = d3.scaleLinear().range([this.height2, 0]);
  this.y2.domain(this.y.domain());

  // Apply scales to axes
  TimeSeriesWindowComponent.xAxis = d3.axisBottom(TimeSeriesWindowComponent.x);
  this.xAxis2 = d3.axisBottom(TimeSeriesWindowComponent.x2);
  this.yAxis = d3.axisLeft(this.y);
  
  TimeSeriesWindowComponent.brush = d3.brushX()
      .extent([[0,0], [TimeSeriesWindowComponent.width, this.height2]])
      .on("brush end", this.brushed);

  TimeSeriesWindowComponent.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [TimeSeriesWindowComponent.width, this.height]])
      .extent([[0, 0], [TimeSeriesWindowComponent.width, this.height]])
      .on("zoom", this.zoomed);
  
  TimeSeriesWindowComponent.area = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d:any) => { return TimeSeriesWindowComponent.x(d.date); })
      .y0(this.height)
      .y1((d:any)=> {return this.y(d.price); });

  this.area2 = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d:any) => { return TimeSeriesWindowComponent.x2(d.date); })
      .y0(this.height2)
      .y1((d:any) => { return this.y2(d.price); });

  TimeSeriesWindowComponent.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", TimeSeriesWindowComponent.width)
      .attr("height", this.height);

  TimeSeriesWindowComponent.focus = TimeSeriesWindowComponent.svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  TimeSeriesWindowComponent.context = TimeSeriesWindowComponent.svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

      

  // appends area to focus
  TimeSeriesWindowComponent.focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", TimeSeriesWindowComponent.area);

  // appends x and y axis to focus
  TimeSeriesWindowComponent.focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(TimeSeriesWindowComponent.xAxis);
  TimeSeriesWindowComponent.focus.append("g")
      .attr("class", "axis axis--y")
      .call(this.yAxis);

  // Appends area2 to Context
  TimeSeriesWindowComponent.context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", this.area2);

  // Appends x axis to Context
  TimeSeriesWindowComponent.context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height2 + ")")
      .call(this.xAxis2);

  // Appends brush to context
  TimeSeriesWindowComponent.context.append("g")
      .attr("class", "brush")
      .call(TimeSeriesWindowComponent.brush)
      .call(TimeSeriesWindowComponent.brush.move, TimeSeriesWindowComponent.x.range());

  TimeSeriesWindowComponent.svg.append("rect")
      .attr("class", "zoom")
      .attr("width", TimeSeriesWindowComponent.width)
      .attr("height", this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .call(TimeSeriesWindowComponent.zoom);

}

private brushed(){
  //console.log("range x2",d3.event.sourceEvent.selection);
  //console.log(TimeSeriesWindowComponent.x2.range());
  //console.log("sel", d3.event.selection);
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  // if (d3.event.selection){
  //   console.log("d3.event.selection", d3.event.selection);
  // } else {
  //   console.log("range" ,TimeSeriesWindowComponent.x2.range());
  // }
  
  var s = d3.event.selection || TimeSeriesWindowComponent.x2.range();
  
  TimeSeriesWindowComponent.x.domain(s.map(TimeSeriesWindowComponent.x2.invert, TimeSeriesWindowComponent.x2));
  TimeSeriesWindowComponent.focus.select(".area").attr("d", TimeSeriesWindowComponent.area);
  TimeSeriesWindowComponent.focus.select(".axis--x").call(TimeSeriesWindowComponent.xAxis);
  
  TimeSeriesWindowComponent.svg.select(".zoom").call(TimeSeriesWindowComponent.zoom.transform, d3.zoomIdentity
      .scale(TimeSeriesWindowComponent.width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

private zoomed() {
  console.log("zoomed");
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  TimeSeriesWindowComponent.x.domain(t.rescaleX(TimeSeriesWindowComponent.x2).domain());
  TimeSeriesWindowComponent.focus.select(".area").attr("d", TimeSeriesWindowComponent.area);
  TimeSeriesWindowComponent.focus.select(".axis--x").call(TimeSeriesWindowComponent.xAxis);
  TimeSeriesWindowComponent.context.select(".brush").call(TimeSeriesWindowComponent.brush.move, TimeSeriesWindowComponent.x.range().map(t.invertX, t));
}



private setChart(){
  // max units of the viewbox
  var viewBoxHeight = 500;
  var viewBoxWidth = 960;

  this.margin = {top: 20, right:20, bottom:110, left: 40};
  this.margin2 = {top: 430, right:20, bottom:30, left: 40};
  
  this.height = viewBoxHeight - this.margin.top - this.margin.bottom;
  this.height2 = viewBoxHeight - this.margin2.top - this.margin2.bottom;
  TimeSeriesWindowComponent.width = viewBoxWidth - this.margin.right - this.margin.left;

  TimeSeriesWindowComponent.svg = d3.select(this.hostElement).append('svg')
      .attr('width', TimeSeriesWindowComponent.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
      .append('g')    
      .attr("transform", "translate(0,0)");

      //Viewbox debug
  TimeSeriesWindowComponent.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'white')
      .attr('stroke', 'black');

  //this.svg.attr("transform", "translate(10,10)")
}

}



