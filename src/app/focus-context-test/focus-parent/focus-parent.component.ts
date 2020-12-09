import { Component, OnInit, ViewChild } from '@angular/core';
import { FocusChildComponent } from './../focus-child/focus-child.component';
import { DataService } from '../../data.service';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';
import * as d3 from 'd3';
import { ElementSchemaRegistry } from '@angular/compiler';
import { ChartConfigService } from '../../chart-config.service';


@Component({
  selector: 'app-focus-parent',
  templateUrl: './focus-parent.component.html',
  styleUrls: ['./focus-parent.component.scss']
})

export class FocusParentComponent implements OnInit {
  // startDate = "1593028342060";
  // endDate = "1593028405691";

  startDate;
  endDate;
  selectedObj;
  dateTimePicker;
  form: FormGroup;
  cameras = [];
  pickedDate;
  objLabels = {
  '5e9064411b806200123de098' : 'GoPro1',
  '6717b212327a11eba4a87200' : 'MIQ1'};

  selectedChartConfig;
  availChartConfigs = [];
  toEpoch = d3.timeFormat("%Q");

  @ViewChild('focus1', { static: true }) chart: FocusChildComponent;

  constructor(
    private formBuilder: FormBuilder,
    private data_service: DataService,
    private chartConfigService: ChartConfigService) {
    this.form = this.formBuilder.group({
      devices: [''], // formControlName!
      configs: ['']
    });
  }

  ngOnInit(): void {
    this.getDevices();
    this.getConfigs();

    // Create new object(temporary hack because I couldnt create an object using the python interface)
    // var object:any={ name:"6717b212327a11eba4a87200", components:[{name:""}]};
    // this.data_service.addObject(object).subscribe(response =>{
    //   console.log("addobject",response);
    // });
  }

  private getDevices() {
    // Fetches list of objects from database and builds dropdown selection array
    // Will only use entries containing a top level name field
    this.data_service.listSensors().subscribe((response) => {
      var counter = 0
      response.data.forEach((element, index) => {
        if (element.name) {
          this.cameras.push({ id: counter, name: element.name, label:this.objLabels[element.name] })
          counter++;
        }
      });
    });
  }

  submit() {
    // Init chart(tbd: once user has selected time range and camID)
    // Currently only works for 24 hour intervals

    if (typeof (this.form.value.devices) === 'number' && 
        !isNaN(this.pickedDate) && 
        typeof (this.form.value.configs) === 'number') {
      this.startDate = this.toEpoch(this.pickedDate);
      var dayShift = this.pickedDate; // so as not to modify 'pickeDate'
      this.endDate = dayShift.setHours(dayShift.getHours() + 24).toString();
      this.selectedObj = this.cameras[this.form.value.devices].name
      this.selectedChartConfig = this.set_config()
      console.log("selected date range from: ", this.startDate, "to:", this.endDate);
      console.log("selected device:", this.selectedObj);
      this.makeChart();
    }
    else {
      console.log("Please select date and device!");
    }
  }

  set_config(){
    for(var i in this.chartConfigService.configs){
      // if the current config object's name matches the selected one.
      if(this.chartConfigService.configs[i].name == 
        this.availChartConfigs[this.form.value.configs].name){
          return this.chartConfigService.configs[i]
        }
    }
  }


  getConfigs() {
    // Used to populate dropdown selection
    var counter = 0
    this.chartConfigService.configs.forEach(configObj => {
      var configName = configObj.name;
      this.availChartConfigs.push({ id: counter, name: configName });
      counter++;
    })
  }


  setPickerDate(value) {
    // Used by datePicker to set user defined date selection
    this.pickedDate = value;
  }

  private makeChart() {
    this.chart.getData(this.startDate, this.endDate, this.selectedObj, this.selectedChartConfig);
  }
}
