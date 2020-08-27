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

  constructor(private elRef: ElementRef,private http: HttpClient) { 
    this.hostElement = this.elRef.nativeElement;

    
  }

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",
    { responseType: 'text' }).subscribe(data => {
    var objs = d3.csvParse(data, 
      function(d){
        return { date: d3.timeParse("%Y-%m-%d")(d.date),value:d.value}
      });
    this.createChart(objs);
    });

    this.margin = {top: 10, right:10, bottom:10, left: 25};
  }

  private createChart(objs){
    console.log(objs[0]);
    this.data = objs;
    this.setChart();

    // Create X axis
    this.x = d3.scaleTime()
        .domain(d3.extent(this.data, (d:any) => {return d.date})) // works even if highlighted
        .range([0, this.width]);
    this.svg.append("g")
        .attr("transform", "translate(" + 0 + " " +  this.height +")")
        .attr("stroke-width", 0.5)
        .call(d3.axisBottom(this.x));

    // Create Y axis
    this.y = d3.scaleLinear()
        .domain([0, d3.max(this.data, function(d:any) { return +d.value; })])
        .range([this.height, 0]);
    this.svg.append("g")
        .call(d3.axisLeft(this.y));
        console.log("henlo",this.x(1));
        

    // Add line
    this.svg.append("path")
        .datum(this.data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
          .x((d:any) => { return this.x(d.date)})
          .y((d:any) => { return this.y(d.value)})
        );


      

        this.svg.attr("transform", "translate(30,10)");
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
        .attr("transform", "translate(0,0)");


  }
}
