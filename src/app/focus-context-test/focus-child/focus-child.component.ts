import { Component, OnInit, ViewEncapsulation, ElementRef, Input, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { DataService } from '../../data.service'
import { DataParserService } from '../../data-parser.service'
import { NbInputModule} from '@nebular/theme';

@Component({
  selector: 'app-focus-child',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './focus-child.component.html',
  styleUrls: ['./focus-child.component.scss'],
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
  public yAxisLeft_f2;
  public yAxisLeft_f3;
  contextMargin;
  static height;
  contextHeight;
  static width;
  static contextBrush;
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
  marginTop_f1;
  marginTop_f2;
  marginTop_f3;
  marginTop_annotChart1;
  martinTop_annotEditor;
  annotEditorHeight;
  static focus1Height;
  static focus2Height;
  static focus3Height;
  static annotChart1Height;
  stackedHeight;
  strokeWidth = "0.5";
  spacer1;
  spacer2;
  margin;
  static lastSelection;
  static brushSelection;
  annotEditor;
  annotModeEnabled = false;
  static highlighterBrush;
  highlighterBrushOverlayHeight;
  startDate;
  endDate;
  selectedObj;
  static annotations;
  themeField;
  subThemeField;
  notesField;
  newAnnotation;
  static annotChart1;
  static annotBrushes = []; // Keep track of annot brushes
  static annotBrushesGroup; // SVG group where annot brushes go
  static annotBrushOverlayHeight;
  displayAnnotationForm = false;
  loading = false;
  status; 
  showChartInfo;
  displayDateFrom;
  displayDateTo;
  displayRideMinutes;
  annotateBtnText = "Annotate";
  disableSave = true;
  enableAnnotFields = false;


  toEpoch = d3.timeFormat("%Q");

  constructor(
    private elRef: ElementRef,
    private data_service: DataService,
    private data_parser: DataParserService) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
  }
  
  public getData(startDate, endDate, selectedObj) {
    // clear svg before
    this.removeExistingChartFromParent();

    // Create chart once data has been loaded
    this.showChartInfo = false;
    this.displayAnnotationForm = false;
    this.loading = true;
    this.status = "Loading chart.."
    this.startDate = startDate;
    this.endDate = endDate;
    this.selectedObj = selectedObj;
    var selectedVis = ["acceleration", "gyroscope", "gps"];

   

    this.data_service.getGoProData(this.startDate, this.endDate, this.selectedObj, selectedVis, 1).subscribe((response) => {
      if(response.data.length > 0){
        this.createChart(this.data_parser.parseData(response.data));
      }
      else{
        console.log("Unable to plot because data selection is empty!")
        this.status = "No data available for the selected parameters"
      }
    },
    err =>{
      console.log(err);
      this.status = "Server error. Probably no data available for the selected parameters.";
    });
  }

  private getAnnotations() {
    this.data_service.getAnnotations(this.selectedObj, this.startDate, this.endDate).subscribe((response) => {
      FocusChildComponent.annotations = this.data_parser.parseAnnotations(response.data);
      console.log("Total annotations found:", Object.keys(FocusChildComponent.annotations).length);
      // Draw annotations once received from server
      this.drawAnnotationBrushesFromData();
    });
  }

  private addAnnotation(theme, subtheme, startDate, endDate, notes) {

    var annotation = {
      theme: theme,
      subtheme: subtheme,
      startDate: startDate,
      endDate: endDate,
      notes: notes
    };
    this.data_service.addAnnotation(annotation, this.selectedObj).subscribe(resp => {
      return resp;
    });
  }

  private deleteAnnotation(annotation) {
    this.data_service.deleteAnnotation(annotation).subscribe(resp => {
      console.log("deleteAnnotation result:", resp)
      return resp;
    });
  }

  private createChart(objs) {
    // Take data in
    FocusChildComponent.gyro_values = objs.gyro;
    FocusChildComponent.accl_values = objs.accl;
    FocusChildComponent.alt_values = objs.gps_alt;
    this.gyro_domain = objs.gyro_domain;
    this.accl_domain = objs.accl_domain;
    this.alt_domain = objs.alt_domain;
    this.date_domain = objs.date_domain;

    this.loading = false;

    this.setChartDimensions();

    this.setChartInfo();

    this.setAxis();

    this.setContextBrush();

    this.createContextChart();

    this.createFocusCharts(); // Includes: Gyro, Accl, Elevation

    this.createAnnotationsChart();

    this.createContextLine();

    this.createPlotLines();

    this.createAnnotBrushSVGGroup();

    FocusChildComponent.newAnnotBrush(); // Set first empty brush

    this.getAnnotations(); // Triggers => drawAnnotFromData()

    this.createZoom(); // Includes zoom toggle

    this.addElements();

    this.displayAnnotationForm = true;
    this.showChartInfo = true;
  }

  private setChartDimensions() {

    // Max units of the viewbox
    var viewBoxWidth = 800;
    this.spacer1 = 25;
    this.spacer2 = 0;
    this.contextHeight = 80;
    FocusChildComponent.annotChart1Height = 80
    this.annotEditorHeight = 200;
    FocusChildComponent.focus1Height = 170;
    FocusChildComponent.focus2Height = 170;
    FocusChildComponent.focus3Height = 170;
    this.margin = { top: 0, right: 0, bottom: 0, left: 25 };
    this.marginTop_f1 = this.margin.top + this.contextHeight + this.spacer1;
    this.marginTop_f2 = this.marginTop_f1 + FocusChildComponent.focus1Height + this.spacer2; 
    this.marginTop_f3 = this.marginTop_f2 + FocusChildComponent.focus2Height + this.spacer2; 
    this.marginTop_annotChart1 = this.marginTop_f3 + FocusChildComponent.focus3Height + this.spacer1;
    this.martinTop_annotEditor = this.marginTop_annotChart1 + FocusChildComponent.annotChart1Height + this.spacer1;
    this.zoomHeight = FocusChildComponent.focus1Height + FocusChildComponent.focus1Height + FocusChildComponent.focus1Height + this.spacer2 * 2;
    // this.stackedHeight = this.annotEditorHeight + this.martinTop_annotEditor + this.margin.bottom;
    this.stackedHeight =  this.martinTop_annotEditor + this.margin.bottom;
    FocusChildComponent.width = viewBoxWidth - this.margin.right - this.margin.left;
    this.highlighterBrushOverlayHeight = FocusChildComponent.focus1Height + FocusChildComponent.focus1Height + FocusChildComponent.focus3Height + this.spacer2 *2;
    
    this.hostElement = document.getElementById("mainChart");
    FocusChildComponent.svg = d3.select(this.hostElement).append('svg')
      .attr('width', "100%")
      .attr('height', "100%")
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + this.stackedHeight)

    //Viewbox debug
    FocusChildComponent.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'white')
  }

  private setAxis() {

    // Context
    // X time scale set range and domain
    FocusChildComponent.x_context = d3.scaleTime()
      .domain(this.date_domain)
      .range([0, FocusChildComponent.width]);

    // Y2
    this.y_context = d3.scaleLinear().range([this.contextHeight, 0]);
    this.y_context.domain([this.gyro_domain[0] * 1.05, this.gyro_domain[1] * 1.05]);

    // Apply X2 (no yAxis on context..yet)
    FocusChildComponent.xAxis_context = d3.axisBottom(FocusChildComponent.x_context);

    // Focus1
    // Set X time scale
    FocusChildComponent.x = d3.scaleTime()
      .domain(FocusChildComponent.x_context.domain()) // shared with context X 
      .range([0, FocusChildComponent.width]);

    var plotMarginFactor = 1.1;

    // Set Y scale
    var plotMargin = this.gyro_domain[0] * plotMarginFactor;
    FocusChildComponent.y_f1 = d3.scaleLinear().range([FocusChildComponent.focus1Height, 0]);
    FocusChildComponent.y_f1.domain([this.gyro_domain[0] * plotMarginFactor, this.gyro_domain[1] * plotMarginFactor]); // Add a bit of margin

    // Apply X scale to axis
    FocusChildComponent.xAxis_f1 = d3.axisBottom(FocusChildComponent.x);
    // Apply Y scale to axis
    this.yAxisLeft_f1 = d3.axisLeft(FocusChildComponent.y_f1);

    // Focus2 (x scale same as focus1)
    // Set Y scale
    FocusChildComponent.y_f2 = d3.scaleLinear().range([FocusChildComponent.focus2Height, 0]);

    FocusChildComponent.y_f2.domain([this.accl_domain[0] * plotMarginFactor, this.accl_domain[1] * plotMarginFactor]); // Add a bit of margin
    FocusChildComponent.xAxis_f2 = d3.axisBottom(FocusChildComponent.x);
    this.yAxisLeft_f2 = d3.axisLeft(FocusChildComponent.y_f2); // these could go. too verbose

    // Focus3 
    // Set Y scale
    FocusChildComponent.y_f3 = d3.scaleLinear().range([FocusChildComponent.focus3Height, 0]);
    FocusChildComponent.y_f3.domain([ this.alt_domain[0]-0.5, this.alt_domain[1]+0.5 ]); // Add a bit of margin
    // FocusChildComponent.y_f3.domain(this.alt_domain); // Add a bit of margin
    FocusChildComponent.xAxis_f3 = d3.axisBottom(FocusChildComponent.x); // x scale same as focus1
    this.yAxisLeft_f3 = d3.axisLeft(FocusChildComponent.y_f3); // these could go. too verbose

  }

  private setContextBrush() {
    // Create context brush feature
    FocusChildComponent.contextBrush = d3.brushX()
      .extent([[0, 0], [FocusChildComponent.width, this.contextHeight]])
      .on("brush", FocusChildComponent.brushed);
  }

  private createContextChart() {
    // Create context svg group and position
    FocusChildComponent.context = FocusChildComponent.svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Draw bounding box
    FocusChildComponent.context.append('rect')
    .attr("class", "bbox")
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', FocusChildComponent.width)
    .attr('height', this.contextHeight)
    .attr('fill', 'white')
    .attr('stroke', 'black');
  }

  private createFocusCharts() {
    // Focus1
    // Create acceleration focus
    FocusChildComponent.focus1 = FocusChildComponent.svg.append("g")
      .attr("class", "focus1")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")");

    // Add clip path to svg
    FocusChildComponent.focus1.append("defs").append("clipPath")
      .attr("id", "clip1")
      .append("rect")
      .attr("width", FocusChildComponent.width)
      .attr("height", FocusChildComponent.focus1Height);

    FocusChildComponent.focus1.append('rect')
      .attr("class", "bbox")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', FocusChildComponent.width)
      .attr('height', FocusChildComponent.focus1Height)
      .attr('fill', 'white')
      .attr('stroke', 'black');

    // Focus2
    FocusChildComponent.focus2 = FocusChildComponent.svg.append("g")
      .attr("class", "focus2")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f2 + ")");

    // Add clip path to svg
    FocusChildComponent.focus2.append("defs").append("clipPath")
      .attr("id", "clip2")
      .append("rect")
      .attr("width", FocusChildComponent.width)
      .attr("height", FocusChildComponent.focus2Height);

      FocusChildComponent.focus2.append('rect')
      .attr("class", "bbox")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', FocusChildComponent.width)
      .attr('height', FocusChildComponent.focus2Height)
      .attr('fill', 'white')
      .attr('stroke', 'black');

    // Focus3    
    FocusChildComponent.focus3 = FocusChildComponent.svg.append("g")
      .attr("class", "focus3")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f3 + ")");

    // Add clip path to svg
    FocusChildComponent.focus3.append("defs").append("clipPath")
      .attr("id", "clip3")
      .append("rect")
      .attr("width", FocusChildComponent.width)
      .attr("height", FocusChildComponent.focus3Height);

    FocusChildComponent.focus3.append('rect')
      .attr("class", "bbox")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', FocusChildComponent.width)
      .attr('height', FocusChildComponent.focus3Height)
      .attr('fill', 'white')
      .attr('stroke', 'black');
  }

  private createContextLine() {
    // Create context line
    this.contextLine = d3.line()
      .x((d: any) => { return FocusChildComponent.x_context(d.date); })
      .y((d: any) => { return this.y_context(d.val); });
  }

  static setLine_f1() {
    return d3.line()
      .x((d: any) => { return FocusChildComponent.x(d.date) })
      .y((d: any) => { return FocusChildComponent.y_f1(d.val) })
  }

  static setLine_f2() {
    return d3.line()
      .x((d: any) => { return FocusChildComponent.x(d.date) })
      .y((d: any) => { return FocusChildComponent.y_f2(d.val) })
  }

  static setLine_f3() {
    return d3.line()
      .x((d: any) => { return FocusChildComponent.x(d.date) })
      .y((d: any) => { return FocusChildComponent.y_f3(d.val) })
  }

  private createPlotLines() {
    // Focus1
    // Color palette
    var colors_f1 = ['#e41a1c', '#377eb8', '#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

    // Assign line group to variable `line`
    FocusChildComponent.lines_f1 = FocusChildComponent.focus1.append('g')
      .attr("clip-path", "url(#clip1)");

    // Create gyro plot lines on focus1
    FocusChildComponent.lines_f1.selectAll(".line")
      .data(FocusChildComponent.gyro_values)
      .enter()
      .append("path")
      .attr("class", "line")  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", d => { return colors_f1[FocusChildComponent.gyro_values.indexOf(d)] })
      .attr("stroke-width", this.strokeWidth)
      .attr("d", FocusChildComponent.setLine_f1());

    //Focus2
    // Color palette
    var colors_f2 = ['#e41a1c', '#377eb8', '#4daf4a', '#e41a1c', '#FF00FF', '#000000'];

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
      .attr("stroke", d => { return colors_f2[FocusChildComponent.accl_values.indexOf(d)] })
      .attr("stroke-width", this.strokeWidth)
      .attr("d", FocusChildComponent.setLine_f2());

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

  private createAnnotBrushSVGGroup() {
    FocusChildComponent.annotBrushesGroup = FocusChildComponent.annotChart1.append('g')
      .attr("class", "annot_brushes")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")

    // Create highlighter brush  
      FocusChildComponent.highlighterBrush = d3.brushX()
          .extent([[0,0], [FocusChildComponent.width, this.highlighterBrushOverlayHeight]])
          .on("end", this.highlightBrushed.bind(this));
  }



  private drawAnnotationBrushesFromData() {
    
    // Build an array of brushes from annotation data
    // Use id from annotation to make brush
    for (var key in FocusChildComponent.annotations) {
      FocusChildComponent.annotBrushes.push({ id: key,
                                              brush: FocusChildComponent.makeBrush(),
                                              theme: FocusChildComponent.annotations[key].theme,
                                              subtheme: FocusChildComponent.annotations[key].subtheme,
                                              notes: FocusChildComponent.annotations[key].notes });
    }

    // Select brushes we just created
    var brushSelection = FocusChildComponent.annotBrushesGroup.selectAll('.brush')
      .data(FocusChildComponent.annotBrushes, d => { return d.id });

    // Iterate over annotations and draw corresponding brushes
    brushSelection.enter()
      .insert('g', '.brush')
      .attr('class', 'brush')
      .attr('id', d => `brush-${d.id}`)
      .each(function (brushObj) {
        // this init's the brush
        brushObj.brush(d3.select(this));
        // Move brush in place using annotation start/end dates
        brushObj.brush.move(d3.select(this), [
          FocusChildComponent.x(FocusChildComponent.annotations[brushObj.id].startDate),
          FocusChildComponent.x(FocusChildComponent.annotations[brushObj.id].endDate)
        ]);
      })

      // Disable overlay events
      //FocusChildComponent.annotBrushesGroup.selectAll('.overlay').style('pointer-events', 'none');

      // Disable dragging annotation brushes 
      for(var key in FocusChildComponent.annotations){
        FocusChildComponent.annotChart1.select('#brush-' + key).style('pointer-events', 'none');
      }
  }

  static makeBrush() {
    // Empty brush
    return d3.brushX()
      .extent([[0, 0], [FocusChildComponent.width, FocusChildComponent.annotChart1Height]])
      .on("start", FocusChildComponent.annotBrushStart)
      .on("brush", FocusChildComponent.annotBrushed)
      .on("end", FocusChildComponent.annotBrushEnd);
  }

  private highlightBrushed(){
    this.enableAnnotFields = false;
    // Creates a new annotation-like object that we can later write to the server
    // Get higlighter brush selection
    var higlighterEl = document.getElementById('highlighterBrush');
    if (higlighterEl instanceof SVGGElement) {
      var higlighterSel = d3.brushSelection(higlighterEl); 
      this.newAnnotation = {  startEpoch: Number(this.toEpoch(FocusChildComponent.x.invert(higlighterSel[0]))),
                              endEpoch: Number(this.toEpoch(FocusChildComponent.x.invert(higlighterSel[1]))), 
                              theme: "test theme", 
                              subtheme: "test subtheme", 
                              notes: "test notes"};
    }    
  }

  static newAnnotBrush() {

    // this could be a class of brush obj
    FocusChildComponent.annotBrushes.push({ id: FocusChildComponent.annotBrushes.length, 
                                            brush: FocusChildComponent.makeBrush(), 
                                            theme: "theme", 
                                            subtheme: "subtheme", 
                                            notes: "notes"});

    // this.annotBrushStart();
    // this.annotBrushed();
    // this.annotBrushEnd();
    this.drawAnnotBrushes();
    // Disable overlay
    FocusChildComponent.annotBrushesGroup.selectAll('.overlay').style('pointer-events', 'none');
  }

  static annotBrushStart() {

  }

  static annotBrushed() {

  }

  static annotBrushEnd() {
    // Figure out if our latest brush has a selection
    var lastBrushID = FocusChildComponent.annotBrushes[FocusChildComponent.annotBrushes.length - 1].id;
    var lastBrush = document.getElementById('brush-' + lastBrushID);

    if (lastBrush instanceof SVGGElement) {
      var selection = d3.brushSelection(lastBrush);
    }

    if (selection != null) { // <- temporary: working on a better method on zoomed()
      FocusChildComponent.lastSelection = selection;
    }

    // If it does, that means we need another one
    if (selection && selection[0] !== selection[1]) {
      FocusChildComponent.newAnnotBrush();
    }
  }

  static drawAnnotBrushes() {
  
    var brushSelection = FocusChildComponent.annotBrushesGroup.selectAll('.brush')
      .data(FocusChildComponent.annotBrushes, d => { return d.id });

    // Set up new brushes
    brushSelection.enter()
      .insert("g", '.brush')
      .attr('class', 'brush')
      .attr('id', function (brush) { return "brush-" + brush.id; })
      .each(function (brushObject) {
        //call the brush
        brushObject.brush(d3.select(this));
      });

    // Remove pointer events on brush overlays
    brushSelection
      .each(function (brushObject) {
        d3.select(this)
          .attr('class', 'brush')
          .selectAll('.overlay')
          .style('pointer-events', function () {
            var brush = brushObject.brush;
            if (brushObject.id === FocusChildComponent.annotBrushes.length - 1 && brush !== undefined) {
              return 'all';
            } else {
              return 'none';
            }
          });
      })

    brushSelection.exit()
      .remove();
  }

  private resetBrushes(){
    // Clears brushes, reset vars and reloads from server
    console.log("Clearing all brushes");
    FocusChildComponent.annotBrushes.forEach((brushObject:any) => {
      d3.select('#brush-'+ brushObject.id).remove();
    });
    d3.select('#highlighterBrush').remove();
    FocusChildComponent.annotBrushes = [];
    FocusChildComponent.newAnnotBrush();
    // Get new annotations and redraw brushes
    this.getAnnotations();
  }

  private createZoom() {
    // Create zoom feature
    FocusChildComponent.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [FocusChildComponent.width, this.zoomHeight]])
      .extent([[0, 0], [FocusChildComponent.width, this.zoomHeight]])
      .on("zoom", FocusChildComponent.zoomed);
  }

  private addElements() {
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
      .call(FocusChildComponent.contextBrush)
      .call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range()); // sets initial brush state

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

    // Focus2
    FocusChildComponent.focus2.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + FocusChildComponent.focus2Height + ")")
      .call(FocusChildComponent.xAxis_f2);

    // Appends Y to focus svg group
    FocusChildComponent.focus2.append("g")
      .attr("class", "axis axis--y")
      .call(this.yAxisLeft_f2);

    // Focus3
    FocusChildComponent.focus3.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + FocusChildComponent.focus3Height + ")")
      .call(FocusChildComponent.xAxis_f3);

    // Appends Y axis left
    FocusChildComponent.focus3.append("g")
      .attr("class", "axis axis--y")
      .call(this.yAxisLeft_f3);

    // Annotchart1
    // Appends x axis
    FocusChildComponent.annotChart1.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.contextHeight + ")")
      .call(FocusChildComponent.xAxis_f1);

    // Append annotation brush
    FocusChildComponent.svg.append("g")
        .attr("id", "highlighterBrush")
        .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")")
        .call(FocusChildComponent.highlighterBrush);

    // Appends zoom to svg over focus1 area
    FocusChildComponent.svg.append("rect")
      .attr("class", "zoom")
      .attr("width", FocusChildComponent.width)
      .attr("height", this.zoomHeight)
      .attr("fill-opacity", "0%")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")")
      .call(FocusChildComponent.zoom);
  }

  private createAnnotationsChart() {

    FocusChildComponent.annotChart1 = FocusChildComponent.svg.append("g")
      .attr("class", "annot_chart1")
      .attr("transform", "translate(" + this.margin.left +"," + this.marginTop_annotChart1 +")");

    // Draw bounding box
    FocusChildComponent.annotChart1.append('rect')
    .attr("class", "bbox")
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', FocusChildComponent.width)
    .attr('height', this.contextHeight)
    .attr('fill', 'white')
    .attr('stroke', 'black');
  }

  private setChartInfo(){
  // Display range dates on top of chart
  this.displayDateFrom = this.date_domain[0].toLocaleDateString("en-GB", {weekday: 'long'}) + " " + this.date_domain[0].toLocaleString();
  this.displayDateTo = this.date_domain[1].toLocaleDateString("en-GB", {weekday: 'long'}) + " " + this.date_domain[1].toLocaleString();
  this.displayRideMinutes = Math.round(((this.date_domain[1].getTime() - this.date_domain[0].getTime()) / 60000) * 10)/10;
  }


// ANNOTATION CONTROL HANDLERS

toggleAnnotationMode(){  

  this.annotModeEnabled = ! this.annotModeEnabled;
  if(this.annotModeEnabled){
    console.log("annot mode ON");

    this.annotateBtnText = "Discard";

    // Enable dragging brushes
    for(var key in FocusChildComponent.annotations){
      FocusChildComponent.annotChart1.select('#brush-' + key).style('pointer-events', 'all');
    }

    // Re-enable highlighter
    if(d3.select('#highlighterBrush').empty()){
    FocusChildComponent.svg.append("g")
      .attr("id", "highlighterBrush")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")")
      .call(FocusChildComponent.highlighterBrush);}

    // Disable zoom
    FocusChildComponent.svg.select(".zoom")
      .attr("fill", "none");

    // Enable save button
    this.disableSave = false;

  }else{
    d3.select('#highlighterBrush').remove();

    console.log("annot mode OFF");
    
    // Update button text
    this.annotateBtnText = "Annotate";

    // Disable zoom
    FocusChildComponent.svg.select(".zoom")
      .attr("fill", "white");
    
    // Disable save button
    this.disableSave = true;
    this.resetBrushes();

    this.enableAnnotFields = true;
  }
}

saveAnnotations() { // To be called by save button in UI
  console.log("in annotBrushes", FocusChildComponent.annotBrushes.length)


  // Compute changes: which annotations have changed and need to be updated? (replaced)
  FocusChildComponent.annotBrushes.forEach((brushObject: any) => {
    // Get brush
    var brush = document.getElementById('brush-' + brushObject.id);
    if (brush instanceof SVGGElement) {
      // Get selection
      var selection = d3.brushSelection(brush);

      if (selection) {
        // console.log("current brushObject:",brushObject);
        var brushTheme = brushObject.theme,
            brushSubtheme = brushObject.subtheme,
            brushNotes = brushObject.notes,
            brushStartEpoch = Number(this.toEpoch(FocusChildComponent.x.invert(selection[0]))),
            brushEndEpoch = Number(this.toEpoch(FocusChildComponent.x.invert(selection[1])));

        // Filter brushes that contain edits
        if (Object.keys(FocusChildComponent.annotations).includes(brushObject.id)) {
          // There is probably a simpler way to compare dicts but I needed to convert timescale values to epoch
          var annotStartEpoch = FocusChildComponent.annotations[brushObject.id].startDateEpoch,
              annotEndEpoch = FocusChildComponent.annotations[brushObject.id].endDateEpoch,
              annotTheme = FocusChildComponent.annotations[brushObject.id].theme,
              annotSubtheme = FocusChildComponent.annotations[brushObject.id].subtheme,
              annotNotes = FocusChildComponent.annotations[brushObject.id].notes;

          // Check for changes on any of the fields
          if (brushStartEpoch != annotStartEpoch ||
            brushEndEpoch != annotEndEpoch ||
            brushTheme != annotTheme ||
            brushSubtheme != annotSubtheme ||
            brushNotes != annotNotes) {

            // Delete old annotation
            console.group("is contained",Object.keys(FocusChildComponent.annotations))
            console.log("Change detected replacing", brushObject.id);
            this.deleteAnnotation(brushObject.id)

            // Save new one
            // I am doing it like this because brushobject also stores the d3.brush which we dont need on the server
            this.addAnnotation(brushTheme, brushSubtheme, brushStartEpoch, brushEndEpoch, brushNotes);
          }
        }
        else {
          console.log("New brush detected:", brushObject.id);
          // Add new brush-annotations to server
          this.addAnnotation(brushTheme, brushSubtheme, brushStartEpoch, brushEndEpoch, brushNotes);
        }
      }
    }
  });

  if(this.newAnnotation){
    console.log("new brush annotatition");
    this.addAnnotation(this.newAnnotation.theme, this.newAnnotation.subtheme, this.newAnnotation.startEpoch, this.newAnnotation.endEpoch, this.newAnnotation.notes )
    this.newAnnotation = null;
  }
  else{
    console.log("no new annotations");
  }
  
  this.toggleAnnotationMode();
}



  static brushed() { // Brush event handler
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    // var s = d3.event.selection || FocusChildComponent.x_context.range();
    // //var t = d3.event.transform;
    // FocusChildComponent.x.domain(s.map(FocusChildComponent.x_context.invert, FocusChildComponent.x_context));
    // FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine_f1());
    // FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxis_f1);
    // FocusChildComponent.focus2.selectAll(".line").attr("d", FocusChildComponent.setLine_f2());
    // FocusChildComponent.focus2.select(".axis--x").call(FocusChildComponent.xAxis_f2);
    // FocusChildComponent.focus3.select(".line_f3").attr("d", FocusChildComponent.setLine_f3());
    // FocusChildComponent.focus3.select(".axis--x").call(FocusChildComponent.xAxis_f3);
    // FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxis_f1);

    // FocusChildComponent.svg.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
    //   .scale(FocusChildComponent.width / (s[1] - s[0]))
    //   .translate(-s[0], 0));
  }

  
  static zoomed() { // Zoom event handler

    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    // var t = d3.event.transform;
    // FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x_context).domain()); // sets domain to scale with transform
    // FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine_f1());
    // FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxis_f1);
    // FocusChildComponent.focus2.selectAll(".line").attr("d", FocusChildComponent.setLine_f2());
    // FocusChildComponent.focus2.select(".axis--x").call(FocusChildComponent.xAxis_f2);
    // FocusChildComponent.focus3.select(".line_f3").attr("d", FocusChildComponent.setLine_f3());
    // FocusChildComponent.focus3.select(".axis--x").call(FocusChildComponent.xAxis_f3);
    // FocusChildComponent.context.select(".main_brush").call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range().map(t.invertX, t));

    // // Update annotChart1
    // FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxis_f1);

    // // WORKS: just a single brush 
    // FocusChildComponent.annotChart1.select("#brush-0").call(FocusChildComponent.annotBrushes[0].brush.move, FocusChildComponent.lastSelection.map(t.applyX, t));

    // // BUGGY: Update all brushes when zooming
    // FocusChildComponent.annotBrushes.forEach((brushObject: any) => {
    //   var brush = document.getElementById('brush-' + brushObject.id);

    //   if (brush instanceof SVGGElement) {
    //     FocusChildComponent.brushSelection = d3.brushSelection(brush);
    //     if (FocusChildComponent.brushSelection != null) {
    //       ////console.log("brushSelection" + brushObject.id, brushSelection)
    //       //FocusChildComponent.annotChart1.select("#brush-" + brushObject.id).call(brushObject.brush.move, [t.applyX(brushSelection[0],t),t.applyX(brushSelection[1],t)]);
    //       FocusChildComponent.annotChart1.select("#brush-" + brushObject.id).call(brushObject.brush.move, FocusChildComponent.brushSelection.map(t.applyX, t));
    //       //FocusChildComponent.annotChart1.select("#brush-" + brushObject.id).call(brushObject.brush.move, brushSelection.forEach( item => {return }));
    //     }
    //   }
    // });

  }

 private removeExistingChartFromParent(){
   // clears the svg before drawing a new one
  d3.select(this.hostElement).select('svg').remove();
 }

}
