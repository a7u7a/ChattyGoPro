import { Component, OnInit, ViewEncapsulation, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { svg, brush } from 'd3';

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
  
  static focus1Margin;
  static focus2Margin;
  static focus3Margin;
  static y_f1;
  static y_f2;
  static y_f3;
  y_context;
  static xAxis_context;
  static xAxis_f1;
  static xAxis_f2;
  static xAxis_f3;
  public yAxisLeft_f1;
  public yAxisRight_f1;
  public yAxisLeft_f2;
  public yAxisRight_f2;
  public yAxisLeft_f3;
  public yAxisRight_f3;
  contextMargin;
  static height;
  contextHeight;
  static width;
  static mainBrush;
  static zoom;
  zoomToggle;
  static zoomEnabled = false;
  zoomHeight;
  static focus1;
  static focus2;
  static focus3;
  static context;
  data;
  static gyro_values;
  static accl_values;
  static alt_values = [];
  top_limit;
  bottom_limit;
  gyro_domain;
  accl_domain;
  alt_domain;
  date_domain;
  static lines_f1;
  static lines_f2;
  static line_f3;
  contextLine;
  static focus1Height;
  static focus2Height;
  static focus3Height;
  strokeWidth = "0.5";
  static lastSelection;
  
  static brushSelection;

  annotBtn;
  annotBtnHeight;
  annotBtnWidth;
  annotBtnMargin;
  annotEditor;
  annotSaveBtn;

  // Annotations1
  static annotChart1;
  static annotBrushes = []; // Keep track of annot brushes
  static annotBrushesGroup; // SVG group where annot brushes go
  static annotBrushOverlayHeight;

  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://raw.githubusercontent.com/a7u7a/dummydata/master/other/accl_gyro_alt_6204.csv",
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
      gyro_2: parseFloat(d.GYRO_2),
      alt: parseFloat(d.GPS5_2)
  }});
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

    this.createFocusCharts(); // Includes: Gyro, Accl, Elevation

    this.createAnnotationsChart();

    this.createContextLine();

    this.createPlotLines();

    this.createAnnotBrushGroup();

    FocusChildComponent.newAnnotBrush();

    //FocusChildComponent.drawAnnotBrushes();

    this.createZoom(); // Includes zoom toggle

    this.createAnnotationEditor();

    this.addElements();
  }

  private setChartDimensions(){
    // max units of the viewbox
    var viewBoxHeight = 1000;
    var viewBoxWidth = 960;

    this.contextMargin = {top: 20, right:40, bottom:900, left: 40};
    FocusChildComponent.focus1Margin = {top: 130, right:40, bottom:700, left: 40};
    FocusChildComponent.focus2Margin = {top: 330, right:40, bottom:500, left: 40};
    FocusChildComponent.focus3Margin = {top: 530, right:40, bottom:300, left: 40};

    FocusChildComponent.height = viewBoxHeight - this.contextMargin.top - 20; // (placeholder value)
    FocusChildComponent.width = viewBoxWidth - FocusChildComponent.focus1Margin.right - FocusChildComponent.focus1Margin.left;

    this.contextHeight = viewBoxHeight - this.contextMargin.top - this.contextMargin.bottom;
    FocusChildComponent.focus1Height = viewBoxHeight - FocusChildComponent.focus1Margin.top - FocusChildComponent.focus1Margin.bottom;
    FocusChildComponent.focus2Height = viewBoxHeight - FocusChildComponent.focus2Margin.top - FocusChildComponent.focus2Margin.bottom;
    FocusChildComponent.focus3Height = viewBoxHeight - FocusChildComponent.focus3Margin.top - FocusChildComponent.focus3Margin.bottom;
    FocusChildComponent.annotBrushOverlayHeight = this.contextHeight;
    this.zoomHeight = viewBoxHeight - FocusChildComponent.focus1Margin.top - FocusChildComponent.focus3Margin.bottom;

    this.annotBtnMargin = {top: 330, right:600, bottom: 310, left:40}
    this.annotBtnHeight = viewBoxHeight - this.annotBtnMargin.top - this.annotBtnMargin.bottom;
    this.annotBtnWidth = viewBoxHeight - this.annotBtnMargin.left - this.annotBtnMargin.right;

    FocusChildComponent.svg = d3.select(this.hostElement).append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)

    //Viewbox debug
    FocusChildComponent.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'white')
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

    // Apply X2 (no yAxis on context..yet)
    FocusChildComponent.xAxis_context = d3.axisBottom(FocusChildComponent.x_context);

    // Focus1
    // Set X time scale
    FocusChildComponent.x = d3.scaleTime()
        .domain(FocusChildComponent.x_context.domain()) // shared with context X 
        .range([0, FocusChildComponent.width]);
    
    var plotMarginFactor = 1.05;

    // Set Y scale
    FocusChildComponent.y_f1 = d3.scaleLinear().range([FocusChildComponent.focus1Height, 0]);
    FocusChildComponent.y_f1.domain([this.gyro_domain[0] * plotMarginFactor,this.gyro_domain[1] * plotMarginFactor]); // Add a bit of margin

    // Apply X scale to axis
    FocusChildComponent.xAxis_f1 = d3.axisBottom(FocusChildComponent.x);
    // Apply Y scale to axis
    this.yAxisLeft_f1 = d3.axisLeft(FocusChildComponent.y_f1);
    this.yAxisRight_f1 = d3.axisRight(FocusChildComponent.y_f1);

    // Focus2 (x scale same as focus1)
    // Set Y scale
    FocusChildComponent.y_f2 = d3.scaleLinear().range([FocusChildComponent.focus2Height, 0]);
    FocusChildComponent.y_f2.domain([this.accl_domain[0] * plotMarginFactor,this.accl_domain[1] * plotMarginFactor]); // Add a bit of margin
    FocusChildComponent.xAxis_f2 = d3.axisBottom(FocusChildComponent.x);
    this.yAxisLeft_f2 = d3.axisLeft(FocusChildComponent.y_f2); // these could go. too verbose
    this.yAxisRight_f2 = d3.axisRight(FocusChildComponent.y_f2);

    // Focus3 
    // Set Y scale
    FocusChildComponent.y_f3 = d3.scaleLinear().range([FocusChildComponent.focus3Height, 0]);
    FocusChildComponent.y_f3.domain(this.alt_domain); // Add a bit of margin
    FocusChildComponent.xAxis_f3 = d3.axisBottom(FocusChildComponent.x); // x scale same as focus1
    this.yAxisLeft_f3 = d3.axisLeft(FocusChildComponent.y_f3); // these could go. too verbose
    this.yAxisRight_f3 = d3.axisRight(FocusChildComponent.y_f3);


  }

  private setMainBrush(){
    // Create context brush feature
    FocusChildComponent.mainBrush = d3.brushX()
        .extent([[0,0], [FocusChildComponent.width, this.contextHeight]])
        .on("brush", FocusChildComponent.brushed);
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
        .attr("id", "clip1")
        .append("rect")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.focus1Height);

    // Focus2
    FocusChildComponent.focus2 = FocusChildComponent.svg.append("g")
        .attr("class", "focus2")
        .attr("transform", "translate(" + FocusChildComponent.focus2Margin.left + "," + FocusChildComponent.focus2Margin.top + ")");

        // Add clip path to svg
    FocusChildComponent.focus2.append("defs").append("clipPath")
        .attr("id", "clip2")
        .append("rect")
        .attr("width", FocusChildComponent.width)
        .attr("height", FocusChildComponent.focus2Height);

    // Focus3
    FocusChildComponent.focus3 = FocusChildComponent.svg.append("g")
       .attr("class", "focus3")
       .attr("transform", "translate(" + FocusChildComponent.focus3Margin.left + "," + FocusChildComponent.focus3Margin.top + ")");

       // Add clip path to svg
   FocusChildComponent.focus3.append("defs").append("clipPath")
       .attr("id", "clip3")
       .append("rect")
       .attr("width", FocusChildComponent.width)
       .attr("height", FocusChildComponent.focus3Height);
  }

  private createContextLine(){
    // Create context line
    this.contextLine = d3.line()
    .x((d:any) => { return FocusChildComponent.x_context(d.date); })
    .y((d:any) => { return this.y_context(d.val); });
  }

  static setLine_f1(){
    return d3.line()
              .x((d:any) => { return FocusChildComponent.x(d.date) })
              .y((d:any) => { return FocusChildComponent.y_f1(d.val) })
  }

  static setLine_f2(){
    return d3.line()
              .x((d:any) => { return FocusChildComponent.x(d.date) })
              .y((d:any) => { return FocusChildComponent.y_f2(d.val) })
  }

  static setLine_f3(){
    return d3.line()
              .x((d:any) => { return FocusChildComponent.x(d.date) })
              .y((d:any) => { return FocusChildComponent.y_f3(d.val) })
  }

  private createPlotLines(){
    // Focus1
    // Color palette
    var colors_f1 = ['#e41a1c','#377eb8','#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

    // Assign line group to variable `line`
    FocusChildComponent.lines_f1 = FocusChildComponent.focus1.append('g')
        .attr("clip-path", "url(#clip1)");

    // Create gyro plot lines
    FocusChildComponent.lines_f1.selectAll(".line")
        .data(FocusChildComponent.gyro_values)
        .enter()
          .append("path")
          .attr("class", "line")  // I add the class line to be able to modify this line later on.
          .attr("fill", "none")
          .attr("stroke", d => { return colors_f1[FocusChildComponent.gyro_values.indexOf(d)]})
          .attr("stroke-width", this.strokeWidth)
          .attr("d", FocusChildComponent.setLine_f1());

    //Focus2
    // Color palette
    var colors_f2 = ['#e41a1c','#377eb8','#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

    // Assign line group to variable `line`
    FocusChildComponent.lines_f2 = FocusChildComponent.focus2.append('g')
        .attr("clip-path", "url(#clip2)");

    // Create accl plot lines
    FocusChildComponent.lines_f2.selectAll(".line")
        .data(FocusChildComponent.accl_values)
        .enter()
          .append("path")
          .attr("class", "line")  // I add the class line to be able to modify this line later on.
          .attr("fill", "none")
          .attr("stroke", d => { return colors_f2[FocusChildComponent.accl_values.indexOf(d)]})
          .attr("stroke-width", this.strokeWidth)
          .attr("d",FocusChildComponent.setLine_f2());

     //Focus3
    // Create line variable
    FocusChildComponent.line_f3 = FocusChildComponent.focus3.append('g')
        .attr("clip-path", "url(#clip3)");

        // Append single plot line
    FocusChildComponent.line_f3.append("path")
        .datum(FocusChildComponent.alt_values)
        .attr("class", "line_f3")
        .attr("stroke", "magenta")
        .attr("fill-opacity", "0%")
        .attr("fill", "none")
        .attr("stroke-width", this.strokeWidth)
        //.attr("transform", "translate(0," + -55 + ")")
        .attr("d", FocusChildComponent.setLine_f3());  
  }

   private createAnnotBrushGroup(){
    FocusChildComponent.annotBrushesGroup = FocusChildComponent.annotChart1.append('g')
        .attr("class", "annot_brushes")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
 
  //   // Create annotation brush  // OLD one
  //   FocusChildComponent.annotationBrush = d3.brushX()
  //       .extent([[0,0], [FocusChildComponent.width, this.annotationBrushHeight]])
  //       .on("brush", this.annotationBrushed);
   }


  static newAnnotBrush(){
    var brush = d3.brushX()
        .extent([[0,0], [FocusChildComponent.width, this.annotBrushOverlayHeight]])
        .on("start", this.annotBrushStart)
        .on("brush", this.annotBrushed)
        .on("end", this.annotBrushEnd);

    FocusChildComponent.annotBrushes.push({id: FocusChildComponent.annotBrushes.length, brush: brush});

    this.annotBrushStart();
    this.annotBrushed();
    this.annotBrushEnd();

    this.drawAnnotBrushes();
  }

  static annotBrushStart(){

  }

  static annotBrushed(){

  }

  static annotBrushEnd(){
    // Figure out if our latest brush has a selection
    var lastBrushID = FocusChildComponent.annotBrushes[FocusChildComponent.annotBrushes.length - 1].id;
    var lastBrush = document.getElementById('brush-' + lastBrushID);

    if(lastBrush instanceof SVGGElement){
      var selection = d3.brushSelection(lastBrush) ; 
    }

    if(selection != null){ // working on a better method on zoomed()
      FocusChildComponent.lastSelection = selection;
    }
    
    // If it does, that means we need another one
    if (selection && selection[0] !== selection[1]) {
      FocusChildComponent.newAnnotBrush();
    }

    this.drawAnnotBrushes
  }

  static drawAnnotBrushes(){
    var brushSelection = FocusChildComponent.annotBrushesGroup.selectAll('.brush')
    .data(FocusChildComponent.annotBrushes, function (d){return d.id});

    // Set up new brushes
    brushSelection.enter()
    .insert("g", '.brush')
    .attr('class', 'brush')
    .attr('id', function(brush){ return "brush-" + brush.id; })
    .each(function(brushObject) {
      //call the brush
      brushObject.brush(d3.select(this));
    });
    //console.log("brushSelection",brushSelection);

    // Remove pointer events on brush overlays
    brushSelection
      .each(function (brushObject){
        d3.select(this)
          .attr('class', 'brush')
          .selectAll('.overlay')
          .style('pointer-events', function() {
            var brush = brushObject.brush;
            if (brushObject.id === FocusChildComponent.annotBrushes.length-1 && brush !== undefined) {
              return 'all';
            } else {
              return 'none';
            }
          });
      })

  brushSelection.exit()
    .remove();
  }



  private createZoom(){
    // Create zoom feature
    FocusChildComponent.zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [FocusChildComponent.width, FocusChildComponent.height]])
    .extent([[0, 0], [FocusChildComponent.width, FocusChildComponent.height]])
    .on("zoom", FocusChildComponent.zoomed);
  }

  private addElements(){

    // Context
    // Appends line to Context
    FocusChildComponent.context.append("path")
        .datum(FocusChildComponent.gyro_values[0])
        .attr("class", "contextLine")
        .attr("stroke", "#e41a1c")
        .attr("fill-opacity", "0%")
        .attr("stroke-width", this.strokeWidth)
        .attr("d", this.contextLine);

    // Appends x axis to Context
    FocusChildComponent.context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.contextHeight + ")")
        .call(FocusChildComponent.xAxis_context);

    // Appends brush to context, sets initial range
    FocusChildComponent.context.append("g")
        .attr("class", "main_brush")
        .call(FocusChildComponent.mainBrush)
        .call(FocusChildComponent.mainBrush.move, FocusChildComponent.x.range()); // sets initial brush state

    // Focus1
    // Appends X to focus svg group
    FocusChildComponent.focus1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + FocusChildComponent.focus1Height + ")")
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
        .attr("transform", "translate(0," + FocusChildComponent.focus2Height + ")")
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

    // Focus3
    FocusChildComponent.focus3.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + FocusChildComponent.focus3Height + ")")
    .call(FocusChildComponent.xAxis_f3);

    // Appends Y axis left
    FocusChildComponent.focus3.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxisLeft_f3);

    // Adds Y axis right 
    FocusChildComponent.focus3.append("g")
        .attr("class", "axis axis--yL")
        .attr("transform", "translate(" + FocusChildComponent.width + ",0)")
        .call(this.yAxisRight_f3)


    // Annotchart1
    // Appends x axis
    FocusChildComponent.annotChart1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.contextHeight + ")")
        .call(FocusChildComponent.xAxis_f1);

    // Append annotation brush
    // FocusChildComponent.svg.append("g")
    //     .attr("class", "annotationBrush")
    //     .attr("transform", "translate(" + FocusChildComponent.focus1Margin.left + "," + FocusChildComponent.focus1Margin.top + ")")
    //     .call(FocusChildComponent.annotationBrush);

    // Appends zoom to svg over focus1 area
    FocusChildComponent.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", FocusChildComponent.width)
        .attr("height", this.zoomHeight)
        .attr("fill-opacity", "0%")
        .attr("transform", "translate(" + FocusChildComponent.focus1Margin.left + "," + FocusChildComponent.focus1Margin.top + ")")
        .call(FocusChildComponent.zoom);

    // this.zoomToggle = d3.select(".zoomToggle")
    //     .attr("transform", "translate(" + 100 + "," + 100 + ")")
    //     .on('click', this.toggleZoom);

        
  }

  private createAnnotationsChart(){

    FocusChildComponent.annotChart1 = FocusChildComponent.svg.append("g")
        .attr("class", "annot_chart1")
        .attr("transform", "translate(40, 700)");
  }


  private createAnnotationEditor(){
    this.annotEditor = FocusChildComponent.svg.append("g")
        .attr("id", "annotation_editor")
        .attr("transform", "translate(40,830)")

    this.annotBtn = this.annotEditor.append("g")
        .attr("class", "annotate_button")
        .attr("transform", "translate(0,0)")
        .on("click", this.toggleZoom)

    this.annotBtn.append("rect")
        .attr("width", 80)
        .attr("height", 40)
        .attr("fill", "gray");
        
    this.annotBtn.append("text")
        .attr("dy", (40/2 + 5))
        .attr("dx", 80/2)
        .style("text-anchor", "middle")
        .text("Annotate");

    this.annotSaveBtn = this.annotEditor.append("g")
        .attr("class", "save_button")
        .attr("transform", "translate(90,0)")
        .on("click", this.saveAnnotation)

    this.annotSaveBtn.append("rect")
        .attr("width", 80)
        .attr("height", 40)
        .attr("fill", "gray");

    this.annotSaveBtn.append("text")
        .attr("dy", (40/2 + 5))
        .attr("dx", 80/2)
        .style("text-anchor", "middle")
        .text("Save");
  }

private toggleAnnotationMode(){

}

  private toggleZoom(){
    // toggle zoom on/off
   // d3.select(window).on("click", function() {  // Should be a button instead of whole window

      console.log("Toggling zoom");
      FocusChildComponent.zoomEnabled = !FocusChildComponent.zoomEnabled;

       // Too hacky
       if (FocusChildComponent.zoomEnabled){
        FocusChildComponent.svg.select(".zoom")
            .attr("fill", "none");
        } else {
            FocusChildComponent.svg.select(".zoom")
            .attr("fill", "white");
        }

      // if (FocusChildComponent.zoomEnabled){   // Should work, but doesnt
      //   console.log("on");
      //   FocusChildComponent.svg.select(".zoom")
      //       .call(FocusChildComponent.zoom);
      // } else {
      //   console.log("off");
      //   FocusChildComponent.svg.select(".zoom")
      //       .on('zoom', null);
      // }

     
    //}
  }
  
  private saveAnnotation(){

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
      FocusChildComponent.alt_values.push({"date": d.date, "val": d.alt});
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

    this.alt_domain = d3.extent(FocusChildComponent.alt_values, d => { return d.val; });

    // console.log(FocusChildComponent.alt_values);

    // console.log("max accl0",Math.max.apply(null, test0));
    // console.log("max accl1",Math.max.apply(null, test1));
    // console.log("max accl2",Math.max.apply(null, test2));
    // console.log("min accl0",Math.min.apply(null, test0));
    // console.log("min accl1",Math.min.apply(null, test1));
    // console.log("min accl2",Math.min.apply(null, test2));

    // Any of the streams should do
    this.date_domain = d3.extent(gyro_0, d => { return d.date }); 
  }

  private getTransform(){

  }

  static brushed(){ // Brush event handler
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || FocusChildComponent.x_context.range();
    //var t = d3.event.transform;
    FocusChildComponent.x.domain(s.map(FocusChildComponent.x_context.invert, FocusChildComponent.x_context));
    FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine_f1());
    FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxis_f1);
    FocusChildComponent.focus2.selectAll(".line").attr("d", FocusChildComponent.setLine_f2());
    FocusChildComponent.focus2.select(".axis--x").call(FocusChildComponent.xAxis_f2);
    FocusChildComponent.focus3.select(".line_f3").attr("d", FocusChildComponent.setLine_f3());
    FocusChildComponent.focus3.select(".axis--x").call(FocusChildComponent.xAxis_f3);
    FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxis_f1);

    //console.log("sel",d3.event.selection);
    var t = {k: Math.abs(FocusChildComponent.width/(s[0]-s[1])), x:-s[0], y: FocusChildComponent.width-s[1]};
    //console.log("tbrush",t)
    function applyX(x, t) {
      return x * t.k + t.x;
    }
    //console.log([applyX(FocusChildComponent.lastSelection[0],t),applyX(FocusChildComponent.lastSelection[0],t)]);
    // if(FocusChildComponent.lastSelection){
    //   FocusChildComponent.annotChart1.select("#brush-0").call(FocusChildComponent.annotBrushes[0].brush.move, [applyX(FocusChildComponent.lastSelection[0],t),applyX(FocusChildComponent.lastSelection[1],t)]);
    // }

  

    
    // console.log("tbrush:", t);
    //console.log("s0", s[0])

    

    // if(FocusChildComponent.lastSelection){
    //   FocusChildComponent.annotChart1.select("#brush-0").call(FocusChildComponent.annotBrushes[0].brush.move, FocusChildComponent.lastSelection.map(t.applyX, t));
    // }
    

    
    //console.log("smap",s.map(FocusChildComponent.x_context.invert, FocusChildComponent.x_context));

    FocusChildComponent.svg.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
        .scale(FocusChildComponent.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  // private annotationBrushed(){
  //   // Handler for annotation brush
  //   if(d3.event.sourceEvent && d3.event.sourceEvent.shiftKey){
  //   console.log("shift"); 
  //   }
  // }

  static zoomed() { // Zoom event handler
    
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x_context).domain()); // sets domain to scale with transform
    FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine_f1());
    FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxis_f1);
    FocusChildComponent.focus2.selectAll(".line").attr("d", FocusChildComponent.setLine_f2());
    FocusChildComponent.focus2.select(".axis--x").call(FocusChildComponent.xAxis_f2);
    FocusChildComponent.focus3.select(".line_f3").attr("d", FocusChildComponent.setLine_f3());
    FocusChildComponent.focus3.select(".axis--x").call(FocusChildComponent.xAxis_f3);
    FocusChildComponent.context.select(".main_brush").call(FocusChildComponent.mainBrush.move, FocusChildComponent.x.range().map(t.invertX, t));
    
    // Update annotChart1
    FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxis_f1);

    // WORKS: just a single brush 
    //FocusChildComponent.annotChart1.select("#brush-0").call(FocusChildComponent.annotBrushes[0].brush.move, FocusChildComponent.lastSelection.map(t.applyX, t));
    //console.log("single",FocusChildComponent.annotChart1.select("#brush-0"));

    // TESTING
    // console.log("lastSel:", FocusChildComponent.lastSelection)
    //  console.log("applyX:", FocusChildComponent.lastSelection.map(t.applyX, t))

    // var test = document.getElementById('brush-1');
    // if(test instanceof SVGGElement){
    //   var brushSelection = d3.brushSelection(test);
    // //   //console.log("test", d3.brushSelection(test));
    //   if(brushSelection != null){
    // //     //FocusChildComponent.annotChart1.select("#brush-" + FocusChildComponent.annotBrushes[1].id).call(FocusChildComponent.annotBrushes[1].brush.move, [t.applyX(brushSelection[0]),t.applyX(brushSelection[1])]);
    // //     FocusChildComponent.annotChart1.select("#brush-1").call(FocusChildComponent.annotBrushes[1].brush.move, FocusChildComponent.lastSelection.map(t.applyX, t));
    //     console.log("wadayayay:",[t.applyX(brushSelection[0]),t.applyX(brushSelection[1])]);
    //   }
    // }
    

    // BUGGY: Update all brushes when zooming
    FocusChildComponent.annotBrushes.forEach((brushObject:any) => {
      var brush = document.getElementById('brush-'+ brushObject.id);

      if(brush instanceof SVGGElement){
        FocusChildComponent.brushSelection = d3.brushSelection(brush);
        if(FocusChildComponent.brushSelection != null){
        ////console.log("brushSelection" + brushObject.id, brushSelection)
        //FocusChildComponent.annotChart1.select("#brush-" + brushObject.id).call(brushObject.brush.move, [t.applyX(brushSelection[0],t),t.applyX(brushSelection[1],t)]);
        FocusChildComponent.annotChart1.select("#brush-" + brushObject.id).call(brushObject.brush.move, FocusChildComponent.brushSelection.map(t.applyX, t));
        //FocusChildComponent.annotChart1.select("#brush-" + brushObject.id).call(brushObject.brush.move, brushSelection.forEach( item => {return }));
        }      
      }
    });
    
    // DOES NOT WORK: Using .each() 
    // FocusChildComponent.annotChart1.selectAll(".brush").each(brushObject => {
    //   var brushNode = document.getElementById('brush-'+ brushObject.id);
    //   if(brushNode instanceof SVGGElement){
    //     FocusChildComponent.brushSelection = d3.brushSelection(brushNode);
    //     console.log(FocusChildComponent.brushSelection);
    //     if(FocusChildComponent.brushSelection != null){
          
    //     FocusChildComponent.annotBrushes[brushObject.id].brush.move(brushObject, FocusChildComponent.brushSelection.map(t.applyX, t)) 
    //     }
    //   }
    // })

  }

}
