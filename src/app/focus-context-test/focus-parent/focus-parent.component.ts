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
  foo = 'Hello';
  public bar = 'World';

  @ViewChild('focus1', {static: true}) chart: FocusChildComponent;

  constructor(private data_service: DataService) { }

  ngOnInit(): void {
    this.chart.getData(this.startDate,this.endDate,this.selectedObj);

    this.loadDataBtn = document.getElementsByTagName("button")
    console.log("btns",this.loadDataBtn[1]);
    console.log("dateTimePicker",this.dateTimePicker);
    console.log("zet", this.bar);
  }

  changeFn(e) {
    this.foo = e.target.value;
    console.log(this.foo);
    console.log("zet",this.bar);
  }

  modelChangeFn(value) {
    this.bar = value;
    console.log(this.bar);
  }

  private makeChart(){
    
    // Create data selection objects
    // this.startDate = "1593028342060";
    // this.endDate = "1593028405691";
    // this.selectedObj = "5e9064411b806200123de098";



  }

}
