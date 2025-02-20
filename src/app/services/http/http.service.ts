import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LeagueTeam } from './interfaces/league.interface';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _baseUrl = 'http://localhost:3000/';

  public getLeague(groupId: number, section = 'm'): Observable<LeagueTeam[]> {
    return this._http.get<LeagueTeam[]>(`${this._baseUrl}league/${groupId}/section/${section}`);
  }
}
