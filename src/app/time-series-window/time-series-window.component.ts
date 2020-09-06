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

    // Focus
    // X time scale set range and domain
    TimeSeriesWindowComponent.x = d3.scaleTime()
        .domain(<[Date, Date]>d3.extent(data, (d:any)=> { return d.date; }))
        .range([0, TimeSeriesWindowComponent.width]);
    
    // Apply X axis (not sure why this step)
    TimeSeriesWindowComponent.xAxis = d3.axisBottom(TimeSeriesWindowComponent.x);

    // Y axis
    this.y = d3.scaleLinear().range([this.height, 0])
    this.y.domain([0, d3.max(data, function(d:any) { return d.price; })]);

    // Apply Y
    this.yAxis = d3.axisLeft(this.y);

    // Context
    // X time scale set range and domain
    TimeSeriesWindowComponent.x2 = d3.scaleTime()
        .domain(TimeSeriesWindowComponent.x.domain()) // shared with x's
        .range([0, TimeSeriesWindowComponent.width]);
    
    // Apply X2
    this.xAxis2 = d3.axisBottom(TimeSeriesWindowComponent.x2);

    // Y2
    this.y2 = d3.scaleLinear().range([this.height2, 0]);
    this.y2.domain(this.y.domain());

    // Add clip path to svg
    TimeSeriesWindowComponent.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", TimeSeriesWindowComponent.width)
        .attr("height", this.height);


        
    // Create brush feature
    TimeSeriesWindowComponent.brush = d3.brushX()
        .extent([[0,0], [TimeSeriesWindowComponent.width, this.height2]])
        .on("brush end", this.brushed);

    // Create zoom feature
    TimeSeriesWindowComponent.zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [TimeSeriesWindowComponent.width, this.height]])
        .extent([[0, 0], [TimeSeriesWindowComponent.width, this.height]])
        .on("zoom", this.zoomed);



    // Create context area
    this.area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x((d:any) => { return TimeSeriesWindowComponent.x2(d.date); })
        .y0(this.height2)
        .y1((d:any) => { return this.y2(d.price); });

    // Create focus svg group and position
    TimeSeriesWindowComponent.focus = TimeSeriesWindowComponent.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Create context svg group and position
    TimeSeriesWindowComponent.context = TimeSeriesWindowComponent.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");


    // Create focus area
    TimeSeriesWindowComponent.area = d3.area()
        .curve(d3.curveMonotoneX)
        .x((d:any) => { return TimeSeriesWindowComponent.x(d.date); })
        .y0(this.height)
        .y1((d:any)=> {return this.y(d.price); });

    // Appends area to focus
    TimeSeriesWindowComponent.focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", TimeSeriesWindowComponent.area);


    // Appends x to focus svg group
    TimeSeriesWindowComponent.focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")")
        .call(TimeSeriesWindowComponent.xAxis);

    // Appends y to focus svg group
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

    // Appends brush to context, sets initial range
    TimeSeriesWindowComponent.context.append("g")
        .attr("class", "brush")
        .call(TimeSeriesWindowComponent.brush)
        .call(TimeSeriesWindowComponent.brush.move, TimeSeriesWindowComponent.x.range());

    // Appends zoom to focus area
    TimeSeriesWindowComponent.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", TimeSeriesWindowComponent.width)
        .attr("height", this.height)
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(TimeSeriesWindowComponent.zoom);
  }

  private brushed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
    var s = d3.event.selection || TimeSeriesWindowComponent.x2.range();
    TimeSeriesWindowComponent.x.domain(s.map(TimeSeriesWindowComponent.x2.invert, TimeSeriesWindowComponent.x2));
    TimeSeriesWindowComponent.focus.select(".area").attr("d", TimeSeriesWindowComponent.area);
    TimeSeriesWindowComponent.focus.select(".axis--x").call(TimeSeriesWindowComponent.xAxis);
    
    TimeSeriesWindowComponent.svg.select(".zoom").call(TimeSeriesWindowComponent.zoom.transform, d3.zoomIdentity
        .scale(TimeSeriesWindowComponent.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed() {
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
  }

}



