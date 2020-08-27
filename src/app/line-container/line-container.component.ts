/* Parent for basic line chart */

import { Component, OnInit, ViewChild } from '@angular/core';
import { LineChildComponent } from './../line-child/line-child.component';


@Component({
  selector: 'app-line-container',
  templateUrl: './line-container.component.html',
  styleUrls: ['./line-container.component.scss']
})

export class LineContainerComponent implements OnInit {

  @ViewChild('lineBasic',{static: true}) chart: LineChildComponent;

  constructor() { }

  ngOnInit(): void {
  }

}
