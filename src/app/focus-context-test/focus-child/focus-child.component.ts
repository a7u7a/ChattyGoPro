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
  hostElement;
  static svg;
  static x;
  static x2;
  static zoomEnabled = true;
  static y;
  y2;
  static xAxis;
  xAxis2;
  public yAxis;
  public yAxisRight;
  static margin;
  margin2;
  static height;
  height2;
  static width;
  static brush;
  static annotationBrush;
  static zoom;
  static area;
  area2;
  static focus;
  static context;
  data;
  static gyro_values;
  static accl_values;
  top_limit;
  bottom_limit;
  gyro_domain;
  accl_domain;
  date_domain;
  static line;


  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://raw.githubusercontent.com/a7u7a/dummydata/master/other/accl_gyro_6204.csv",
  { responseType: 'text' }).subscribe(data => {
  var objs = d3.csvParse(data,   function(d:any) {
    return {
      // Pending: Dont parse to local time 
      date: d3.timeParse("%Y-%m-%d %H:%M:%S.%f%Z")(d.date) || d3.timeParse("%Y-%m-%d %H:%M:%S%Z")(d.date), // Accounts for edge case
      accl_0: parseFloat(d.ACCL_0), // using parsefloat to avoid issues with d3 down the line
      accl_1: parseFloat(d.ACCL_1),
      accl_2: parseFloat(d.ACCL_2), 
      gyro_0: parseFloat(d.GYRO_0),
      gyro_1: parseFloat(d.GYRO_1),
      gyro_2: parseFloat(d.GYRO_2)}
     });
      this.createChart(objs);
   });
  }

  private createChart(objs){

    this.data = objs;
    this.setChart();
    this.processData();
    //console.log(FocusChildComponent.gyro_values);

    // Focus
    // X time scale set range and domain
    FocusChildComponent.x = d3.scaleTime()
        .domain(this.date_domain)
        .range([0, FocusChildComponent.width]);
    
    // Apply X axis (not sure why this step)
    FocusChildComponent.xAxis = d3.axisBottom(FocusChildComponent.x);

    // // Y axis
    FocusChildComponent.y = d3.scaleLinear().range([FocusChildComponent.height, 0])
    FocusChildComponent.y.domain([this.gyro_domain[0] * 1.05,this.gyro_domain[1] * 1.05]); // Add a bit of margin

    // Apply Y
    this.yAxis = d3.axisLeft(FocusChildComponent.y);
    this.yAxisRight = d3.axisRight(FocusChildComponent.y);

    // Context
    // X time scale set range and domain
    FocusChildComponent.x2 = d3.scaleTime()
        .domain(FocusChildComponent.x.domain()) // shared with x's
        .range([0, FocusChildComponent.width]);
    
    // // Apply X2
    this.xAxis2 = d3.axisBottom(FocusChildComponent.x2);

    // // Y2
    this.y2 = d3.scaleLinear().range([this.height2, 0]);
    this.y2.domain(FocusChildComponent.y.domain());

    // Add clip path to svg
    FocusChildComponent.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.height);

    // Create context brush feature
    FocusChildComponent.brush = d3.brushX()
        .extent([[0,0], [FocusChildComponent.width, this.height2]])
        .on("brush end", this.brushed);

    // Create annotation brush
    FocusChildComponent.annotationBrush = d3.brushX()
        .extent([[0,0], [FocusChildComponent.width, FocusChildComponent.height]])
        .on("brush", this.annotationBrushed);


    // Create zoom feature
    FocusChildComponent.zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [FocusChildComponent.width, FocusChildComponent.height]])
        .extent([[0, 0], [FocusChildComponent.width, FocusChildComponent.height]])
        .on("zoom", FocusChildComponent.zoomed);
  

    // Create context area
    this.area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x((d:any) => { return FocusChildComponent.x2(d.date); })
        .y0(this.height2)
        .y1((d:any) => { return this.y2(d.val); });

    // Create focus svg group and position
    FocusChildComponent.focus = FocusChildComponent.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + FocusChildComponent.margin.left + "," + FocusChildComponent.margin.top + ")");

    // Create context svg group and position
    FocusChildComponent.context = FocusChildComponent.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

    // Color palette
    var color = ['#e41a1c','#377eb8','#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

    // Assign line group to variable `line`
    FocusChildComponent.line = FocusChildComponent.focus.append('g')
         //.attr("class", ".line")
         .attr("clip-path", "url(#clip)");

    // Create lines
    FocusChildComponent.line.selectAll(".line")
    .data(FocusChildComponent.gyro_values)
    .enter()
      .append("path")
      .attr("class", "line")  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", d => { return color[FocusChildComponent.gyro_values.indexOf(d)]})
      .attr("stroke-width", 1.5)
      .attr("d", FocusChildComponent.setLine());

    // Appends x to focus svg group
    FocusChildComponent.focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + FocusChildComponent.height + ")")
        .call(FocusChildComponent.xAxis);

    // Appends y to focus svg group
    FocusChildComponent.focus.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxis);

    FocusChildComponent.focus.append("g")
        .attr("class", "axis axis--yL")
        .attr("transform", "translate(" + FocusChildComponent.width + ",0)")
        .call(this.yAxisRight)

    // // Appends area2 to Context
    FocusChildComponent.context.append("path")
        .datum(FocusChildComponent.gyro_values[0])
        .attr("class", "area")
        .attr("fill", "#e41a1c")
        .attr("d", this.area2);

    // Appends x axis to Context
    FocusChildComponent.context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height2 + ")")
        .call(this.xAxis2);

    // Appends brush to context, sets initial range
    FocusChildComponent.context.append("g")
        .attr("class", "brush")
        .call(FocusChildComponent.brush)
        .call(FocusChildComponent.brush.move, FocusChildComponent.x.range()); // sets initial brush state

        FocusChildComponent.svg.append("g")
        .attr("class", "annotationBrush")
        .attr("transform", "translate(" + FocusChildComponent.margin.left + "," + FocusChildComponent.margin.top + ")")
        .call(FocusChildComponent.annotationBrush);

    // Appends zoom to focus area
    FocusChildComponent.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.height)
        .attr("fill-opacity", "0%")
        .attr("transform", "translate(" + FocusChildComponent.margin.left + "," + FocusChildComponent.margin.top + ")")
        .call(FocusChildComponent.zoom);


        // toggle zoom
        d3.select(window)
        .on("click", function() {
          console.log("Toggling zoom");
          FocusChildComponent.zoomEnabled = !FocusChildComponent.zoomEnabled;

          // Right way
          if (FocusChildComponent.zoomEnabled){
            console.log("on");
            FocusChildComponent.svg.select(".zoom")
                .call(FocusChildComponent.zoom);
              } else {
                console.log("off");
                FocusChildComponent.svg.select(".zoom")
                    .on('zoom', null);
              }


          // Too hacky
          if (FocusChildComponent.zoomEnabled){
          FocusChildComponent.svg.select(".zoom")
              .attr("fill", "none");
            } else {
              FocusChildComponent.svg.select(".zoom")
              .attr("fill", "white");
            }

          // This keeps tracking zoom even if its not showing
          // if (FocusChildComponent.zoomEnabled){
          //   console.log("on");
          //   FocusChildComponent.zoom.on('zoom', FocusChildComponent.zoomed);
          // } else {
          //   console.log("off");
          //   FocusChildComponent.zoom.on('zoom', null);
          // }
          //console.log(FocusChildComponent.zoom)
          // if (d3.event.shiftKey) {
          //     d3.select(".zoom").remove();
          //     console.log("Mouse + Ctrl pressed");
          // }
      });

  
  }

  static setLine(){
    return d3.line()
              .x((d:any) => { return FocusChildComponent.x(d.date) })
              .y((d:any) => { return FocusChildComponent.y(d.val) })
  }


  private brushed(){
    //console.log(d3.event.sourceEvent.shiftKey);
    if(d3.event.sourceEvent && !d3.event.sourceEvent.shiftKey){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
    var s = d3.event.selection || FocusChildComponent.x2.range();
    FocusChildComponent.x.domain(s.map(FocusChildComponent.x2.invert, FocusChildComponent.x2));
    FocusChildComponent.focus.selectAll(".line").attr("d", FocusChildComponent.setLine());
    FocusChildComponent.focus.select(".axis--x").call(FocusChildComponent.xAxis);
    
    FocusChildComponent.svg.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
        .scale(FocusChildComponent.width / (s[1] - s[0]))
        .translate(-s[0], 0));
    }
  }

private annotationBrushed(){
  if(d3.event.sourceEvent && d3.event.sourceEvent.shiftKey){
  console.log("shift"); 
  }
}

  static zoomed() {

    if(d3.event.sourceEvent && !d3.event.sourceEvent.shiftKey){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush

    var t = d3.event.transform;
    FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x2).domain());
    FocusChildComponent.focus.selectAll(".line").attr("d", FocusChildComponent.setLine());
    FocusChildComponent.focus.select(".axis--x").call(FocusChildComponent.xAxis);
    FocusChildComponent.context.select(".brush").call(FocusChildComponent.brush.move, FocusChildComponent.x.range().map(t.invertX, t));
    }
  }

  private setChart(){
    // max units of the viewbox
    var viewBoxHeight = 500;
    var viewBoxWidth = 960;

    FocusChildComponent.margin = {top: 130, right:40, bottom:30, left: 40}; // focus
    this.margin2 = {top: 20, right:40, bottom:400, left: 40}; // context
    
    FocusChildComponent.height = viewBoxHeight - FocusChildComponent.margin.top - FocusChildComponent.margin.bottom;
    this.height2 = viewBoxHeight - this.margin2.top - this.margin2.bottom;
    FocusChildComponent.width = viewBoxWidth - FocusChildComponent.margin.right - FocusChildComponent.margin.left;

    FocusChildComponent.svg = d3.select(this.hostElement).append('svg')
        .attr('width', FocusChildComponent.width + FocusChildComponent.margin.left + FocusChildComponent.margin.right)
        .attr('height', FocusChildComponent.height + FocusChildComponent.margin.top + FocusChildComponent.margin.bottom)
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

  private processData(){
    /* Format data into suitable shape. Finds domains */

    // Split and find max min values
    var gyro_0 = [],
        gyro_1 = [],
        gyro_2 = [],
        accl_0 = [],
        accl_1 = [],
        accl_2 = [];

    this.data.forEach((d) => { 
      gyro_0.push({"date": d.date, "val": d.gyro_0});
      gyro_1.push({"date": d.date, "val": d.gyro_1});
      gyro_2.push({"date": d.date, "val": d.gyro_2});
      accl_0.push({"date": d.date, "val": d.accl_0});
      accl_1.push({"date": d.date, "val": d.accl_1});
      accl_2.push({"date": d.date, "val": d.accl_2});
    });

    // Assemble streams into arrays
    // Had to use array because I couldnt get .enter to work with a dictionary
    FocusChildComponent.gyro_values = [gyro_0, gyro_1, gyro_2];
    FocusChildComponent.accl_values = [accl_0, accl_1, accl_2];

    this.gyro_domain = d3.extent(d3.extent(gyro_0, (d) => { return d.val }).concat(
                        d3.extent(gyro_1, (d) => { return d.val; }),
                        d3.extent(gyro_2, (d) => { return d.val; })));

    this.accl_domain = d3.extent(d3.extent(accl_0, (d) => { return d.val }).concat(
                        d3.extent(accl_1, (d) => { return d.val }),
                        d3.extent(accl_2, (d) => { return d.val })));

    // Any of the streams should do
    this.date_domain = d3.extent(gyro_0, d => { return d.date });
    
  }
}
