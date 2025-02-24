import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { LeagueTeam } from './interfaces/league.interface';
import { PlayoffRound } from './interfaces/playoff.interface';
import { ResultsData } from './interfaces/results.interface';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _baseUrl = 'http://localhost:3000/';

  public getLeague(groupId: number, section = Section.Masculino): Observable<LeagueTeam[]> {
    return this._http.get<LeagueTeam[]>(`${this._baseUrl}league/${groupId}/section/${section}`);
  }

  public getPlayoff(groupId: number, section = Section.Masculino): Observable<PlayoffRound[]> {
    return this._http.get<PlayoffRound[]>(`${this._baseUrl}playoff/${groupId}/section/${section}`);
  }

  public getResults(groupId: number, section = Section.Masculino): Observable<ResultsData> {
    return this._http.get<ResultsData>(`${this._baseUrl}results/${groupId}/section/${section}`);
  }
}
