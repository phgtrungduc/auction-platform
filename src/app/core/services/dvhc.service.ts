import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dvhc, DvhcQueryParams } from '../models/dvhc.model';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@shared/data-access/api/api-endpoint';

@Injectable({
  providedIn: 'root'
})
export class DvhcService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getWards(params: DvhcQueryParams): Observable<Dvhc[]> {
    let httpParams = new HttpParams();
    const url = this.API_URL + API_ENDPOINTS.DVHC.GET_WARDS;
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Dvhc[]>(url, { params: httpParams });
  }

  getDistricts(params: DvhcQueryParams): Observable<Dvhc[]> {
    let httpParams = new HttpParams();
    const url = this.API_URL + API_ENDPOINTS.DVHC.GET_DISTRICTS;
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Dvhc[]>(url, { params: httpParams });
  }

  getProvinces(): Observable<Dvhc[]> {
    const url = this.API_URL + API_ENDPOINTS.DVHC.GET_PROVINCES;

    return this.http.get<Dvhc[]>(url);
  }
}
