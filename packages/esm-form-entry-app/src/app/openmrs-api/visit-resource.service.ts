import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WindowRef } from '../window-ref';
import {Encounter, Person, PersonUpdate} from '../types';

@Injectable()
export class VisitResourceService {
  public v = 'full';

  constructor(protected http: HttpClient, private windowRef: WindowRef) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'visit';
  }

  public getVisitByUuid(uuid: string, v: string = null): Observable<any> {
    let url = this.getUrl();
    url += '/' + uuid;

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : this.v);
    return this.http.get<Person>(url, { params });
  }

  public postVisitByUuid(uuid: string, payload: any): Observable<any> {

    if (!payload) {
      return null;
    }
    let url = this.getUrl() + 'visit';
    url += '/' + uuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Encounter>(url, JSON.stringify(payload), { headers });
  }

  public saveUpdatePerson(uuid: string, payload: PersonUpdate): Observable<Person> | null {
    if (!payload || !uuid) {
      return null;
    }

    const url = `${this.getUrl()}/${uuid}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post<{ person: Person }>(url, JSON.stringify(payload), { headers })
      .pipe(map((response) => response.person));
  }
}
