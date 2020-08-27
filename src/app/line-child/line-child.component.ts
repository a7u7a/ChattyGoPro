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


  constructor(private elRef: ElementRef,private http: HttpClient) { 
    this.hostElement = this.elRef.nativeElement;

    
  }

  ngOnInit(): void {
    // Create chart once data has been loaded

    // Test with raw file
    // https://raw.githubusercontent.com/a7u7a/dummydata/master/gyroscope/gyro_1.csv

    this.http.get("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv",
    { responseType: 'text' }).subscribe(data => {
    var objs = d3.csvParse(data);
    this.createChart(objs);
    });

    this.margin = {top: 10, right:30, bottom:30, left: 60};
  }

  private createChart(objs){
    this.data = objs;
    this.setChart();

    this.sumstat = d3.nest()
        .key(function(d:any)  { return d.name; })
        .entries(this.data);

    // Create X axis
    this.x = d3.scaleLinear()
        .domain(d3.extent(this.data, (d:any) => { return d.year; }))
        .range([0, this.width]);
    this.svg.append("g")
        .attr("transform", "translate(" + 0 + " " +  this.height +")")
        .attr("stroke-width", 0.5)
        .call(d3.axisBottom(this.x).ticks(5));
    
    // Create Y axis
    this.y = d3.scaleLinear()
        .domain([0, d3.max(this.data, function(d:any){return +d.n; })])
        .range([this.height, 0]);
    this.svg.append("g")
        .call(d3.axisLeft(this.y));

    // Color palette
    var res = this.sumstat.map(function(d){ return d.key }) // list of group names
    var color = d3.scaleOrdinal()
                  .domain(res)
                  .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    this.svg.selectAll(".line")
    .data(this.sumstat)
     .enter()
     .append("path")
     .attr("fill", "none")
     .attr("stroke", d => { return color(d.key) })
     .attr("stroke-width", 1.5)
     .attr("d", (d) => {

       const lineFunction = d3.line()
       .x((d:any) => { console.log("hola", d.year); return this.x(d.year); }) //x q no imprime esos valores ??
       .y((d:any) => { return this.y(+d.n); });
       return lineFunction(d.values); // x q arroja -> TypeError: this.x is not a function ??

     })

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
}
