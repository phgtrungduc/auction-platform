import { HttpErrorResponse, HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ServiceLocator } from '../base/service-locator';
import { Router } from '@angular/router';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = ServiceLocator.injector.get(Router);
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
          router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
}
