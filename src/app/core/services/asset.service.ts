import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdvancedSearchRequest,
  AdvancedSearchResponse,
  PaginatedAssetsResponse,
  AssetQueryParams,
  MarketplaceNoticeDetail
} from '../models/asset.model';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@shared/data-access/api/api-endpoint';

export type AuctionOrgListResponse = {
  items: Array<{
    id: number;
    mojOrgId: number;
    fullName: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    websiteUrl: string;
    legalRepresentative: string;
    practicingCertificateNumber: string;
    totalAuctioneers: number;
    totalNotices: number;
    orgTypeCode: number;
    categoryLabel: string;
    categorySlug: string;
    createdAt: string;
    updatedAt: string;
    logoUrl?: string | null;

  }>;
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type AuctionOrgDetailResponse = {
  id: number;
  sourceId: string;
  mojOrgId: number;
  sourceDetailUrl?: string | null;
  orgTypeCode?: number | null;
  parentMojOrgId?: number | null;
  fullName: string;
  address?: string | null;
  cityId?: number | null;
  districtId?: number | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  legalRepresentative?: string | null;
  practicingCertificateNumber?: string | null;
  totalAuctioneers?: number | null;
  categoryLabel?: string | null;
  categorySlug?: string | null;
  createdAt?: string;
  updatedAt?: string;
  totalAssets?: number;
  totalNotices?: number;
  logoUrl?: string | null;
};

export type TopNoticeProvinceResponse = {
  items: Array<{
    provinceCode: string;
    provinceName: string;
    totalNotices: number;
    totalStartingPrice: number;
    totalWinningPrice: number;
  }>;
};

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

  advancedSearch(request?: AdvancedSearchRequest): Observable<AdvancedSearchResponse> {
    const url = `${this.API_URL}${API_ENDPOINTS.ASSET.ADVANCED_SEARCH}`;
    return this.http.post<AdvancedSearchResponse>(url, request ?? {});
  }

  getAuctionOrgs(params: {
    limit: number;
    offset: number;
    orgTypeCode?: number;
    isOrderDescNotices?: boolean;
  }): Observable<AuctionOrgListResponse> {
    const url = `${this.API_URL}${API_ENDPOINTS.ORG.SEARCH}`;
    let httpParams = new HttpParams()
      .set('Limit', String(params.limit))
      .set('Offset', String(params.offset));
    if (params.orgTypeCode != null && Number.isFinite(params.orgTypeCode)) {
      httpParams = httpParams.set('OrgTypeCode', String(params.orgTypeCode));
    }
    if (params.isOrderDescNotices === true) {
      httpParams = httpParams.set('IsOrderDescNotices', 'true');
    }
    return this.http.get<AuctionOrgListResponse>(url, { params: httpParams });
  }

  getAuctionOrgDetail(id: number | string): Observable<AuctionOrgDetailResponse> {
    const url = `${this.API_URL}${API_ENDPOINTS.ORG.SEARCH}/${id}`;
    return this.http.get<AuctionOrgDetailResponse>(url);
  }

  getTopNoticeProvinces(): Observable<TopNoticeProvinceResponse> {
    const url = `${this.API_URL}${API_ENDPOINTS.ASSET.TOP_NOTICES_PROVINCES}`;
    return this.http.get<TopNoticeProvinceResponse>(url);
  }
}
