import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private  httpClient:HttpClient,
  ) { }

  public getData(start,end,objectId,fields,nPerSec) {

    console.log("Fetching data from: ", environment.apiUrl);
    console.log("Query: ",{startDate:start, endDate:end, object:objectId, fields:fields});

    return this.httpClient.post<any>(environment.apiUrl + '/data/getRange', {startDate:start, endDate:end, object:objectId, fields:fields, num:nPerSec})  
  }
  
  public getAnnotations(object, start, end){
    return this.httpClient.post<any>(environment.apiUrl + "/admin/annotations/range", {object: object, startDate: start,endDate:end})
  }

  public addAnnotation(annotation, object){
    return this.httpClient.post<any>(environment.apiUrl + '/admin/annotations/add', {annotation:annotation, object:object});
  }

  public deleteAnnotation(annotation_id){
    return this.httpClient.post<any>(environment.apiUrl + '/admin/annotations/delete', {annotation_id: annotation_id});
  }

  public listSensors(){
    return this.httpClient.post<any>(environment.apiUrl + '/admin/objects/list', {});
  }

  public addObject(object) {
    return this.httpClient.post<any>(environment.apiUrl + '/admin/objects/add', {object:object});
  }

  public listBikeRuns() {
    return this.httpClient.post<any>(environment.apiUrl + '/admin/bikeRuns/list', {});
  }
} 