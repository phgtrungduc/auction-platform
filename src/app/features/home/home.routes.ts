import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

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
  {
    path: 'product-detail/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'favourites-notices',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../favourites-notices/favourites-notices.routes').then(m => m.FAVOURITES_NOTICES_ROUTES)
  }
];
