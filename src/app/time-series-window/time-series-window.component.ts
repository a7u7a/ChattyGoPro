import { Component, OnInit, ViewEncapsulation, Input, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { timeFormat, xml, thresholdSturges, svg, dsv } from 'd3';
import { visitAll } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { range } from 'rxjs';
 
@Component({
  selector: 'app-time-series-window',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './time-series-window.component.html',
  styleUrls: ['./time-series-window.component.scss']
})
export class TimeSeriesWindowComponent implements OnInit {
  @Input() xmax = 200;
  @Input() ymax = 200;
  hostElement;
  svg;
  x;
  y;
  margin;
  height;
  width;
  dummyData = [ {x:10, y:20}, {x:40, y:90}, {x:80, y:50} ];

  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
}

  ngOnInit(): void {
    // Create chart once data has been loaded
    this.http.get("https://gist.githubusercontent.com/tristanwietsma/f4997974b5602a5b48ec8eba104335d4/raw/8c077d84249752e4ed16354aa25040590243ce4b/sp500.csv",
     { responseType: 'text' }).subscribe(data => {
      var objs = d3.csvParse(data, d3.autoType);
      this.createChart(objs);
   });

   this.margin = {top: 10, right:10, bottom:10, left: 25};
  }

private createChart(objs){
  console.log(objs[0]);

  this.setChart();
  this.createXAxis();
  this.createYAxis();

  this.svg.selectAll("circles")
      .data(this.dummyData)
      .enter()
      .append("circle")
        .attr("cx", d => { return this.x(d.x) })
        .attr("cy", d => { return this.y(d.y) })
        .attr("r",7);


}


private setChart(){
  // max units of the viewbox
  let viewBoxHeight = 200;
  let viewBoxWidth = 200;

  this.height = viewBoxHeight - this.margin.right - this.margin.left;
  this.width = viewBoxWidth - this.margin.top - this.margin.bottom;

  this.svg = d3.select(this.hostElement).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
      .append('g')    
      .attr("transform", "translate(0,0)");
  
  //Viewbox debug
  // this.svg.append('rect')
  //     .attr('x', 0)
  //     .attr('y', 0)
  //     .attr('width', '100%')
  //     .attr('height', '100%')
  //     .attr('fill', 'transparent')
  //     .attr('stroke', 'black');

  this.svg.attr("transform", "translate(10,10)")

  
}


private createXAxis(){
  // Create linear scale used for X axis
  this.x = d3.scaleLinear()
    .domain([0,100]) // This is the min and the max of the data: 0 to 100 if percentages
    .range([0,this.width]); // This is the corresponding value I want in Pixel

// Apply to svg on the bottom
  this.svg.append('g')
    .attr("transform", "translate(" + 0 + " " +  this.height +")")
    .attr("stroke-width", 0.5)
    .call(d3.axisBottom(this.x));
}

private createYAxis(){
  this.y = d3.scaleLinear()
    .domain([0, 100])
    .range([this.height,0]);

  this.svg.append('g')
  .attr("stroke-width", 0.5)
  //.attr("transform", "translate("+ this.margin.left + " "+ this.margin.top + ")")
  .call(d3.axisLeft(this.y));
}
}



