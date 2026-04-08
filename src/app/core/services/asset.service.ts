import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedAssetsResponse, AssetQueryParams, MarketplaceNoticeDetail } from '../models/asset.model';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@shared/data-access/api/api-endpoint';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private http = inject(HttpClient);
  // Ideally this base URL should be in environment.apiUrl
  private readonly API_URL = environment.apiUrl;

  getAssets(params?: AssetQueryParams): Observable<PaginatedAssetsResponse> {
    let httpParams = new HttpParams();
    const url = this.API_URL + API_ENDPOINTS.ASSET.GET_LIST;
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedAssetsResponse>(url, { params: httpParams });
  }

  getDetail(id: number | string): Observable<MarketplaceNoticeDetail> {
    const url = `${this.API_URL}${API_ENDPOINTS.ASSET.GET_DETAIL}/${id}`;
    return this.http.get<MarketplaceNoticeDetail>(url);
  }
}
