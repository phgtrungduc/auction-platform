import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products-listing',
    loadComponent: () =>
      import('./pages/products-page/products-page.component').then(m => m.ProductsPageComponent),
  },
];
