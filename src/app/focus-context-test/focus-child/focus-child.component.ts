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
  focusStackedHeight;

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
        // console.log("found stream", streamId, key)
        out_stream = this.dataStreams[key]
        return
      }
    }.bind(this));
    return out_stream;
  }


  private createChart(dataStreams) { // useful as TOC
    this.dataStreams = dataStreams;
    console.log("dataStreams", dataStreams)

    // // Find all the stream ids needed to build the focus charts
    // this.chart_config.focusCharts.forEach(element => {
    //   var streams = []
    //   element.streams.forEach(streamObj => {
    //     // console.log("searching for", streamObj.streamId)
    //     streams.push(streamObj.streamId)
    //     // console.log("getstreams", this.getSensorStreams(streamObj.streamId))
    //   });
    // });

    // this one applies to all cases
    // use the first element of the dataStreams since all will return the same date domain
    this.date_domain = d3.extent(dataStreams[Object.keys(dataStreams)[0]], (d: any) => { return d.date; });

    this.isLoading = false;

    this.setChartInfo();

    this.createBaseSVG();

    this.setMainAxis();

    this.createZoom();

    this.createHighlighterBrush();

    this.createContextChart();

    this.createFocusCharts(); // programatially creates focus charts

    this.createAnnotationsChart();

    this.createAnnotBrushSVGGroup();

    this.getAnnotations(); // Triggers => drawAnnotFromData()

    this.addElements();

    this.setContextBrush();

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
    this.focusStackedHeight = this.getFocusHeights().reduce((a, b) => a + b, 0);
    // where annotation chart starts
    var annotStart = this.focusStart + this.focusStackedHeight + this.spacer1;
    // zoom height for zoom area
    this.zoomHeight = this.focusStackedHeight;
    // height of one theme lane
    this.themeHeight = FocusChildComponent.annotHeight + this.spacer1
    // total chart dims
    FocusChildComponent.chartWidth = viewBoxWidth - this.margin.right - this.margin.left;
    this.chartHeight = annotStart + this.themeHeight; // assumes 1 preexisting theme 
    // apply dims to base svg element
    FocusChildComponent.hostElement = document.getElementById("mainChart");
    FocusChildComponent.svg = d3.select(FocusChildComponent.hostElement).append('svg')
      .attr('width', "70%")
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
    // main x scale
    FocusChildComponent.x = d3.scaleTime()
      .domain(this.date_domain) // shared with context X 
      .range([0, FocusChildComponent.chartWidth]);
    // Apply x scale on bottom
    FocusChildComponent.xAxisFocus = d3.axisBottom(FocusChildComponent.x);
  }

  private createZoom() {
    // Create zoom feature
    FocusChildComponent.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [FocusChildComponent.chartWidth, this.zoomHeight]])
      .extent([[0, 0], [FocusChildComponent.chartWidth, this.zoomHeight]])
      .on("zoom", FocusChildComponent.zoomed);
  }

  private createHighlighterBrush() {
    // Create highlighter brush  
    FocusChildComponent.highlighterBrush = d3.brushX()
      .extent([[0, 0], [FocusChildComponent.chartWidth, this.zoomHeight]])
      .on("end", this.highlightBrushed.bind(this));
  }

  private createContextChart() {
    var context_domain = this.getDomain([this.getSensorStreams(this.chart_config.contextView.streamId)])
    // Y2
    this.y_context = d3.scaleLinear()
      .range([FocusChildComponent.contextHeight, 0])
      .domain([context_domain[0], context_domain[1]]); // add some friendly margin

    FocusChildComponent.x_context = d3.scaleTime()
      .domain(this.date_domain)
      .range([0, FocusChildComponent.chartWidth])

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
        .x((d: any) => { return FocusChildComponent.x_context(d.date); })
        .y((d: any) => { return this.y_context(d.val); }));

    FocusChildComponent.context.selectAll(null)
      .data([this.chart_config.contextView.streamLabel])
      .enter()
        .append('text')
        .append('tspan')
        .style("text-anchor", "start")
        .style("font-weight", "bold")
        .attr("x", 10)
        .attr("y", 15)
        .attr("fill", '#black')
        .attr("font-size", "10px")
        .text(t => { return t })


    // Appends x axis to Context
    FocusChildComponent.context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + FocusChildComponent.contextHeight + ")")
      .call(d3.axisBottom(FocusChildComponent.x));
  }

  private createFocusCharts() {
    // programatically creates all focus chart elements following chart config file
    // base group
    FocusChildComponent.focusSVGGroup = FocusChildComponent.svg.append("g")
      .attr("class", "focusSVGGroup")
      .attr("transform", "translate(" + this.margin.left + "," + this.focusStart + ")");

    FocusChildComponent.focusGroup = []

    var insertHeight = 0
    // this loop creates focus charts

    this.chart_config.focusCharts.forEach(element => {
      var name = element.name;
      var height = element.height;
      var id = element.id;
      var labels = [name]
      var streams = []
      var colors = ['#black']

      // create arrays
      element.streams.forEach(stream => {
        labels.push(stream.streamLabel)
        colors.push(stream.lineColor)
        streams.push(this.getSensorStreams(stream.streamId))
      });

      var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain(this.getDomain(streams))

      // console.log("found", streams, yScale.domain())
      // console.log("colors for", id, colors)

      var yAxisLeft = d3.axisLeft(yScale)
      var line = d3.line()
        .x((d: any) => { return FocusChildComponent.x(d.date) })
        .y((d: any) => { return yScale(d.val) })
      var focusChart = FocusChildComponent.focusSVGGroup.append('g')
        .attr("class", id)
        .attr("transform", "translate(0," + insertHeight + ")");
      focusChart.append("defs").append("clipPath") // clip path
        .attr("id", "clip_" + id)
        .append("rect")
        .attr("width", FocusChildComponent.chartWidth)
        .attr("height", height);
      focusChart.append('rect') // add bounding box
        .attr("class", "bbox")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', FocusChildComponent.chartWidth)
        .attr('height', height)
        .attr('fill', 'white')
        .attr('stroke', 'black');
      focusChart.selectAll(null) // add label
        .data(labels)
        .enter()
          .append('text')
          .append("tspan")
          .style("text-anchor", "start")
          .style("font-weight", "bold")
          .attr("x", (d, i) => { var x = i < 1 ? 10:0 ; var offset = x + i * 10; return offset })
          .attr("y", (d, i)=> { var y = i == 0 ? 15 : 30; return y})
          .attr("fill", (d, i) => { return colors[i] })
          .attr("font-size", "10px")
          .text(t => { return t })

      var lines = focusChart.append('g')
        .attr("clip-path", "url(#clip_" + id + ")")

      if (streams.length > 1) { // add multiline
        lines.selectAll(".line")
          .data(streams)
          .enter()
          .append("path")
          .attr("class", "line")  // I add the class line to be able to modify this line later on.
          .attr("fill", "none")
          .attr("stroke", (d, i) => { return colors[i + 1] }) // skip black
          .attr("stroke-width", this.strokeWidth)
          .attr("d", line)
      }
      else { // add single line
        lines.append("path")
          .datum(streams[0])
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", colors[1])
          .attr("stroke-width", this.strokeWidth)
          .attr("d", line);
      }
      // y axis on the left
      focusChart.append("g")
        .attr("class", "axis axis--y")
        .call(yAxisLeft);

      insertHeight += height // update for insertion point for the next one

      // append to array
      FocusChildComponent.focusGroup.push({
        height: height,
        id: id,
        streams: streams,
        yScale: yScale,
        line: line,
        name: name,
        svgSelection: focusChart
      })
    });

    // Appends X to focus svg group
    FocusChildComponent.focusSVGGroup.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.focusStackedHeight + ")")
      .call(FocusChildComponent.xAxisFocus);

    // Append annotation brush
    this.highlighterBrushArea = FocusChildComponent.focusSVGGroup.append("g")
      .attr("id", "highlighterBrush")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .call(FocusChildComponent.highlighterBrush);

    // Appends zoom to svg over focus1 area
    FocusChildComponent.focusSVGGroup.append("rect")
      .attr("class", "zoom")
      .attr("width", FocusChildComponent.chartWidth)
      .attr("height", this.zoomHeight)
      .attr("fill-opacity", "0%")
      .call(FocusChildComponent.zoom);
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
  }

  private addElements() {

    // Annotchart1
    // Appends x axis
    FocusChildComponent.annotChart1.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + FocusChildComponent.contextHeight + ")")
      .call(FocusChildComponent.xAxisFocus);

  }

  private setContextBrush() {
    // create context brush feature
    FocusChildComponent.contextBrush = d3.brushX()
      .extent([[0, 0], [FocusChildComponent.chartWidth, FocusChildComponent.contextHeight]])
      .on("brush", FocusChildComponent.contextBrushed);

    // Appends brush to context, then sets initial pos
    FocusChildComponent.context.append("g")
      .attr("class", "main_brush")
      .call(FocusChildComponent.contextBrush)
      .call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range()); // sets initial brush state
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

  static contextBrushed() { // context brush handler
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || FocusChildComponent.x_context.range();
    FocusChildComponent.x.domain(s.map(FocusChildComponent.x_context.invert, FocusChildComponent.x_context));

    FocusChildComponent.updateFocus();

    FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxisFocus);

    var k = FocusChildComponent.chartWidth / (s[1] - s[0]);
    var Tx = -s[0];

    FocusChildComponent.focusSVGGroup.select(".zoom").call(FocusChildComponent.zoom.transform, d3.zoomIdentity
      .scale(k)
      .translate(Tx, 0));
    FocusChildComponent.updateBrushes()
  }

  static zoomed() { // zoom event handler
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    FocusChildComponent.x.domain(t.rescaleX(FocusChildComponent.x_context).domain()); // sets domain to scale with transform

    FocusChildComponent.updateFocus();

    FocusChildComponent.annotChart1.select(".axis--x").call(FocusChildComponent.xAxisFocus);

    FocusChildComponent.context.select(".main_brush").call(FocusChildComponent.contextBrush.move, FocusChildComponent.x.range().map(t.invertX, t));

    FocusChildComponent.updateBrushes()
  }

  static updateFocus() {
    // update line chart upon zoom/brush
    FocusChildComponent.focusGroup.forEach(focusChart => {
      focusChart.svgSelection.selectAll('.line').attr('d', focusChart.line) // lines
      FocusChildComponent.focusSVGGroup.select('.axis--x').call(FocusChildComponent.xAxisFocus); // bottom axis
    });
  }

  static updateBrushes() {
    // update annot brushes position upon zoom/brush
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

// can be made much simpler, will delete
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