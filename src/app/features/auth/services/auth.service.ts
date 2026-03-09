import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { AppStates } from '../../../store/app-state';
import { LoadBearerTokenAction } from '../../../store/session/session.action';
import { SetUserAction } from '../../../store/user/user.action';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginUrl = `${environment.apiUrl}/user/login`;

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<AppStates>,
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.loginUrl, {
        Username: request.username,
        Password: request.password,
      })
      .pipe(
        tap(response => {
          if (response.isSuccess) {
            localStorage.setItem('BearerToken', response.jwt);
            localStorage.setItem('User', JSON.stringify(response.user));
            this.store.dispatch(LoadBearerTokenAction({ bearerToken: response.jwt }));
            this.store.dispatch(SetUserAction({ user: response.user }));
          }
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('BearerToken');
    localStorage.removeItem('User');
  }
}
