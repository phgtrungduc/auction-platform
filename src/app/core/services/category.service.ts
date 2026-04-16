import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@shared/data-access/api/api-endpoint';
import { AssetCategory, LegalCategory } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getAssetCategories(activeOnly = true): Observable<AssetCategory[]> {
    const url = `${this.API_URL}${API_ENDPOINTS.CATEGORY.GET_ASSET_CATEGORIES}`;
    const params = new HttpParams().set('activeOnly', String(activeOnly));
    return this.http.get<AssetCategory[]>(url, { params });
  }

  getLegalCategories(activeOnly = true): Observable<LegalCategory[]> {
    const url = `${this.API_URL}${API_ENDPOINTS.CATEGORY.GET_LEGAL_CATEGORIES}`;
    const params = new HttpParams().set('activeOnly', String(activeOnly));
    return this.http.get<LegalCategory[]>(url, { params });
  }
}

