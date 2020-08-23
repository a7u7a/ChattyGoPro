// Adapted from: https://gist.github.com/robyngit/89327a78e22d138cff19c6de7288c1cf
// Using this reference: https://medium.com/better-programming/reactive-charts-in-angular-8-using-d3-4550bb0b4255

import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-time-series-window',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './time-series-window.component.html',
  styleUrls: ['./time-series-window.component.scss']
})
export class TimeSeriesWindowComponent implements OnInit {
  hostElement; // Native element hosting the container
  dataset;
  metricCount;
  metricMonths;
  margin;
  width;
  height;
  margin_context;
  height_context;
  optwidth = 800; // Chart w size
  optheight = 370; // Chart h size

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
}

  ngOnInit(): void {
    this.createChart();
  }

private createChart(){

  // Set focus chart size
  this.margin = {top: 20, right: 30, bottom: 100, left: 20};
  this.width = this.optwidth - this.margin.left - this.margin.right;
  this.height = this.optheight - this.margin.top - this.margin.bottom;

  // Set Context chart size
  this.margin_context = {top: 320, right: 30, bottom: 20, left: 20};
  this.height_context = this.optheight - this.margin_context.top - this.margin_context.bottom;



  this.prepareData();
  console.log(this.dataset)
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
    var parseTime = d3.timeParse("%Y-%m");
    this.dataset.forEach(function (d){
      d.month = parseTime(d.month);
    })

    // Sort dataset by month
    this.dataset.sort(function(x, y){
      return d3.ascending(x.month, y.month);
    })

  }


}
