// Adapted from: https://gist.github.com/robyngit/89327a78e22d138cff19c6de7288c1cf
// Using this reference: https://medium.com/better-programming/reactive-charts-in-angular-8-using-d3-4550bb0b4255

import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { timeFormat, xml, thresholdSturges, svg, dsv } from 'd3';
import { visitAll } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';
 
@Component({
  selector: 'app-time-series-window',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './time-series-window.component.html',
  styleUrls: ['./time-series-window.component.scss']
})
export class TimeSeriesWindowComponent implements OnInit {
  //hostElement;
  svg;
  margin;
  margin2;
  width;
  height;
  height2;
  parseDate;
  x;
  x2;
  y;
  y2;
  xAxis;
  xAxis2;
  yAxis;
  brush;
  zoom;
  area;
  area2;
  focus;
  context;
  data;

  constructor(private elRef: ElementRef, private http: HttpClient) {
    //this.hostElement = this.elRef.nativeElement;
}

  ngOnInit(): void {
    this.http.get("https://gist.githubusercontent.com/tristanwietsma/f4997974b5602a5b48ec8eba104335d4/raw/8c077d84249752e4ed16354aa25040590243ce4b/sp500.csv",
     { responseType: 'text' }).subscribe(data => {
      var objs = d3.csvParse(data);
      this.createChart(objs);
   });
  }

private createChart(objs){

  this.data = objs
  //console.log((this.data));

  this.svg = d3.select("svg");
  this.margin = {top: 20, right:20, bottom: 110, left:40};
  this.margin2 = {top:430, right: 20, bottom: 30, left:40};
  this.width = 100 - this.margin.left - this.margin.right;
  this.height = 100 - this.margin.top - this.margin.bottom;
  this.height2 = this.svg.attr("height") - this.margin2.top - this.margin2.bottom;

  this.parseDate = d3.timeParse("%b %Y");

  this.x = d3.scaleTime().range([0, this.width]);
  this.x2 = d3.scaleTime().range([0, this.width]);
  console.log(this.height);
  this.y = d3.scaleLinear().range([this.height, 0]);
  this.y2 = d3.scaleLinear().range([this.height2, 0]);

  this.xAxis = d3.axisBottom(this.x);
  this.xAxis2 = d3.axisBottom(this.x2);
  this.yAxis = d3.axisLeft(this.y);
  

  this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height2]])
      .on("brush end", this.brushed);

  this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on("zoom", this.zoomed);


  this.area = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d:any) =>{ return this.x(d.date); })
      .y0(this.height)
      .y1((d:any) => { return this.y(d.price)} );
      

  this.area2 = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d:any) => { return this.x2(d.date); })
      .y0(this.height2)
      .y1((d:any) => { return this.y2(d.price); });

  this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);

  this.focus = this.svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  this.context = this.svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

  
    this.x.domain(d3.extent(this.data, function(d:any) { return d.date; }));
    this.y.domain([0, d3.max(this.data, function(d:any) { return d.price; })]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());
  
    this.focus.append("path")
        .datum(this.data)
        .attr("class", "area")
        .attr("d", this.area);
  
        
    this.focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);
  
    this.focus.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxis);
  
    this.context.append("path")
        .datum(this.data)
        .attr("class", "area")
        .attr("d", this.area2);
  
    this.context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height2 + ")")
        .call(this.xAxis2);
  
    this.context.append("g")
        .attr("class", "brush")
        .call(this.brush)
        .call(this.brush.move, this.x.range());
  
    this.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(this.zoom);
  

  
}



private brushed(){
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || this.x2.range();
  this.x.domain(s.map(this.x2.invert, this.x2));
  this.focus.select(".area").attr("d", this.area);
  this.focus.select(".axis--x").call(this.xAxis);
  this.svg.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
    .scale(this.width / (s[1] - s[0]))
    .translate(-s[0], 0));
}





private zoomed() {

  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  this.x.domain(t.rescaleX(this.x2).domain());
  this.focus.select(".area").attr("d", this.area);
  this.focus.select(".axis--x").call(this.xAxis);
  this.context.select(".brush").call(this.brush.move, this.x.range().map(t.invertX, t));

}




// private type(d){
//   d.date = this.parseDate(d.date);
//   d.price = +d.price;
//   return d;
// }

}
