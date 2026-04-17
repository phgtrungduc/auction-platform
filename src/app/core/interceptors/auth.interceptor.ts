import { HttpErrorResponse, HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ServiceLocator } from '../base/service-locator';
import { Router } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';
import { Store } from '@ngrx/store';
import { ClearSessionAction } from '../../store/session/session.action';
import { ClearUserAction } from '../../store/user/user.action';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = ServiceLocator.injector.get(Router);
  const logger = ServiceLocator.injector.get(LoggerService);
  const isAuthPublicEndpoint =
    req.url.includes('login') ||
    req.url.includes('register') ||
    req.url.includes('request-otp') ||
    req.url.includes('verify-otp');

  if (!isAuthPublicEndpoint) {
    const bearerToken = localStorage.getItem('BearerToken');
    const cloneRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + bearerToken),
    });
    return next(cloneRequest).pipe(
      tap(event => {
        if (event.type === HttpEventType.Response) {
          console.log(req.url, 'returned a response with status', event.status);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('BearerToken');
          localStorage.removeItem('User');
          const store = ServiceLocator.injector.get(Store);
          store.dispatch(ClearSessionAction());
          store.dispatch(ClearUserAction());
          logger.info("Cần đăng nhập để sử dụng chức năng này!");
          //router.navigate(['/']);
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
}
