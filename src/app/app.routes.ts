import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
    children: [
      {
        path: '',
        redirectTo: 'league',
        pathMatch: 'full',
      },
      {
        path: 'league',
        loadComponent: () => import('./components/league/league.component').then((m) => m.LeagueComponent),
      },
      {
        path: 'playoff',
        loadComponent: () => import('./components/playoff/playoff.component').then((m) => m.PlayoffComponent),
      },
      {
        path: 'results',
        loadComponent: () => import('./components/results/results.component').then((m) => m.ResultsComponent),
      },
      {
        path: 'records',
        loadComponent: () => import('./components/records/records.component').then((m) => m.RecordsComponent),
      },
      {
        path: 'participants',
        loadComponent: () =>
          import('./components/participants/participants.component').then((m) => m.ParticipantsComponent),
      },
    ],
  },
];
