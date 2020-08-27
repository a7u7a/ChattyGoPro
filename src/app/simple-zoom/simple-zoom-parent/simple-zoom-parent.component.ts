import { Component, OnInit, ViewChild } from '@angular/core';
import { SimpleZoomChildComponent } from './../simple-zoom-child/simple-zoom-child.component';

@Component({
  selector: 'app-simple-zoom-parent',
  templateUrl: './simple-zoom-parent.component.html',
  styleUrls: ['./simple-zoom-parent.component.scss']
})
export class SimpleZoomParentComponent implements OnInit {
@ViewChild('simpleZoom', {static: true}) chart:SimpleZoomChildComponent;
  constructor() { }

  ngOnInit(): void {
  }

}
