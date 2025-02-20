import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'league',
    pathMatch: 'full',
  },
  {
    path: 'league',
    loadComponent: () => import('./components/league/league.component').then((m) => m.LeagueComponent),
  },
];
