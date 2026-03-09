import { Component, InjectionToken, Type } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppStates } from '../../store/app-state';
import { ServiceLocator } from './service-locator';

@Component({
  template: '',
})
export abstract class BaseComponent {
  protected destroy$ = new Subject<boolean>();
  protected store: Store<AppStates>;

  protected constructor() {
    this.store = this.getService<Store<AppStates>>(Store);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  protected getService<T>(token: Type<T> | InjectionToken<T>): T {
    return ServiceLocator.injector.get(token);
  }
}
