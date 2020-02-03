import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {environment} from "./../environments/environment"
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { 

  }

  getData(){
    let headerJson = {
      'Content-Type': 'application/json',
      'Accept' : 'application/json',
    }
    const headers = new HttpHeaders(headerJson);
    return this.http.get(environment.URL, {headers}).pipe(map((responce:any) => responce));
  }
}
