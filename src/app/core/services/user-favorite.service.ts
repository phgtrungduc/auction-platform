import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { API_ENDPOINTS } from '@shared/data-access/api/api-endpoint';
import {
  CreateUserFavoriteRequest,
  CreateUserFavoriteResponse,
  DeleteUserFavoriteResponse,
  UserFavoritesQueryParams,
  UserFavoritesResponse
} from '../models/user-favorite.model';

@Injectable({
  providedIn: 'root'
})
export class UserFavoriteService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getUserFavorites(params?: UserFavoritesQueryParams): Observable<UserFavoritesResponse> {
    let httpParams = new HttpParams();
    const url = `${this.API_URL}${API_ENDPOINTS.USER_FAVORITES.GET_LIST}`;

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<UserFavoritesResponse>(url, { params: httpParams });
  }

  createUserFavorite(noticeId: number): Observable<CreateUserFavoriteResponse> {
    const url = `${this.API_URL}${API_ENDPOINTS.USER_FAVORITES.CREATE}`;
    const body: CreateUserFavoriteRequest = { noticeId };
    return this.http.post<CreateUserFavoriteResponse>(url, body);
  }

  deleteUserFavorite(favoriteId: number): Observable<DeleteUserFavoriteResponse> {
    const url = `${this.API_URL}${API_ENDPOINTS.USER_FAVORITES.DELETE}/${favoriteId}`;
    return this.http.delete<DeleteUserFavoriteResponse>(url);
  }
}
