import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

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
    component: MainLayoutComponent,
    loadChildren: () =>
      import('./features/home/home.routes').then(m => m.HOME_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
