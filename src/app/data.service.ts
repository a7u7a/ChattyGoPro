import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as d3 from 'd3';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private  httpClient:HttpClient,
  ) { }

  public getGoProData(start,end,objectId,fields,nPerSec) {

    console.log("Fetching data from: ", environment.apiUrl);
    console.log("Query: ",{startDate:start, endDate:end, object:objectId, fields:fields});
  
    return this.httpClient.post<any>(environment.apiUrl + '/data/getRange', {startDate:start, endDate:end, object:objectId, fields:fields, num:nPerSec})  
  }

  public getAnnotations(object, start, end){
    return this.httpClient.post(environment.apiUrl + "/admin/annotations/range", {object: object, startDate: start,endDate:end})
  }

  public postAnnotation(){

  }
}