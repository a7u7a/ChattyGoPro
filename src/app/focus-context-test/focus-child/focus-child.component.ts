import { Component, OnInit, ViewEncapsulation, ElementRef, Input, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { DataService } from '../../data.service'
import { DataParserService } from '../../data-parser.service'
import { NbInputModule } from '@nebular/theme';
import { brushSelection } from 'd3';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-focus-child',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './focus-child.component.html',
  styleUrls: ['./focus-child.component.scss'],
})

export class FocusChildComponent implements OnInit {
  static hostElement;
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
  static xAxisFocus;
  static xAxis_f2;
  static xAxis_f3;
  public yAxisLeft_f1;
  public yAxisLeft_f2;
  public yAxisLeft_f3;
  static contextHeight;
  static chartWidth;
  static contextBrush;
  static zoom;
  zoomHeight;
  static focus1;
  static focus2;
  static focus3;
  static context;
  static gyro_values;
  static accl_values;
  static alt_values = [];
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
  marginTop_annotChart;
  marginTop_annotControls;
  annotEditorHeight;
  static focus1Height;
  static focus2Height;
  static focus3Height;
  static annotHeight;
  chartHeight;
  strokeWidth = "0.5";
  spacer1;
  spacer2;
  margin;
  annotEditor;
  annotModeEnabled = false;
  static highlighterBrush;
  startDate;
  endDate;
  selectedObj;
  static annotations;
  newAnnotation;
  static annotChart1;
  static clip_annot1;
  static annotBrushes = []; // Keep track of annot brushes
  static annotBrushesGroup; // SVG group where annot brushes go
  displayAnnotationForm = false;
  isLoading = false;
  status;
  showChartInfo;
  displayDateFrom;
  displayDateTo;
  displayRideMinutes;
  annotateBtnText = "Annotate";
  disableDoneBtn = true;
  disableSaveBtn = true;
  disableDeleteBtn = true;
  disableAnnotationFields = false;
  themeText: string = "";
  subthemeText: string = "";
  notesText: string = "";
  highlighterBrushArea;
  lastClickedBrush;
  static lastSelection; // temp var
  static brushesSelections = [];
  newAnnotCounter: number;
  isDoneBtn = false; //hack
  annotationsBackup;
  themes = [{ id: 0, name: "theme1" },
  { id: 1, name: "theme2" }]
  annotToolsGroup;
  chart_config;
  dataStreams;
  themeHeight;
  static focusSVGGroup;
  focusStart;
  static focusGroup

  toEpoch = d3.timeFormat("%Q");

  constructor(
    private elRef: ElementRef,
    private data_service: DataService,
    private data_parser: DataParserService) {
    FocusChildComponent.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    this.newAnnotCounter = 0;
    this.annotToolsGroup = new FormGroup({
      themes: new FormControl()
    });
  }

  public getData(startDate, endDate, selectedObj, chart_config) {
    this.chart_config = chart_config // make this get the actual object
    console.log("selected chart config", this.chart_config)
    this.disableSaveBtn = true;
    FocusChildComponent.removeExistingChartFromParent()
    // Create chart once data has been loaded
    this.showChartInfo = false;
    this.displayAnnotationForm = false;
    this.isLoading = true;
    this.status = "Loading chart.."
    this.startDate = startDate;
    this.endDate = endDate;
    this.selectedObj = selectedObj;
    // var selectedVis = ["acceleration", "gyroscope", "gps"];    
    var selectedVis = this.chart_config.streamIds

    this.data_service.getData(this.startDate, this.endDate, this.selectedObj, selectedVis, 1).subscribe((response) => {
      if (response.data.length > 0) {
        // console.log(response)
        if (this.chart_config.parser == 'gopro') {
          console.log("Using GoPro parser")
          this.createChart(this.data_parser.parseGoPro(response.data));
        }
        else if (this.chart_config.parser == 'miq') {
          console.log("Using MIQ parser")
          this.createChart(this.data_parser.parseMIQ(response.data));
        }

      }
      else {
        console.log("Unable to plot because data selection is empty!")
        this.status = "No data available for the selected parameters"
      }
    },
      err => {
        console.log(err);
        this.status = "Server error. Probably no data available for the selected parameters.";
      });
  }

  private getDomain(data) {
    // quick workaround to compute the domain of single or multiple data streams
    // arg must be array
    if (data instanceof Array) {
      if (data.length == 1) {
        return d3.extent(data[0], (d: any) => { return d.val; });
      }
      else if (data.length > 1) {
        var domains = []
        for (var i in data) {
          domains.push(...d3.extent(data[i], (d: any) => { return d.val }))
        }
        return d3.extent(domains, (d: any) => { return d })
      }
    }
    else {
      return undefined
    }
  }

  private getSensorStreams(streamId) {
    // Iterate over the datastreams and returns the specified streams
    var out_stream;
    Object.keys(this.dataStreams).forEach(function (key) {
      if (key === streamId) {
        console.log("found stream", streamId, key)
        out_stream = this.dataStreams[key]
        return
      }
    }.bind(this));
    return out_stream;
  }

  private getStreamIds() {

  }


  private createChart(dataStreams) { // useful as TOC
    this.dataStreams = dataStreams;
    console.log("dataStreams", dataStreams)
    this.chart_config.contextView.streamId

    // Find all the stream ids needed to build the focus charts
    this.chart_config.focusCharts.forEach(element => {
      var streams = []
      element.streams.forEach(streamObj => {
        console.log("searching for", streamObj.streamId)
        streams.push(streamObj.streamId)
        console.log("getstreams", this.getSensorStreams(streamObj.streamId))
      });
    });






    FocusChildComponent.gyro_values = [dataStreams.gyro_x, dataStreams.gyro_y, dataStreams.gyro_z];
    FocusChildComponent.accl_values = [dataStreams.accl_x, dataStreams.accl_y, dataStreams.accl_z];
    FocusChildComponent.alt_values = dataStreams.gps_alt;
    this.gyro_domain = this.getDomain(FocusChildComponent.gyro_values);
    this.accl_domain = this.getDomain(FocusChildComponent.accl_values);
    this.alt_domain = this.getDomain([FocusChildComponent.alt_values]);

    // this one applies to all cases
    // use the first element of the dataStreams since all will return the same date domain
    this.date_domain = d3.extent(dataStreams[Object.keys(dataStreams)[0]], (d: any) => { return d.date; });

    this.isLoading = false;

    this.setChartInfo();

    this.createBaseSVG();

    this.setMainAxis();

    // this.setContextBrush();

    this.createContextChart();

    this.createFocusCharts(); // Includes: Gyro, Accl, Elevation

    this.createZoom(); // Includes zoom toggle

    this.createAnnotationsChart();

    // this.createContextLine();

    this.createPlotLines();

    this.createAnnotBrushSVGGroup();

    this.getAnnotations(); // Triggers => drawAnnotFromData()



    this.addElements();

    this.displayAnnotationForm = true;
    this.showChartInfo = true;

  }

  private setChartInfo() {
    // Display range dates on top of chart
    this.displayDateFrom = this.date_domain[0].toLocaleDateString("en-GB", { weekday: 'long' }) + " " + this.date_domain[0].toLocaleString();
    this.displayDateTo = this.date_domain[1].toLocaleDateString("en-GB", { weekday: 'long' }) + " " + this.date_domain[1].toLocaleString();
    this.displayRideMinutes = Math.round(((this.date_domain[1].getTime() - this.date_domain[0].getTime()) / 60000) * 10) / 10;
  }

  // CHART SETUP

  private getFocusHeights() {
    var heights = []
    this.chart_config.focusCharts.forEach(element => {
      heights.push(element.height)
    });
    return heights
  }

  private createBaseSVG() {

    // Max units of the viewbox
    var viewBoxWidth = 800;
    // block dimensions
    this.spacer1 = 25;
    this.spacer2 = 0;
    FocusChildComponent.contextHeight = 80;
    FocusChildComponent.annotHeight = 80;
    this.margin = { top: 0, right: 0, bottom: 0, left: 25 };
    // where focus charts start
    this.focusStart = FocusChildComponent.contextHeight + this.spacer1;
    // total focus height
    var focusStackedHeight = this.getFocusHeights().reduce((a, b) => a + b, 0);
    // where annotation chart starts
    var annotStart = this.focusStart + focusStackedHeight + this.spacer1;
    // zoom height for zoom area
    this.zoomHeight = focusStackedHeight;
    // height of one theme lane
    this.themeHeight = FocusChildComponent.annotHeight + this.spacer1
    // total chart dims
    FocusChildComponent.chartWidth = viewBoxWidth - this.margin.right - this.margin.left;
    this.chartHeight = annotStart + this.themeHeight; // assumes 1 preexisting theme 
    // apply dims to base svg element
    FocusChildComponent.hostElement = document.getElementById("mainChart");
    FocusChildComponent.svg = d3.select(FocusChildComponent.hostElement).append('svg')
      .attr('width', "100%")
      .attr('height', "100%")
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + this.chartHeight)
    // get rid of these
    FocusChildComponent.focus1Height = 170;
    FocusChildComponent.focus2Height = 170;
    FocusChildComponent.focus3Height = 170;
    this.marginTop_f1 = this.margin.top + FocusChildComponent.contextHeight + this.spacer1;
    this.marginTop_f2 = this.marginTop_f1 + FocusChildComponent.focus1Height;
    this.marginTop_f3 = this.marginTop_f2 + FocusChildComponent.focus2Height;
    this.marginTop_annotChart = annotStart;
  }


  private setMainAxis() {
    var plotMargin = 1.1;
    // main x scale
    FocusChildComponent.x = d3.scaleTime()
      .domain(this.date_domain) // shared with context X 
      .range([0, FocusChildComponent.chartWidth]);

    // Apply x scale on bottom last step 
    FocusChildComponent.xAxisFocus = d3.axisBottom(FocusChildComponent.x);
  }


  private createContextChart() {

    var context_domain = this.getDomain([this.getSensorStreams(this.chart_config.contextView.streamId)])
    // Y2
    this.y_context = d3.scaleLinear().range([FocusChildComponent.contextHeight, 0])
      .domain([context_domain[0], context_domain[1]]); // add some friendly margin

    // Create context brush feature
    FocusChildComponent.contextBrush = d3.brushX()
      .extent([[0, 0], [FocusChildComponent.chartWidth, FocusChildComponent.contextHeight]])
      .on("brush", FocusChildComponent.contextBrushed);


    // Create context svg group and position
    FocusChildComponent.context = FocusChildComponent.svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Draw bounding box
    FocusChildComponent.context.append('rect')
      .attr("class", "bbox")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', FocusChildComponent.chartWidth)
      .attr('height', FocusChildComponent.contextHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black');

    // Appends line to Context
    FocusChildComponent.context.append("path")
      .datum(this.getSensorStreams(this.chart_config.contextView.streamId))  // read this from config file
      .attr("class", "contextLine")
      .attr("stroke", this.chart_config.contextView.lineColor)
      .attr("fill-opacity", "0%")
      .attr("stroke-width", this.strokeWidth)
      .attr("d", d3.line()
        .x((d: any) => { return FocusChildComponent.x(d.date); })
        .y((d: any) => { return this.y_context(d.val); }));

    // Appends x axis to Context
    FocusChildComponent.context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + FocusChildComponent.contextHeight + ")")
      .call(d3.axisBottom(FocusChildComponent.x));

    // // Appends brush to context, sets initial range
    // FocusChildComponent.context.append("g")
    // .attr("class", "main_brush")
    // .call(FocusChildComponent.contextBrush)
    // .call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range()); // sets initial brush state

  }

  // private createContextLine() {
  //   // Create context line
  //   this.contextLine = d3.line()
  //     .x((d: any) => { return FocusChildComponent.x(d.date); })
  //     .y((d: any) => { return this.y_context(d.val); });
  // }





  private createFocusCharts() {

    var plotMargin = 1.1;
    var labelColor = ['#000000', '#e41a1c', '#377eb8', '#4daf4a', '#e41a1c', '#FF00FF'];
 
    // this will go
    // Y scale
    FocusChildComponent.y_f1 = d3.scaleLinear()
      .range([FocusChildComponent.focus1Height, 0]) // get from config file
      .domain([this.gyro_domain[0] * plotMargin, this.gyro_domain[1] * plotMargin]); // Add a bit of margin
    this.yAxisLeft_f1 = d3.axisLeft(FocusChildComponent.y_f1);


    // Focus2 (x scale same as focus1)
    // Set Y scale
    FocusChildComponent.y_f2 = d3.scaleLinear()
      .range([FocusChildComponent.focus2Height, 0])
      .domain([this.accl_domain[0] * plotMargin, this.accl_domain[1] * plotMargin]); // Add a bit of margin
    FocusChildComponent.xAxis_f2 = d3.axisBottom(FocusChildComponent.x);
    this.yAxisLeft_f2 = d3.axisLeft(FocusChildComponent.y_f2); // these could go. too verbose

    // Focus3 
    // Set Y scale
    FocusChildComponent.y_f3 = d3.scaleLinear()
      .range([FocusChildComponent.focus3Height, 0])
      .domain([this.alt_domain[0] - 0.5, this.alt_domain[1] + 0.5]); // Add a bit of margin
    FocusChildComponent.xAxis_f3 = d3.axisBottom(FocusChildComponent.x); // x scale same as focus1
    this.yAxisLeft_f3 = d3.axisLeft(FocusChildComponent.y_f3); // these could go. too verbose 






    // make focus chart svg group here!
    FocusChildComponent.focusSVGGroup = FocusChildComponent.svg.append("g")
      .attr("class", "focusGroup")
      .attr("transform", "translate(" + this.margin.left + "," + this.focusStart + ")");

    FocusChildComponent.focusGroup = []

    var insertHeight = this.focusStart
    // this loop creates focus charts

    
    this.chart_config.focusCharts.forEach(element => {
      var name = element.name;
      var height = element.height;
      var id = element.id;
      var labels = [name]

      var colors =[]
      // create list with labels and label colors
      element.streams.forEach(stream => {
        labels.push(...stream.streamLabel)
        colors.push(...stream.lineColor)
      });

      var focusChart = FocusChildComponent.focusSVGGroup.append('g')
                .attr("class", id)
                .attr("transform", "translate(" + this.margin.left + "," + insertHeight + ")")
                .append("defs").append("clipPath") // clip path
                .attr("id", "clip_ + id")
                .append("rect")
                .attr("width", FocusChildComponent.chartWidth)
                .attr("height", height)
                .append('rect') // add bounding box
                .attr("class", "bbox")
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', FocusChildComponent.chartWidth)
                .attr('height', height)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .selectAll(null) // add label
                .data(labels)
                .enter()
                .append('text')
                .append("tspan")
                .style("text-anchor", "start")
                .style("font-weight", "bold")
                .attr("x", (d, i) => { var s = i ? 100 : 10; var offset = s + i * 10; return offset })
                .attr("y", 15)
                .attr("fill", (d, i) => { return colors[i] })
                .attr("font-size", "10px")
                .text(t => { return t })

      FocusChildComponent.focusGroup.push({
        name: name,
        svg: focusChart
      })
    });

    // // Focus1
    // // Create acceleration focus
    // FocusChildComponent.focus1 = FocusChildComponent.svg.append("g")
    //   .attr("class", "focus1")
    //   .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")");

    // // Add clip path to svg
    // FocusChildComponent.focus1.append("defs").append("clipPath")
    //   .attr("id", "clip1")
    //   .append("rect")
    //   .attr("width", FocusChildComponent.chartWidth)
    //   .attr("height", FocusChildComponent.focus1Height);

    // FocusChildComponent.focus1.append('rect')
    //   .attr("class", "bbox")
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', FocusChildComponent.chartWidth)
    //   .attr('height', FocusChildComponent.focus1Height)
    //   .attr('fill', 'white')
    //   .attr('stroke', 'black');


    // var focus1Label = ["Acceleration (m/s²)", "x", "y", "z"]
    // FocusChildComponent.focus1.selectAll(null)
    //   .data(focus1Label)
    //   .enter()
    //   .append('text')
    //   .append("tspan")
    //   .style("text-anchor", "start")
    //   .style("font-weight", "bold")
    //   .attr("x", (d, i) => { var s = i ? 100 : 10; var offset = s + i * 10; return offset })
    //   .attr("y", 15)
    //   .attr("fill", (d, i) => { return labelColor[i] })
    //   .attr("font-size", "10px")
    //   .text(t => { return t })

    // // Focus2
    // FocusChildComponent.focus2 = FocusChildComponent.svg.append("g")
    //   .attr("class", "focus2")
    //   .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f2 + ")");

    // // Add clip path to svg
    // FocusChildComponent.focus2.append("defs").append("clipPath")
    //   .attr("id", "clip2")
    //   .append("rect")
    //   .attr("width", FocusChildComponent.chartWidth)
    //   .attr("height", FocusChildComponent.focus2Height);

    // FocusChildComponent.focus2.append('rect')
    //   .attr("class", "bbox")
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', FocusChildComponent.chartWidth)
    //   .attr('height', FocusChildComponent.focus2Height)
    //   .attr('fill', 'white')
    //   .attr('stroke', 'black');

    // var focus2Label = ["Gyroscope (rad/s)", "x", "y", "z"]
    // FocusChildComponent.focus2.selectAll(null)
    //   .data(focus2Label)
    //   .enter()
    //   .append('text')
    //   .append("tspan")
    //   .style("text-anchor", "start")
    //   .style("font-weight", "bold")
    //   .attr("x", (d, i) => { var s = i ? 100 : 10; var offset = s + i * 10; return offset })
    //   .attr("y", 15)
    //   .attr("fill", (d, i) => { return labelColor[i] })
    //   .attr("font-size", "10px")
    //   .text(t => { return t })

    // // Focus3    
    // FocusChildComponent.focus3 = FocusChildComponent.svg.append("g")
    //   .attr("class", "focus3")
    //   .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f3 + ")");

    // // Add clip path to svg
    // FocusChildComponent.focus3.append("defs").append("clipPath")
    //   .attr("id", "clip3")
    //   .append("rect")
    //   .attr("width", FocusChildComponent.chartWidth)
    //   .attr("height", FocusChildComponent.focus3Height);

    // FocusChildComponent.focus3.append('rect')
    //   .attr("class", "bbox")
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', FocusChildComponent.chartWidth)
    //   .attr('height', FocusChildComponent.focus3Height)
    //   .attr('fill', 'white')
    //   .attr('stroke', 'black');

    // var focus3Label = "Altitude (m)"
    // FocusChildComponent.focus3.append('text')
    //   .style("text-anchor", "start")
    //   .style("font-weight", "bold")
    //   .text(focus3Label)
    //   .attr("x", 10)
    //   .attr("y", 15)
    //   .attr("fill", "black")
    //   .attr("font-size", "10px");
  }



  static setLine_f1() {
    console.log("setLine_f1")
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

    // Append clip path
    FocusChildComponent.annotBrushesGroup.append("defs").append("clipPath")
      .attr("id", "clip_annot1")
      .append("rect")
      .attr("width", FocusChildComponent.chartWidth)
      .attr("height", FocusChildComponent.annotHeight);

    FocusChildComponent.clip_annot1 = FocusChildComponent.annotBrushesGroup.append("g")
      .attr("clip-path", "url(#clip_annot1)")

    // Create highlighter brush  
    FocusChildComponent.highlighterBrush = d3.brushX()
      .extent([[0, 0], [FocusChildComponent.chartWidth, this.zoomHeight]])
      .on("end", this.highlightBrushed.bind(this));
  }

  private createZoom() {
    // Create zoom feature
    FocusChildComponent.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [FocusChildComponent.chartWidth, this.zoomHeight]])
      .extent([[0, 0], [FocusChildComponent.chartWidth, this.zoomHeight]])
      .on("zoom", FocusChildComponent.zoomed);
  }

  private addElements() {
    // Focus1
    // Appends X to focus svg group
    FocusChildComponent.focus1.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + FocusChildComponent.focus1Height + ")")
      .call(FocusChildComponent.xAxisFocus);

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
      .attr("transform", "translate(0," + FocusChildComponent.contextHeight + ")")
      .call(FocusChildComponent.xAxisFocus);

    // Append annotation brush
    this.highlighterBrushArea = FocusChildComponent.svg.append("g")
      .attr("id", "highlighterBrush")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")")
      .call(FocusChildComponent.highlighterBrush);

    // Appends zoom to svg over focus1 area
    FocusChildComponent.svg.append("rect")
      .attr("class", "zoom")
      .attr("width", FocusChildComponent.chartWidth)
      .attr("height", this.zoomHeight)
      .attr("fill-opacity", "0%")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")")
      .call(FocusChildComponent.zoom);

    // Appends brush to context, sets initial range
    FocusChildComponent.context.append("g")
      .attr("class", "main_brush")
      .call(FocusChildComponent.contextBrush)
      .call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range()); // sets initial brush state
  }



  private createAnnotationsChart() {
    FocusChildComponent.annotChart1 = FocusChildComponent.svg.append("g")
      .attr("class", "annot_chart1")
      .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_annotChart + ")");

    // Draw bounding box
    FocusChildComponent.annotChart1.append('rect')
      .attr("class", "bbox")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', FocusChildComponent.chartWidth)
      .attr('height', FocusChildComponent.contextHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black');
  }




  // ANNOTATION METHODS
  // GET/ADD/REPLACE
  private getAnnotations() {
    FocusChildComponent.annotations = {}
    this.data_service.getAnnotations(this.selectedObj, this.startDate, this.endDate).subscribe((response) => {
      FocusChildComponent.annotations = this.data_parser.parseAnnotations(response.data);
      console.log("Total annotations found:", Object.keys(FocusChildComponent.annotations).length);

      // Draw annotations once received from server
      this.populateAnnotBrushes();
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

  private replaceAnnotation(annotationId, theme, subtheme, startDate, endDate, notes) {
    this.data_service.deleteAnnotation(annotationId).subscribe(resp => {
      console.log("Delete Annotation result:", resp)
    },
      err => {
        console.log(err)
      },
      () => { // Add new annotation only after prev. version has been deleted
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
      })
  }


  private populateAnnotBrushes() {
    /* Notes: 
    - Called on chart init
    - This array will hold all brushes and their states
    - Basically a copy of FocusChildComponent.annotations but with d3.brush as an extra field
    - FocusChildComponent.annotations is readonly and used to compute changes when synching to db
    - Builds an array of brushes from annotation data
    - Could this be a dict instead of array?
    - Use id from annotation to make brush */

    // init empty
    FocusChildComponent.annotBrushes = []
    for (var id in FocusChildComponent.annotations) {
      FocusChildComponent.annotBrushes.push({
        id: id,
        startDateEpoch: FocusChildComponent.annotations[id].startDateEpoch,
        startDate: FocusChildComponent.annotations[id].startDate,
        endDateEpoch: FocusChildComponent.annotations[id].endDateEpoch,
        endDate: FocusChildComponent.annotations[id].endDate,
        brush: this.makeBrush(),
        theme: FocusChildComponent.annotations[id].theme,
        subtheme: FocusChildComponent.annotations[id].subtheme,
        notes: FocusChildComponent.annotations[id].notes
      });
    }
  }

  private drawAnnotationBrushesFromData() {
    // Called on chart init
    // Select brushes we just created
    var brushSelection = FocusChildComponent.clip_annot1
      .selectAll('.brush')
      .data(FocusChildComponent.annotBrushes, d => { return d.id });
    // Iterate over annotations and draw corresponding brushes
    brushSelection.enter()
      .insert('g', '.brush')
      .attr('class', 'brush')
      .attr('id', d => `brush-${d.id}`)
      .each(function (brushObj) {
        // this init's the brush
        brushObj.brush(d3.select(this));
        // Move brush to location
        var start = FocusChildComponent.x(brushObj.startDate)
        var end = FocusChildComponent.x(brushObj.endDate)
        brushObj.brush.move(d3.select(this), [start, end]
        );
      })

    // disable overlay events
    FocusChildComponent.annotBrushesGroup.selectAll('.overlay').style('pointer-events', 'none');
    // remove all previous labels
    FocusChildComponent.annotBrushesGroup.selectAll('.brushLabel').remove()

    FocusChildComponent.annotBrushes.forEach(brushObj => {
      // disable dragging annotation brushes 
      var currentBrush = FocusChildComponent.annotChart1.select('#brush-' + brushObj.id).style('pointer-events', 'none');
      // append brush labels
      var s: any = FocusChildComponent.getBrushSelection(brushObj.id);
      if (s) {
        var labelAnchor = ((s[1] - s[0]) / 2) + s[0];
        currentBrush.append("text")
          .attr("class", "brushLabel")
          .style("text-anchor", "middle")
          .style("dominant-baseline", "central")
          .text(brushObj.subtheme)
          .attr("x", labelAnchor)
          .attr("y", FocusChildComponent.annotHeight - FocusChildComponent.contextHeight / 2)
          .attr("fill", "black")
          .attr("font-size", "10px");
      }
    })
  }

  updateLastClicked() {
    if (this.lastClickedBrush) {
      // update annot. contents
      for (var i in FocusChildComponent.annotBrushes) {
        if (FocusChildComponent.annotBrushes[i].id == this.lastClickedBrush) {
          FocusChildComponent.annotBrushes[i].theme = this.themeText;
          FocusChildComponent.annotBrushes[i].subtheme = this.subthemeText;
          FocusChildComponent.annotBrushes[i].notes = this.notesText;
          // update brushLabel
          // var s: any = FocusChildComponent.getBrushSelection(brushObj.id);
          FocusChildComponent.clip_annot1.select('#brush-' + FocusChildComponent.annotBrushes[i].id)
            .select('.brushLabel').text(FocusChildComponent.annotBrushes[i].subtheme)
        }
      }

      // un-highlight previous brush
      FocusChildComponent.annotChart1.select('#brush-' + this.lastClickedBrush)
        .select('.selection')
        .style('fill-opacity', '0.3');
    }
  }

  brushClicked() {
    // clear higlighter brush
    this.disableDeleteBtn = false;
    this.newAnnotation = null; //cleanup
    this.highlighterBrushArea.call(FocusChildComponent.highlighterBrush.move, null)
    this.disableAnnotationFields = false;
    // before switching focus to another brush
    this.updateLastClicked()
    // get the selected brush id
    this.lastClickedBrush = d3.event.path[1].id.replace("brush-", "");
    // highlight selected brush
    FocusChildComponent.annotChart1.select('#brush-' + this.lastClickedBrush)
      .select('.selection')
      .style('fill-opacity', '0.6');
    // update ui to with selected brush's contents
    var selectedBrush: any = FocusChildComponent.annotBrushes.filter(obj => {
      return obj.id == this.lastClickedBrush;
    });
    this.themeText = selectedBrush[0].theme;
    this.subthemeText = selectedBrush[0].subtheme;
    this.notesText = selectedBrush[0].notes;
  }

  annotBrushed() { // called every time an annotation brush is dragged/resized
    FocusChildComponent.annotBrushes.forEach(brushObj => {
      var s: any = FocusChildComponent.getBrushSelection(brushObj.id);
      if (s) {
        // update position of label
        // done this way so that label becomes immediately visible on newly added brush
        var labelAnchor = ((s[1] - s[0]) / 2) + s[0];
        FocusChildComponent.annotChart1.select('#brush-' + brushObj.id)
          .select('.brushLabel')
          .attr("x", labelAnchor)
          .attr("y", FocusChildComponent.annotHeight - FocusChildComponent.contextHeight / 2)
      }
    })
  }

  highlightBrushed() { // could this be end event instead? called when a highlightbrush is drawn to the screen
    // un-highlight last clicked
    FocusChildComponent.annotChart1.select('#brush-' + this.lastClickedBrush).select('.selection').style('fill-opacity', '0.3');

    // filter events. this way we dont lose state of lastClickedBrush every time
    if (d3.event.sourceEvent) {
      if (d3.event.sourceEvent.type == 'mouseup') {
        if (this.lastClickedBrush) {
          // before switching focus to another brush
          console.log("gotcha")
          this.disableDeleteBtn = true
          this.updateLastClicked();
        }
        this.lastClickedBrush = null;
      }
    }

    this.disableAnnotationFields = false;
    // creates a new annotation-like object that we can later write to database
    // get higlighter brush selection
    var s = FocusChildComponent.getBrushSelectionNoPrefix('highlighterBrush');
    if (s) {
      this.newAnnotation = {
        startDate: FocusChildComponent.x.invert(s[0]),
        endDate: FocusChildComponent.x.invert(s[1]),
        startEpoch: Number(this.toEpoch(FocusChildComponent.x.invert(s[0]))),
        endEpoch: Number(this.toEpoch(FocusChildComponent.x.invert(s[1]))),
        theme: "",
        subtheme: "",
        notes: ""
      };
      // update ui
      this.themeText = this.newAnnotation.theme;
      this.subthemeText = this.newAnnotation.subtheme;
      this.notesText = this.newAnnotation.notes;
    }
  }


  makeBrush() {
    // empty d3 brush obj
    return d3.brushX()
      .extent([[0, 0], [FocusChildComponent.chartWidth, FocusChildComponent.annotHeight]])
      // .on("start", FocusChildComponent.annotBrushStart)
      .on("brush", this.annotBrushed.bind(this))
    // .on("end", this.annotBrushEnd.bind(this))
  }

  static getBrushSelectionNoPrefix(brushID) {
    var brushElement = document.getElementById(brushID);
    if (brushElement instanceof SVGGElement) {
      return d3.brushSelection(brushElement);
    } else {
      return null;
    }
  }


  static getBrushSelection(brushID) {
    var brushElement = document.getElementById('brush-' + brushID);
    if (brushElement instanceof SVGGElement) {
      return d3.brushSelection(brushElement);
    } else {
      return null;
    }
  }


  private resetBrushes() {
    // Clears all brushes, reset vars and reloads from server
    console.log("Resetting brushes");
    // Remove all annotbrushes
    FocusChildComponent.clearAllBrushes();
    FocusChildComponent.annotBrushes = [];
    FocusChildComponent.annotBrushesGroup.selectAll('.brushLabel').remove()
  }


  static clearAllBrushes() {
    FocusChildComponent.annotBrushes.forEach((brushObject: any) => {
      d3.select('#brush-' + brushObject.id).remove();
    });
  }

  // ANNOTATION CONTROL HANDLER

  toggleAnnotationMode() {

    this.annotModeEnabled = !this.annotModeEnabled;
    if (this.annotModeEnabled) {
      // disable save btn
      this.disableSaveBtn = true

      console.log("Annotation mode ON");
      // make a copy of current state
      this.annotationsBackup = cloneable.deepCopy(FocusChildComponent.annotBrushes)
      // update ui button
      this.annotateBtnText = "Discard";
      // Enable clicking on brushes but disable dragging
      FocusChildComponent.annotBrushes.forEach(brushObj => {
        FocusChildComponent.annotChart1.select('#brush-' + brushObj.id).style('pointer-events', 'all');
        // The following line is an absolute hack. Without this, however, brushes would still be draggable which is a problem because they get snapped to visible chart extents if you drag them which is counter-intuitive.
        FocusChildComponent.annotChart1.select('#brush-' + brushObj.id).select('.selection').style('fill-opacity', '0.3');
      })
      // enable clicking on brushes
      FocusChildComponent.annotChart1.selectAll(".selection").on("click", this.brushClicked.bind(this));
      // Re-enable highlighter
      if (d3.select('#highlighterBrush').empty()) {
        FocusChildComponent.svg.append("g")
          .attr("id", "highlighterBrush")
          .attr("transform", "translate(" + this.margin.left + "," + this.marginTop_f1 + ")")
          .call(FocusChildComponent.highlighterBrush);
      }
      // Disable zoom
      FocusChildComponent.svg.select(".zoom")
        .attr("fill", "none");
      // Enable done button
      this.disableDoneBtn = false;
    } else {
      console.log("Annotation mode OFF");
      // disable Delete
      this.disableDeleteBtn = true;

      // enable save btn
      this.disableSaveBtn = false

      // disable clicking on brushes
      FocusChildComponent.annotBrushes.forEach(brushObj => {
        FocusChildComponent.annotChart1.select('#brush-' + brushObj.id).style('pointer-events', 'none');
      })

      if (this.isDoneBtn == false) {
        // means user pressed discard button
        // replace with prev state
        console.log('discard')
        this.resetBrushes()
        FocusChildComponent.annotBrushes = this.annotationsBackup;
        // update

        this.drawAnnotationBrushesFromData();
      }

      // Discard new annotation
      this.highlighterBrushArea.call(FocusChildComponent.highlighterBrush.move, null)
      // un-highlight previous brush
      FocusChildComponent.annotChart1.select('#brush-' + this.lastClickedBrush)
        .select('.selection')
        .style('fill-opacity', '0.3');

      this.lastClickedBrush = null;
      // Update button text
      this.annotateBtnText = "Annotate";
      // Disable zoom area
      FocusChildComponent.svg.select(".zoom")
        .attr("fill", "white");
      // Disable done button
      this.disableDoneBtn = true;
      // this.resetBrushes();
      this.disableAnnotationFields = true;
      this.isDoneBtn = false
      // discard input fields
      this.themeText = null;
      this.subthemeText = null;
      this.notesText = null;
    }
  }


  annotationDone() {
    this.updateLastClicked();
    this.lastClickedBrush = null;
    // transfer to FocusChildComponent.annotBrushes using push
    // append new annotation to annotBrushes
    if (FocusChildComponent.getBrushSelectionNoPrefix('highlighterBrush')) {
      FocusChildComponent.annotBrushes.push({
        id: String(this.newAnnotCounter),
        startDateEpoch: this.newAnnotation.startEpoch,
        startDate: this.newAnnotation.startDate,
        endDateEpoch: this.newAnnotation.endEpoch,
        endDate: this.newAnnotation.endDate,
        brush: this.makeBrush(),
        theme: this.themeText,
        subtheme: this.subthemeText,
        notes: this.notesText
      });

      this.drawAnnotationBrushesFromData();

      this.newAnnotation = null;
      // clear highlighter brush
      this.highlighterBrushArea.call(FocusChildComponent.highlighterBrush.move, null)
      this.newAnnotCounter++;
    }

    // updates the state of FocusChildComponent.annotBrushes based on chart svg state. brute force update(no filtering)
    for (var i in FocusChildComponent.annotBrushes) {
      var s: any = FocusChildComponent.getBrushSelection(FocusChildComponent.annotBrushes[i].id);
      if (s) {
        FocusChildComponent.annotBrushes[i].startDateEpoch = Number(this.toEpoch(FocusChildComponent.x.invert(s[0])))
        FocusChildComponent.annotBrushes[i].endDateEpoch = Number(this.toEpoch(FocusChildComponent.x.invert(s[1])))
        FocusChildComponent.annotBrushes[i].startDate = FocusChildComponent.x.invert(s[0])
        FocusChildComponent.annotBrushes[i].endDate = FocusChildComponent.x.invert(s[1])
      }
    }
    this.isDoneBtn = true
    this.toggleAnnotationMode();
  }

  deleteSelectedAnnot() {

    console.log("To be deleted:", this.lastClickedBrush)


    for (var i in FocusChildComponent.annotBrushes) {
      if (FocusChildComponent.annotBrushes[i].id == this.lastClickedBrush)
        delete FocusChildComponent.annotBrushes[i];
    }

    // make deep copy of annotbrushes
    var previousAnnotations = []
    for (var i in FocusChildComponent.annotBrushes) {
      previousAnnotations[i] = FocusChildComponent.annotBrushes[i]
    }

    // reset
    FocusChildComponent.annotBrushes = []

    // transfer from copy skipping the deleted one
    var counter = 0
    for (var i in previousAnnotations) {
      if (previousAnnotations[i].id !== this.lastClickedBrush) {
        FocusChildComponent.annotBrushes[counter] = previousAnnotations[i]
        counter += 1
      }
    }

    // remove svg 
    d3.select('#brush-' + this.lastClickedBrush).remove();

    this.drawAnnotationBrushesFromData();
  }


  saveAnnotations() {
    // To be called by save button in UI
    console.log("saveAnnotations");
    // delete originally fetched annotations
    for (var id in FocusChildComponent.annotations) {
      // console.log("deleting",id)
      this.data_service.deleteAnnotation(id).subscribe(resp => {
        // console.log("Delete Annotation result:", resp)
      })
    }
    // add all current annotations
    FocusChildComponent.annotBrushes.forEach(brushObj => {
      // console.log("saving",brushObj)
      this.addAnnotation(brushObj.theme, brushObj.subtheme, brushObj.startDateEpoch, brushObj.endDateEpoch, brushObj.notes)
    })
    // reload chart using the same chart configuration
    this.getData(this.startDate, this.endDate, this.selectedObj, this.chart_config);
  }


  // CONTEXT BRUSH AND ZOOM HANDLES

  static contextBrushed() { // Context brush
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    console.log("brushed")
    var s = d3.event.selection || FocusChildComponent.x.range();
    FocusChildComponent.x.domain(s.map(FocusChildComponent.x.invert, FocusChildComponent.x));
    FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine_f1());
    FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxisFocus);
    FocusChildComponent.focus2.selectAll(".line").attr("d", FocusChildComponent.setLine_f2());
    FocusChildComponent.focus2.select(".axis--x").call(FocusChildComponent.xAxis_f2);
    FocusChildComponent.focus3.select(".line_f3").attr("d", FocusChildComponent.setLine_f3());
    FocusChildComponent.focus3.select(".axis--x").call(FocusChildComponent.xAxis_f3);
    FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxisFocus);
    var k = FocusChildComponent.chartWidth / (s[1] - s[0]);
    var Tx = -s[0];
    FocusChildComponent.svg.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
      .scale(k)
      .translate(Tx, 0));
    FocusChildComponent.moveAnnotBrushes()
  }

  static zoomed() { // Zoom event handler
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x).domain()); // sets domain to scale with transform
    FocusChildComponent.focus1.selectAll(".line").attr("d", FocusChildComponent.setLine_f1());
    FocusChildComponent.focus1.select(".axis--x").call(FocusChildComponent.xAxisFocus);
    FocusChildComponent.focus2.selectAll(".line").attr("d", FocusChildComponent.setLine_f2());
    FocusChildComponent.focus2.select(".axis--x").call(FocusChildComponent.xAxis_f2);
    FocusChildComponent.focus3.select(".line_f3").attr("d", FocusChildComponent.setLine_f3());
    FocusChildComponent.focus3.select(".axis--x").call(FocusChildComponent.xAxis_f3);
    FocusChildComponent.context.select(".main_brush").call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range().map(t.invertX, t));
    FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxisFocus);
    FocusChildComponent.moveAnnotBrushes()
  }

  static moveAnnotBrushes() {
    // move the brushes, normally called by zoomed/contextBrushed
    FocusChildComponent.annotBrushes.forEach(brushObj => {
      var from = brushObj.startDate
      var to = brushObj.endDate
      FocusChildComponent.annotChart1.select("#brush-" + brushObj.id)
        .call(brushObj.brush.move, [FocusChildComponent.x(from), FocusChildComponent.x(to)]);
    })
  }

  // CHART CLEANUP

  static removeExistingChartFromParent() {
    // clears the svg before drawing a new one
    d3.select(FocusChildComponent.hostElement).select('svg').remove();
    if (FocusChildComponent.svg) {
      FocusChildComponent.svg.remove()
    }
    // clear remaining brushes
    if (FocusChildComponent.clip_annot1) {
      FocusChildComponent.clearAllBrushes();
    }
  }
}

export class cloneable {
  //https://medium.com/javascript-in-plain-english/deep-clone-an-object-and-preserve-its-type-with-typescript-d488c35e5574
  public static deepCopy<T>(source: T): T {
    return Array.isArray(source)
      ? source.map(item => this.deepCopy(item))
      : source instanceof Date
        ? new Date(source.getTime())
        : source && typeof source === 'object'
          ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
            o[prop] = this.deepCopy(source[prop]);
            Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop));
            return o;
          }, Object.create(Object.getPrototypeOf(source)))
          : source as T;
  }
}