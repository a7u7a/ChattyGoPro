import { Component, OnInit, ViewChild } from '@angular/core';
import { FocusChildComponent } from './../focus-child/focus-child.component';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-focus-parent',
  templateUrl: './focus-parent.component.html',
  styleUrls: ['./focus-parent.component.scss']
})

export class FocusParentComponent implements OnInit {
  startDate = "1593028342060";
  endDate = "1593028405691";
  selectedObj = "5e9064411b806200123de098";
  loadDataBtn;
  dateTimePicker;
  testDate
  

  @ViewChild('focus1', {static: true}) chart: FocusChildComponent;

  constructor(private data_service: DataService) { }

  ngOnInit(): void {
    this.chart.getData(this.startDate,this.endDate,this.selectedObj);

    this.loadDataBtn = document.getElementsByTagName("button")
  }

  setPickerDate(value) {    
    console.log(value);
  }

  private makeChart(){
    
    // Create data selection objects
    // this.startDate = "1593028342060";
    // this.endDate = "1593028405691";
    // this.selectedObj = "5e9064411b806200123de098";



  }

}
