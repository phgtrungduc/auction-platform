import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
