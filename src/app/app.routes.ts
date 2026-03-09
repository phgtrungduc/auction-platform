import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  // {
  //   path: '',
  //   canActivate: [authGuard],
  //   loadChildren: () =>
  //     import('./features/home/home.routes').then(m => m.HOME_ROUTES),
  // },
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then(m => m.HOME_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
