import { Component, OnInit, ViewChild } from '@angular/core';
import { FocusChildComponent } from './../focus-child/focus-child.component';
import { DataService } from '../../data.service';
import { FormBuilder,FormGroup,FormArray,FormControl, ValidatorFn } from '@angular/forms';
import { of } from 'rxjs';

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
  testDate;
  form: FormGroup;
  orders = [];  

  @ViewChild('focus1', {static: true}) chart: FocusChildComponent;

  constructor(
    private formBuilder: FormBuilder, 
    private data_service: DataService) {
    this.form = this.formBuilder.group({
      orders: [''],
      testDate: String,
      
    });}

  ngOnInit(): void {
    // Init chart(tbd: once user has selected time range and camID)
    this.chart.getData(this.startDate,this.endDate,this.selectedObj);

    // this.loadDataBtn = document.getElementsByTagName("button")

    this.data_service.listSensors().subscribe((response)=> {
      console.log("sensor list:",response);
    })

    // async orders
    of(this.getOrders()).subscribe(orders => {
      this.orders = orders;
      this.form.controls.orders.patchValue(this.orders[0].id);
    });
  }

  getOrders() {
    return [
      { id: '1', name: 'cam1' },
      { id: '2', name: 'cam2' },
      { id: '3', name: 'cam3' },
      { id: '4', name: 'cam4' },
      { id: '5', name: 'cam5' }
    ];
  }

  submit() {
    console.log(this.form.value);
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
