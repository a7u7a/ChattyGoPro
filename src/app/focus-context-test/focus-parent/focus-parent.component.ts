import { Component, OnInit, ViewChild } from '@angular/core';
import { FocusChildComponent } from './../focus-child/focus-child.component';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-focus-parent',
  templateUrl: './focus-parent.component.html',
  styleUrls: ['./focus-parent.component.scss']
})
export class FocusParentComponent implements OnInit {
  @ViewChild('focus1', {static: true}) chart: FocusChildComponent;

  constructor(private data_service: DataService) { }

  ngOnInit(): void {
  }

}
