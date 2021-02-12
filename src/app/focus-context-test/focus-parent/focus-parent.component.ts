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
  
  // Uncomment this block to enable obj id selector
  // objIdToSelect = []; 
  // objLabels = {
  // '5e9064411b806200123de098' : 'GoPro1',
  // '6717b212327a11eba4a87200' : 'MIQ1'};
  
  // Uncomment this block to enable chart config selector
  // selectedChartConfig;
  // availableChartConfigs = [];

  form: FormGroup;
  bikeRunsToSelect = [];
  availableBikeRuns;

  @ViewChild('focus1', { static: true }) chart: FocusChildComponent;

  constructor(
    private formBuilder: FormBuilder,
    private data_service: DataService,
    private chartConfigService: ChartConfigService) {
    this.form = this.formBuilder.group({
      bikeRuns: [''],
      configs: [''],
      devices: ['']
    });
  }

  ngOnInit(): void {
    this.getBikeRunObjects();
    // this.getDevices();
    // this.getConfigs();
    
    // Helper code:
    // Create new object(temporary hack because I couldnt create an object using the python interface)
    // var object:any={ name:"6717b212327a11eba4a87200", components:[{name:""}]};
    // this.data_service.addObject(object).subscribe(response =>{
    //   console.log("addobject",response);
    // });
  }

  private getBikeRunObjects() {
    // Fetches list of bike run objects for the user to select from
    this.data_service.listBikeRuns().subscribe((response) => {
      this.availableBikeRuns = response.data;
      var counter = 0;
      this.availableBikeRuns.forEach((element , index )=> {
        this.bikeRunsToSelect.push({idx: counter, id: element.runuuid, label:element.runName })
        counter++;
      });
    })
  }

  private getChartConfig(dataSources){
    // Hardcoded method for selecting a chart configuration based on the data sources listed on the bike run object
    if(dataSources.length === 1){
      if(dataSources.includes('gopro')){
        return this.chartConfigService.configs[0];
      }
    }
    else{
      if(dataSources.includes('miq')){
        return this.chartConfigService.configs[2];
      }
    }
  }


  submit() {
    // Init chart(tbd: once user has selected time range and camID)
    // Currently only works for 24 hour intervals
    if(this.bikeRunsToSelect[this.form.value.bikeRuns]=== undefined) {
      console.log("No bike run selected!")
      return
    }else{
      var selectedBikeRun = this.availableBikeRuns.filter(obj => {
        return obj.runuuid == this.bikeRunsToSelect[this.form.value.bikeRuns].id;
        })[0];
      console.log("selectedBikeRun",selectedBikeRun);

      var startDate = selectedBikeRun.startDate;
      var endDate = selectedBikeRun.endDate;
      var selectedObjId = selectedBikeRun.objId;
      var selectedChartConfig = this.getChartConfig(selectedBikeRun.dataSources);

      this.chart.getData(startDate, endDate, selectedObjId, selectedChartConfig);
    }
      
    // Previous way of building query
    // if (typeof (this.form.value.devices) === 'number' && 
    //     !isNaN(this.pickedDate) && 
    //     typeof (this.form.value.configs) === 'number') {
    //   this.startDate = this.toEpoch(this.pickedDate);
    //   var dayShift = this.pickedDate; // so as not to modify 'pickeDate'
    //   this.endDate = dayShift.setHours(dayShift.getHours() + 24).toString();
    //   this.selectedObj = this.objIdToSelect[this.form.value.devices].name
    //   this.selectedChartConfig = this.set_config()
    //   console.log("selected date range from: ", this.startDate, "to:", this.endDate);
    //   console.log("selected device:", this.selectedObj);
    //   this.makeChart();
    // }
    // else {
    //   console.log("Please select date and device!");
    // }
  }



  // Following code corresponds to the previous way of building the query!
  // Left commented for future reference

  // set_config(){
  // Returns the chart configuration object to be passed to FocusChildComponent to build the chart
  //   for(var i in this.chartConfigService.configs){
  //     // if the current config object's name matches the selected one.
  //     if(this.chartConfigService.configs[i].name == 
  //       this.availableChartConfigs[this.form.value.configs].name){
  //         return this.chartConfigService.configs[i]
  //       }
  //   }
  // }

  // getConfigs() {
  //   // Used to populate dropdown selection
  //   var counter = 0
  //   this.chartConfigService.configs.forEach(configObj => {
  //     var configName = configObj.name;
  //     this.availChartConfigs.push({ id: counter, name: configName });
  //     counter++;
  //   })
  // }

  // private getDevices() {
  //   // Fetches list of objects from database and builds dropdown selection array
  //   // Will only use entries containing a top level name field
  //   this.data_service.listSensors().subscribe((response) => {
  //     var counter = 0
  //     response.data.forEach((element, index) => {
  //       if (element.name) {
  //         this.objIdToSelect.push({ id: counter, name: element.name, label:this.objLabels[element.name] })
  //         counter++;
  //       }
  //     });
  //   });
  // }

  // setPickerDate(value) {
  //   // Used by datePicker to set user defined date selection
  //   this.pickedDate = value;
  // }

  // private makeChart() {
  //   this.chart.getData(this.startDate, this.endDate, this.selectedObj, this.selectedChartConfig);
  // }
}
