import { Component, OnInit, ViewEncapsulation, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-simple-zoom-child',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './simple-zoom-child.component.html',
  styleUrls: ['./simple-zoom-child.component.scss']
})
export class SimpleZoomChildComponent implements OnInit {
  hostElement;
  svg;
  margin;
  width;
  height;
  static x;
  static y;
  data;
  sumstat;
  paths;
  clip;
  static brush;
  static line;
  static xAxis;
  yAxis;
  pisha;
  static values;
  top_limit;
  bottom_limit;

    constructor(private elRef: ElementRef,private http: HttpClient) { 
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://raw.githubusercontent.com/a7u7a/dummydata/master/gyroscope/gyro_1.csv",
    { responseType: 'text' }).subscribe(data => {
    var objs = d3.csvParse(data, function(d) {
       return {
         date: d3.timeParse("%Y-%m-%d")(d.date),
         gyro_x: d.gyro_x, 
         gyro_y:d.gyro_y,
         gyro_z: d.gyro_z }
        });
    this.createChart(objs);
    });

    this.margin = {top: 10, right:30, bottom:30, left: 60};
  }
 
  private createChart(objs){
    console.log(objs);
    this.data = objs;
    this.setChart();
    this.processData();
    
    console.log("values",SimpleZoomChildComponent.values[0]);
    var test_data = SimpleZoomChildComponent.values[0];

    // Create X axis
    SimpleZoomChildComponent.x = d3.scaleTime()
        .domain(<[Date,Date]>d3.extent(objs, (d:any) => { return d.date; })) // Type issue solved with: https://stackoverflow.com/questions/52124689/argument-of-type-string-string-error-in-angular-and-d3
        .range([0, this.width]);
        SimpleZoomChildComponent.xAxis = this.svg.append("g")
        .attr("transform", "translate(" + 0 + " " +  this.height +")")
        .attr("stroke-width", 0.5)
        .call(d3.axisBottom(SimpleZoomChildComponent.x));

    // Create Y axis
    SimpleZoomChildComponent.y = d3.scaleLinear()
        .domain([this.bottom_limit+(this.bottom_limit*0.2), this.top_limit + (this.top_limit*0.2)])
        .range([this.height, 0]);
    this.yAxis = this.svg.append("g")
        .call(d3.axisLeft(SimpleZoomChildComponent.y));

    // Add clip path
    this.clip = this.svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", this.width )
        .attr("height", this.height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    SimpleZoomChildComponent.brush = d3.brushX()        // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [this.width,this.height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", this.updateChart)                    // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable: where both the line and the brush take place
    SimpleZoomChildComponent.line = this.svg.append('g')
          .attr("clip-path", "url(#clip)")
    
    // Color palette
    var color = ['#e41a1c','#377eb8','#4daf4a'];

    // Add the line
    SimpleZoomChildComponent.line.selectAll(".line")
      .data(SimpleZoomChildComponent.values)
      .enter()
      .append("path")
      .attr("class", "line")  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", d => {return color[SimpleZoomChildComponent.values.indexOf(d)]})
      .attr("stroke-width", 1.5)
      .attr("d", SimpleZoomChildComponent.setLine());
      
    // Add the brushing to the line
    SimpleZoomChildComponent.line.append("g")
      .attr("class", "brush")
      .call(SimpleZoomChildComponent.brush);

    //   // If user double click, reinitialize the chart
    this.svg.on("dblclick",()=>{
      SimpleZoomChildComponent.x.domain(d3.extent(this.data, (d:any) => { return d.date; }))
      SimpleZoomChildComponent.xAxis.transition().call(d3.axisBottom(SimpleZoomChildComponent.x))
      SimpleZoomChildComponent.line.selectAll('.line')
        .transition()
        .attr("d", SimpleZoomChildComponent.setLine());
    });

     this.svg.attr("transform", "translate(0,10)");
  }

  static setLine(){
    return d3.line()
              .x((d:any) => { return SimpleZoomChildComponent.x(d.date) })
              .y((d:any) => { return SimpleZoomChildComponent.y(d.val) })
  }


  private updateChart(){

    var idleTimeout;
    //function idled() { idleTimeout = null; } 

    // Get extent of selection
    var extent = d3.event.selection;
    
    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(d => {idleTimeout = null}, 350); // This allows to wait a little bit
      SimpleZoomChildComponent.x.domain([4,8])
      
    }else{
      // Transfer brush selection as the new domain for x axis
      SimpleZoomChildComponent.x.domain([ SimpleZoomChildComponent.x.invert(extent[0]), SimpleZoomChildComponent.x.invert(extent[1]) ]);
      SimpleZoomChildComponent.line.select(".brush").call(SimpleZoomChildComponent.brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

      // Update axis and line position
      SimpleZoomChildComponent.xAxis
          .transition()
          .duration(1000)
          .call(d3.axisBottom(SimpleZoomChildComponent.x));

      SimpleZoomChildComponent.line.selectAll('.line')
          .transition()
          .duration(1000)
          .attr("d", SimpleZoomChildComponent.setLine());

    }
  



  private setChart(){
    let viewBoxHeight = 500;
    let viewBoxWidth = 800;

    this.height = viewBoxHeight - this.margin.right - this.margin.left;
    this.width = viewBoxWidth - this.margin.top - this.margin.bottom;

    this.svg = d3.select(this.hostElement).append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
        .append('g')
        .attr("transform", "translate("+this.margin.left + this.margin.top +")");
  }

  private processData(){
    // Split and find max min values
    var gyro_x = [];
    var gyro_y = [];
    var gyro_z = [];
    var x_range = [];
    var y_range = [];
    var z_range = [];

    this.data.forEach((d) => { 
      gyro_x.push({"date": d.date, "val": d.gyro_x});
      gyro_y.push({"date": d.date, "val": d.gyro_y});
      gyro_z.push({"date": d.date, "val": d.gyro_z});

      x_range.push(d.gyro_x);
      y_range.push(d.gyro_y);
      z_range.push(d.gyro_z);
    });

    SimpleZoomChildComponent.values = [gyro_x, gyro_y, gyro_z];
    // Find top limit
    this.top_limit = Math.max.apply(null,[
      Math.max.apply(null,x_range),
      Math.max.apply(null,y_range),
      Math.max.apply(null,z_range)
    ]);
    // Find bottom limit
    this.bottom_limit =  Math.min.apply(null,[
      Math.min.apply(null,x_range),
      Math.min.apply(null,y_range),
      Math.min.apply(null,z_range)
    ]);
  }


}
