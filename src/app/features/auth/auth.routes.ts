import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/auth-popup/auth-popup.component').then(m => m.AuthPopupComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
