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
    const bearerToken = localStorage.getItem('BearerToken') ?? '';
    this.store.dispatch(LoadBearerTokenAction({ bearerToken }));

    const rawUser = localStorage.getItem('User');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        this.store.dispatch(SetUserAction({ user: { username: parsed.Username, role: parsed.Role } }));
      } catch {
        localStorage.removeItem('User');
      }
    }
  }
}
