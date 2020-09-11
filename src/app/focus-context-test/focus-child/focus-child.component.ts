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
  static x_context;
  static zoomEnabled = false;
  static focus1Margin;
  static focus2Margin;
  static focus3Margin;
  static y_f1;
  static y_f2;
  y_context;
  xAxis_context;
  static xAxis_f1;
  static xAxis_f2;
  public yAxisLeft_f1;
  public yAxisRight_f1;
  public yAxisLeft_f2;
  public yAxisRight_f2;
  contextMargin;
  static height;
  contextHeight;
  static width;
  static mainBrush;
  static annotationBrush;
  static zoom;
  static area;
  area2;
  static focus1;
  static focus2;
  static context;
  data;
  static gyro_values;
  static accl_values;
  top_limit;
  bottom_limit;
  gyro_domain;
  accl_domain;
  date_domain;
  static lines_f1;
  static lines_f2;
  contextLine;

  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://raw.githubusercontent.com/a7u7a/dummydata/master/other/accl_gyro_6204.csv",
  { responseType: 'text' }).subscribe(data => {
  var objs = d3.csvParse(data, function(d:any) {
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

    this.processData();

    this.setChartDimensions();

    this.setAxis();

    this.setMainBrush();

    this.createContextChart();

    this.createFocusCharts(); // Includes: Accl, Gyro

    this.createContextLine();

    this.createPlotLines();

    this.createAnnotationBrush();

    this.createZoom(); // Includes zoom toggle

    this.addElements();
  }

  private setAxis(){

  // Context
    // X time scale set range and domain
    FocusChildComponent.x_context = d3.scaleTime()
        .domain(this.date_domain) 
        .range([0, FocusChildComponent.width]);

    // Y2
    this.y_context = d3.scaleLinear().range([this.contextHeight, 0]);
    this.y_context.domain([this.gyro_domain[0] * 1.05,this.gyro_domain[1] * 1.05]);

    // Apply X2 (no yAxis for this one..yet)
    this.xAxis_context = d3.axisBottom(FocusChildComponent.x_context);

    // Focus1
    // Set X time scale
    FocusChildComponent.x = d3.scaleTime()
        .domain(FocusChildComponent.x_context.domain()) // shared with context X 
        .range([0, FocusChildComponent.width]);
    
    // Set Y scale
    FocusChildComponent.y_f1 = d3.scaleLinear().range([FocusChildComponent.height, 0]);
    FocusChildComponent.y_f1.domain([this.gyro_domain[0] * 1.05,this.gyro_domain[1] * 1.05]); // Add a bit of margin

    // Apply X scale to axis
    FocusChildComponent.xAxis_f1 = d3.axisBottom(FocusChildComponent.x);
    // Apply Y scale to axis
    this.yAxisLeft_f1 = d3.axisLeft(FocusChildComponent.y_f1);
    this.yAxisRight_f1 = d3.axisRight(FocusChildComponent.y_f1);

    // Focus2 (x scale same as focus1)
    // Set Y scale
    FocusChildComponent.y_f2 = d3.scaleLinear().range([FocusChildComponent.height, 0]);
    FocusChildComponent.y_f2.domain([this.accl_domain[0] * 1.05,this.accl_domain[1] * 1.05]); // Add a bit of margin

    FocusChildComponent.xAxis_f2 = d3.axisBottom(FocusChildComponent.x);
    this.yAxisLeft_f2 = d3.axisLeft(FocusChildComponent.y_f2);
    this.yAxisRight_f2 = d3.axisRight(FocusChildComponent.y_f2);
  }

  private setMainBrush(){
    // Create context brush feature
    FocusChildComponent.mainBrush = d3.brushX()
      .extent([[0,0], [FocusChildComponent.width, this.contextHeight]])
      .on("brush end", this.brushed);
  }

  private createContextChart(){
    // Create context svg group and position
    FocusChildComponent.context = FocusChildComponent.svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + this.contextMargin.left + "," + this.contextMargin.top + ")");
  }

  private createFocusCharts(){
    // Focus1
    // Create acceleration focus
    FocusChildComponent.focus1 = FocusChildComponent.svg.append("g")
        .attr("class", "focus1")
        .attr("transform", "translate(" + FocusChildComponent.focus1Margin.left + "," + FocusChildComponent.focus1Margin.top + ")");

    // Add clip path to svg
    FocusChildComponent.focus1.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.height);


    // Focus2
    FocusChildComponent.focus2 = FocusChildComponent.svg.append("g")
        .attr("class", "focus1")
        .attr("transform", "translate(" + FocusChildComponent.focus2Margin.left + "," + FocusChildComponent.focus2Margin.top + ")");

        // Add clip path to svg
    FocusChildComponent.focus2.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.height);
  }

  private createContextLine(){
    // Create context line
    this.contextLine = d3.line()
    .x((d:any) => { return FocusChildComponent.x_context(d.date); })
    .y((d:any) => { return this.y_context(d.val); });
  }

  private createPlotLines(){
    // Focus1
    // Color palette
    var colors_f1 = ['#e41a1c','#377eb8','#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

    // Assign line group to variable `line`
    FocusChildComponent.lines_f1 = FocusChildComponent.focus1.append('g')
        .attr("clip-path", "url(#clip)");

    // Create accl plot lines
    FocusChildComponent.lines_f1.selectAll(".line")
        .data(FocusChildComponent.gyro_values)
        .enter()
          .append("path")
          .attr("class", "line")  // I add the class line to be able to modify this line later on.
          .attr("fill", "none")
          .attr("stroke", d => { return colors_f1[FocusChildComponent.gyro_values.indexOf(d)]})
          .attr("stroke-width", 1)
          .attr("d", FocusChildComponent.setLine());

    //Focus2
    // Color palette
    var colors_f2 = ['#e41a1c','#377eb8','#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

    // Assign line group to variable `line`
    FocusChildComponent.lines_f2 = FocusChildComponent.focus2.append('g')
        .attr("clip-path", "url(#clip)");

    // Create accl plot lines
    FocusChildComponent.lines_f2.selectAll(".line")
        .data(FocusChildComponent.accl_values)
        .enter()
          .append("path")
          .attr("class", "line")  // I add the class line to be able to modify this line later on.
          .attr("fill", "none")
          .attr("stroke", d => { return colors_f2[FocusChildComponent.accl_values.indexOf(d)]})
          .attr("stroke-width", 1)
          .attr("d", FocusChildComponent.setLine());

  }

  private createAnnotationBrush(){
    // Create annotation brush 
    FocusChildComponent.annotationBrush = d3.brushX()
        .extent([[0,0], [FocusChildComponent.width, FocusChildComponent.height]])
        .on("brush", this.annotationBrushed);
  }

  private createZoom(){
    // Create zoom feature
    FocusChildComponent.zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [FocusChildComponent.width, FocusChildComponent.height]])
    .extent([[0, 0], [FocusChildComponent.width, FocusChildComponent.height]])
    .on("zoom", FocusChildComponent.zoomed);

    // toggle zoom
    d3.select(window).on("click", function() {  // Should be a button instead of whole window

      console.log("Toggling zoom");
      FocusChildComponent.zoomEnabled = !FocusChildComponent.zoomEnabled;

      // Should work, but doesnt
      // if (FocusChildComponent.zoomEnabled){
      //   console.log("on");
      //   FocusChildComponent.svg.select(".zoom")
      //       .call(FocusChildComponent.zoom);
      // } else {
      //   console.log("off");
      //   FocusChildComponent.svg.select(".zoom")
      //       .on('zoom', null);
      // }

      // Too hacky
      if (FocusChildComponent.zoomEnabled){
      FocusChildComponent.svg.select(".zoom")
          .attr("fill", "none");
      } else {
          FocusChildComponent.svg.select(".zoom")
          .attr("fill", "white");
      }
    });
  }

  private addElements(){

    // Context
    // Appends line to Context
    FocusChildComponent.context.append("path")
        .datum(FocusChildComponent.gyro_values[0])
        .attr("class", "contextLine")
        .attr("stroke", "#e41a1c")
        .attr("fill-opacity", "0%")
        .attr("d", this.contextLine);

    // Appends x axis to Context
    FocusChildComponent.context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.contextHeight + ")")
        .call(this.xAxis_context);

    // Appends brush to context, sets initial range
    FocusChildComponent.context.append("g")
        .attr("class", "brush")
        .call(FocusChildComponent.mainBrush)
        .call(FocusChildComponent.mainBrush.move, FocusChildComponent.x.range()); // sets initial brush state

    // Focus1
    // Appends X to focus svg group
    FocusChildComponent.focus1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + FocusChildComponent.height + ")")
        .call(FocusChildComponent.xAxis_f1);

    // Appends Y to focus svg group
    FocusChildComponent.focus1.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxisLeft_f1);

    // Adds Y axis right to acclFocus
    FocusChildComponent.focus1.append("g")
        .attr("class", "axis axis--yL")
        .attr("transform", "translate(" + FocusChildComponent.width + ",0)")
        .call(this.yAxisRight_f1)

    // Focus2
    FocusChildComponent.focus2.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + FocusChildComponent.height + ")")
        .call(FocusChildComponent.xAxis_f2);

    // Appends Y to focus svg group
    FocusChildComponent.focus2.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxisLeft_f2);

    // Adds Y axis right to acclFocus
    FocusChildComponent.focus2.append("g")
        .attr("class", "axis axis--yL")
        .attr("transform", "translate(" + FocusChildComponent.width + ",0)")
        .call(this.yAxisRight_f2)


    // Append annotation brush
    FocusChildComponent.svg.append("g")
        .attr("class", "annotationBrush")
        .attr("transform", "translate(" + FocusChildComponent.focus1Margin.left + "," + FocusChildComponent.focus1Margin.top + ")")
        .call(FocusChildComponent.annotationBrush);

    // Appends zoom to focus area
    FocusChildComponent.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.height)
        .attr("fill-opacity", "0%")
        .attr("transform", "translate(" + FocusChildComponent.focus1Margin.left + "," + FocusChildComponent.focus1Margin.top + ")")
        .call(FocusChildComponent.zoom);
  }

  private setChartDimensions(){
    // max units of the viewbox
    var viewBoxHeight = 1000;
    var viewBoxWidth = 960;

    this.contextMargin = {top: 20, right:40, bottom:900, left: 40};
    FocusChildComponent.focus1Margin = {top: 130, right:40, bottom:700, left: 40};
    FocusChildComponent.focus2Margin = {top: 330, right:40, bottom:30, left: 40};
    FocusChildComponent.focus3Margin = {top: 130, right:40, bottom:30, left: 40};
    
    FocusChildComponent.height = viewBoxHeight - FocusChildComponent.focus1Margin.top - FocusChildComponent.focus1Margin.bottom;
    this.contextHeight = viewBoxHeight - this.contextMargin.top - this.contextMargin.bottom;
    FocusChildComponent.width = viewBoxWidth - FocusChildComponent.focus1Margin.right - FocusChildComponent.focus1Margin.left;

    FocusChildComponent.svg = d3.select(this.hostElement).append('svg')
        // .attr('width', FocusChildComponent.width + FocusChildComponent.focus1Margin.left + FocusChildComponent.focus1Margin.right)
        .attr('width', '100%')
        .attr('height', '100%')
        // .attr('height', FocusChildComponent.height + FocusChildComponent.focus1Margin.top + FocusChildComponent.focus1Margin.bottom)
        .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
        // .append('g')    
        // .attr("transform", "translate(0,0)");

        //Viewbox debug
    FocusChildComponent.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'white')
        //.attr('stroke', 'black');
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
        // test0 =[],
        // test1 =[],
        // test2 =[];

    this.data.forEach((d) => { 
      gyro_0.push({"date": d.date, "val": d.gyro_0});
      gyro_1.push({"date": d.date, "val": d.gyro_1});
      gyro_2.push({"date": d.date, "val": d.gyro_2});
      accl_0.push({"date": d.date, "val": d.accl_0});
      accl_1.push({"date": d.date, "val": d.accl_1});
      accl_2.push({"date": d.date, "val": d.accl_2});
      // test0.push(d.accl_0);
      // test1.push(d.accl_1);
      // test2.push(d.accl_2);
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


  // console.log("max accl0",Math.max.apply(null, test0));
  // console.log("max accl1",Math.max.apply(null, test1));
  // console.log("max accl2",Math.max.apply(null, test2));
  // console.log("min accl0",Math.min.apply(null, test0));
  // console.log("min accl1",Math.min.apply(null, test1));
  // console.log("min accl2",Math.min.apply(null, test2));

    // Any of the streams should do
    this.date_domain = d3.extent(gyro_0, d => { return d.date }); 
  }

  static setLine(){
    return d3.line()
              .x((d:any) => { return FocusChildComponent.x(d.date) })
              .y((d:any) => { return FocusChildComponent.y_f1(d.val) })
  }

  private brushed(){ // Brush event handler
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || FocusChildComponent.x_context.range();
    FocusChildComponent.x.domain(s.map(FocusChildComponent.x_context.invert, FocusChildComponent.x_context));
    FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine());
    FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxis_f1);
    
    FocusChildComponent.svg.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
        .scale(FocusChildComponent.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private annotationBrushed(){
    if(d3.event.sourceEvent && d3.event.sourceEvent.shiftKey){
    console.log("shift"); 
    }
  }

  static zoomed() { // Zoom event handler
    
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x_context).domain());
    FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine());
    FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxis_f1);
    FocusChildComponent.context.select(".brush").call(FocusChildComponent.mainBrush.move, FocusChildComponent.x.range().map(t.invertX, t));
  
  }

}
