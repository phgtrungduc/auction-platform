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
    path: 'auction-org-detail',
    loadComponent: () =>
      import('./pages/auction-org-detail/auction-org-detail.component').then(m => m.AuctionOrgDetailComponent),
  },
  {
    path: 'auction-org-detail/:id',
    loadComponent: () =>
      import('./pages/auction-org-detail/auction-org-detail.component').then(m => m.AuctionOrgDetailComponent),
  },
  {
    path: 'asset-owner-detail',
    loadComponent: () =>
      import('./pages/asset-owner-detail/asset-owner-detail.component').then(m => m.AssetOwnerDetailComponent),
  },
  {
    path: 'favourites-notices',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../favourites-notices/favourites-notices.routes').then(m => m.FAVOURITES_NOTICES_ROUTES)
  },
  {
    path: 'user-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../auth/pages/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  }
];
