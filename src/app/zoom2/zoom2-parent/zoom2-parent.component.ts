import { Component, OnInit, ViewChild } from '@angular/core';
import { Zoom2ChildComponent } from './../zoom2-child/zoom2-child.component';

@Component({
  selector: 'app-zoom2-parent',
  templateUrl: './zoom2-parent.component.html',
  styleUrls: ['./zoom2-parent.component.scss']
})
export class Zoom2ParentComponent implements OnInit {
  @ViewChild('zoom2', {static: true}) chart: Zoom2ChildComponent;
  constructor() { }

  ngOnInit(): void {
  }

}
