import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../models/auth.model';
import { AppStates } from '../../../store/app-state';
import { LoadBearerTokenAction } from '../../../store/session/session.action';
import { SetUserAction } from '../../../store/user/user.action';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;
  private readonly requestOtpUrl = `${environment.apiUrl}/auth/request-otp`;
  private readonly verifyOtpUrl = `${environment.apiUrl}/auth/verify-otp`;
  private readonly registerUrl = `${environment.apiUrl}/auth/register`;

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<AppStates>,
  ) {}

  login(request: LoginRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(this.loginUrl, {
        email: request.email,
        password: request.password,
      })
      .pipe(
        tap(response => {
          if (response.accessToken) {
            this.persistAuthSession(response.accessToken, {
              username: response.email,
              role: 0,
            });
          }
        }),
      );
  }

  requestOtp(request: RequestOtpRequest): Observable<RequestOtpResponse> {
    return this.http.post<RequestOtpResponse>(this.requestOtpUrl, request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(this.verifyOtpUrl, request);
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    const payload: RegisterRequest = {
      email: request.email,
      password: request.password,
      ...(request.registrationToken ? { registrationToken: request.registrationToken } : {}),
    };

    return this.http.post<RegisterResponse>(this.registerUrl, payload).pipe(
      tap(response => {
        if (response.accessToken) {
          this.persistAuthSession(response.accessToken, {
            username: response.email,
            role: 0,
          });
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('BearerToken');
    localStorage.removeItem('User');
  }

  private persistAuthSession(token: string, user: { username: string; role: number }): void {
    localStorage.setItem('BearerToken', token);
    localStorage.setItem('User', JSON.stringify(user));
    this.store.dispatch(LoadBearerTokenAction({ bearerToken: token }));
    this.store.dispatch(SetUserAction({ user }));
  }
}
