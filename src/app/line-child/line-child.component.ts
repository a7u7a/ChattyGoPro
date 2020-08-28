import { Component, OnInit, ViewEncapsulation, ElementRef,Input } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-line-child',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './line-child.component.html',
  styleUrls: ['./line-child.component.scss']
})
export class LineChildComponent implements OnInit {
  hostElement;
  svg;
  margin;
  width;
  height;
  x;
  y;
  data;
  sumstat;
  paths;
  top_limit;
  bottom_limit;
  static values;


  constructor(private elRef: ElementRef,private http: HttpClient) { 
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://raw.githubusercontent.com/a7u7a/dummydata/master/gyroscope/gyro_1.csv",
    { responseType: 'text' }).subscribe(data => {
    var objs = d3.csvParse(data, d3.autoType);
    this.createChart(objs);
    });

    this.margin = {top: 10, right:30, bottom:30, left: 60};
  }

  private createChart(objs){
    this.data = objs;
    this.setChart();
    this.processData();

    // Create X axis
    this.x = d3.scaleTime()
        .domain(d3.extent(this.data, (d:any) => { return d.date; }))
        .range([0, this.width]);
    this.svg.append("g")
        .attr("transform", "translate(" + 0 + " " +  this.height +")")
        .attr("stroke-width", 0.5)
        .call(d3.axisBottom(this.x));

    // Create Y axis
    this.y = d3.scaleLinear()
        .domain([this.bottom_limit+(this.bottom_limit*0.2), this.top_limit + (this.top_limit*0.2)])
        .range([this.height, 0]);
    this.svg.append("g")
        .call(d3.axisLeft(this.y));

    // Color palette
    var color = ['#e41a1c','#377eb8','#4daf4a'];

    // Create lines
    this.svg.selectAll(".line")
      .data(LineChildComponent.values)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke",d => {return color[LineChildComponent.values.indexOf(d)]} )
      .attr("stroke-width", 1.5)
      .attr("d", d => { 

      var line = d3.line()
      .x((f:any) => { return this.x(f.date); })
      .y((p:any) => { return this.y(p.val); })
      return line(d);
     });

     this.svg.attr("transform", "translate(0,0)");
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

    LineChildComponent.values = [gyro_x, gyro_y, gyro_z];
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
