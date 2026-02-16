import { HttpClient } from '@angular/common/http';
import { inject, Injectable, ɵ_sanitizeUrl } from '@angular/core';
import { Observable } from 'rxjs';
import { LeagueTeam } from '../http/interfaces/league.interface';
import { Records, ResultsData } from '../http/interfaces/results.interface';

@Injectable({
  providedIn: 'root',
})
export class FrfApiService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _baseUrl = 'http://localhost:3003/';

  public getLeague(url: string): Observable<LeagueTeam[]> {
    return this._http.post<LeagueTeam[]>(`${this._baseUrl}frf-league/`, { url: ɵ_sanitizeUrl(url) });
  }

  public getResults(url: string): Observable<ResultsData> {
    return this._http.post<ResultsData>(`${this._baseUrl}frf-results/`, { url: ɵ_sanitizeUrl(url) });
  }

  public getRecords(url: string): Observable<Records> {
    return this._http.post<Records>(`${this._baseUrl}frf-records/`, { url: ɵ_sanitizeUrl(url) });
  }
}
