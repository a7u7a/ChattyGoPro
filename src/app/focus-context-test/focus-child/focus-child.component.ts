import { Component, OnInit, ViewEncapsulation, ElementRef, Input } from '@angular/core';

import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-focus-child',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './focus-child.component.html',
  styleUrls: ['./focus-child.component.scss']
})
export class FocusChildComponent implements OnInit {
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
  public yAxis;
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
    var data = objs;
    this.setChart();
    
    // Set axis range and domain
    FocusChildComponent.x = d3.scaleTime().range([0, FocusChildComponent.width]);
    FocusChildComponent.x.domain(d3.extent(data, (d:any)=> { return d.date; }));

    FocusChildComponent.x2 = d3.scaleTime().range([0, FocusChildComponent.width]);
    FocusChildComponent.x2.domain(FocusChildComponent.x.domain());

    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y.domain([0, d3.max(data, function(d:any) { return d.price; })]);

    this.y2 = d3.scaleLinear().range([this.height2, 0]);
    this.y2.domain(this.y.domain());

    // Apply scales to axes
    FocusChildComponent.xAxis = d3.axisBottom(FocusChildComponent.x);
    this.xAxis2 = d3.axisBottom(FocusChildComponent.x2);
    this.yAxis = d3.axisLeft(this.y);
    
    FocusChildComponent.brush = d3.brushX()
        .extent([[0,0], [FocusChildComponent.width, this.height2]])
        .on("brush end", this.brushed);

    FocusChildComponent.zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [FocusChildComponent.width, this.height]])
        .extent([[0, 0], [FocusChildComponent.width, this.height]])
        .on("zoom", this.zoomed);
    
    FocusChildComponent.area = d3.area()
        .curve(d3.curveMonotoneX)
        .x((d:any) => { return FocusChildComponent.x(d.date); })
        .y0(this.height)
        .y1((d:any)=> {return this.y(d.price); });

    this.area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x((d:any) => { return FocusChildComponent.x2(d.date); })
        .y0(this.height2)
        .y1((d:any) => { return this.y2(d.price); });

    FocusChildComponent.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", FocusChildComponent.width)
        .attr("height", this.height);

    FocusChildComponent.focus = FocusChildComponent.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    FocusChildComponent.context = FocusChildComponent.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

    // appends area to focus
    FocusChildComponent.focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", FocusChildComponent.area);

    // appends x and y axis to focus
    FocusChildComponent.focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")")
        .call(FocusChildComponent.xAxis);
    FocusChildComponent.focus.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxis);

    // Appends area2 to Context
    FocusChildComponent.context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", this.area2);

    // Appends x axis to Context
    FocusChildComponent.context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height2 + ")")
        .call(this.xAxis2);

    // Appends brush to context
    FocusChildComponent.context.append("g")
        .attr("class", "brush")
        .call(FocusChildComponent.brush)
        .call(FocusChildComponent.brush.move, FocusChildComponent.x.range());

    FocusChildComponent.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", FocusChildComponent.width)
        .attr("height", this.height)
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(FocusChildComponent.zoom);
  }

  private brushed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
    var s = d3.event.selection || FocusChildComponent.x2.range();
    FocusChildComponent.x.domain(s.map(FocusChildComponent.x2.invert, FocusChildComponent.x2));
    FocusChildComponent.focus.select(".area").attr("d", FocusChildComponent.area);
    FocusChildComponent.focus.select(".axis--x").call(FocusChildComponent.xAxis);
    
    FocusChildComponent.svg.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
        .scale(FocusChildComponent.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    
    var t = d3.event.transform;
    FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x2).domain());
    FocusChildComponent.focus.select(".area").attr("d", FocusChildComponent.area);
    FocusChildComponent.focus.select(".axis--x").call(FocusChildComponent.xAxis);
    FocusChildComponent.context.select(".brush").call(FocusChildComponent.brush.move, FocusChildComponent.x.range().map(t.invertX, t));
  }

  private setChart(){
    // max units of the viewbox
    var viewBoxHeight = 500;
    var viewBoxWidth = 960;

    this.margin = {top: 20, right:20, bottom:110, left: 40};
    this.margin2 = {top: 430, right:20, bottom:30, left: 40};
    
    this.height = viewBoxHeight - this.margin.top - this.margin.bottom;
    this.height2 = viewBoxHeight - this.margin2.top - this.margin2.bottom;
    FocusChildComponent.width = viewBoxWidth - this.margin.right - this.margin.left;

    FocusChildComponent.svg = d3.select(this.hostElement).append('svg')
        .attr('width', FocusChildComponent.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
        .append('g')    
        .attr("transform", "translate(0,0)");

        //Viewbox debug
    FocusChildComponent.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'white')
        .attr('stroke', 'black');
  }

}
