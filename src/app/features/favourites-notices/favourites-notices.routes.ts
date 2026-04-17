import { Routes } from '@angular/router';

export const FAVOURITES_NOTICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-favourites/user-favourites.component').then((m) => m.UserFavouritesComponent)
  }
];
