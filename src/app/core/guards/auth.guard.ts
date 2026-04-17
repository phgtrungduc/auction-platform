import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { ServiceLocator } from '../base/service-locator';
import { AppStates, getBearerToken } from '../../store/app-state';
import { LoggerService } from '@core/services/logger.service';

export const authGuard: CanActivateFn = (route, state) => {
  const store = ServiceLocator.injector.get(Store<AppStates>);
  const router = ServiceLocator.injector.get(Router);
  const logger = ServiceLocator.injector.get(LoggerService);
  const isLoginPath = state.url.includes('login');

  return store.select(getBearerToken).pipe(
    map(bearerToken => {
      const isAuthenticated = bearerToken != null && bearerToken !== '';

      if (isLoginPath && !isAuthenticated) return true;
      if (!isLoginPath && isAuthenticated) return true;

      if (isLoginPath) {
        router.navigate(['/']);
      } else {
        router.navigate(['/']);
        logger.info('Cần đăng nhập để sử dụng chức năng này!');
      }
      return false;
    }),
  );
};
