import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { ServiceLocator } from '../base/service-locator';
import { AppStates } from '../../store/app-state';
import { LoadBearerTokenAction } from '../../store/session/session.action';
import { SetUserAction } from '../../store/user/user.action';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(
    private readonly injector: Injector,
    private readonly store: Store<AppStates>,
  ) {
    ServiceLocator.injector = injector;
  }

  public async init(): Promise<void> {
    this.restoreSession();
  }

  private restoreSession(): void {
    const bearerToken = localStorage.getItem('BearerToken');
    
    if (!bearerToken) {
      return;
    }
    
    try {
      const payload = JSON.parse(atob(bearerToken.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('BearerToken');
        localStorage.removeItem('User');
        return;
      }
    } catch {
      localStorage.removeItem('BearerToken');
      localStorage.removeItem('User');
      return;
    }

    this.store.dispatch(LoadBearerTokenAction({ bearerToken }));

    const rawUser = localStorage.getItem('User');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        this.store.dispatch(
          SetUserAction({
            user: {
              username: parsed.username ?? parsed.Username ?? '',
              role: parsed.role ?? parsed.Role ?? 0,
            },
          }),
        );
      } catch {
        localStorage.removeItem('User');
      }
    }
  }
}
