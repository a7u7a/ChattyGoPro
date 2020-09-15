import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.lancs';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private  httpClient:HttpClient,
  ) { }

  public getGoProData(start,end,objectId,fields,nPerSec) {
    console.log("Fetching data from: ", environment.apiUrl);
    console.log({startDate:start, endDate:end, object:objectId, fields:fields});
    return this.httpClient.post<any>(environment.apiUrl + '/data/getRange', {startDate:start, endDate:end, object:objectId, fields:fields, num:nPerSec} );
  }

  public getAnnotations(object, start, end){
    return this.httpClient.post(environment.apiUrl + "/admin/annotations/range", {object: object, startDate: start,endDate:end})
  }

  public postAnnotation(){

  }
}

/*
To be used on d3 chart component

private getData(){
  var startDate: string = "1563992772861";
  var endDate: string = "1563992832861";
  var selectedObj = "5d2c83b0ec75160674378a64";
  var selectedVis = ["acceleration","orientation","magnetometer","quaternion","orientation","gyroscope"];
  var all_data: any;
  this.data_service.getData(startDate,endDate, selectedObj, selectedVis, 1).subscribe((response)=>{
    all_data = response.data;
    console.log("all data", all_data);
  });
  return all_data;
}
*/