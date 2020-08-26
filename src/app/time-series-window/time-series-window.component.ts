// Adapted from: https://gist.github.com/robyngit/89327a78e22d138cff19c6de7288c1cf
// Using this reference: https://medium.com/better-programming/reactive-charts-in-angular-8-using-d3-4550bb0b4255

import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
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
  hostElement;
  svg;
  x;
  y;
  xmax = 45;
  ymax = 200;

  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
}

  ngOnInit(): void {


    this.http.get("https://gist.githubusercontent.com/tristanwietsma/f4997974b5602a5b48ec8eba104335d4/raw/8c077d84249752e4ed16354aa25040590243ce4b/sp500.csv",
     { responseType: 'text' }).subscribe(data => {
      var objs = d3.csvParse(data, d3.autoType);
      this.createChart(objs);
   });
  }

private createChart(objs){
  console.log(objs[0]);

  this.setChartDimensions();
  this.createXAxis();
  this.createYAxis();


  


this.svg.append("circle")
    .attr("cx", this.x(2))
    .attr("cy", 13)
    .attr("r", 4)
    .style("fill", "yellow");

    this.svg.append("circle")
    .attr("cx", this.x(1))
    .attr("cy", 13)
    .attr("r", 4)
    .style("fill", "red");

this.svg.append("circle")
    .attr("cx", this.x(5))
    .attr("cy", 14)
    .attr("r", 4)
    .style("fill", "green");

}

private setChartDimensions(){
  // max units of the viewbox
  let viewBoxHeight = 100;
  let viewBoxWidth = 200;
  this.svg = d3.select(this.hostElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight);

    
}

private createXAxis(){
  // Create linear scale used for X axis
  this.x = d3.scaleLinear()
    .domain([0,this.xmax]) // This is the min and the max of the data: 0 to 100 if percentages
    .range([0,100]); // This is the corresponding value I want in Pixel

  
// Apply to svg on the bottom
  this.svg.append('g')
    .attr("transform", "translate(0," + 50 + ")")
    .call(d3.axisBottom(this.x));
}


private createYAxis(){
  this.y = d3.scaleLinear()
    .domain([0, this.ymax])
    .range([50,0]);

  this.svg.append('g')
  .attr("transform", "translate(5," + 0 + ")")
      .call(d3.axisLeft(this.y));
}
}



