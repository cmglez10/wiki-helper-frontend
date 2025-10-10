import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { LeagueTeam } from '../http/interfaces/league.interface';
import { PlayoffRound } from '../http/interfaces/playoff.interface';
import { Records, ResultsData } from '../http/interfaces/results.interface';
import { Team } from '../http/interfaces/team.interface';

@Injectable({
  providedIn: 'root',
})
export class FreApiService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _baseUrl = 'http://localhost:3003/';

  public getLeague(groupId: number, section = Section.Masculino): Observable<LeagueTeam[]> {
    return this._http.get<LeagueTeam[]>(`${this._baseUrl}league/${groupId}/section/${section}`);
  }

  public getPlayoff(groupId: number, section = Section.Masculino): Observable<PlayoffRound[]> {
    return this._http.get<PlayoffRound[]>(`${this._baseUrl}playoff/${groupId}/section/${section}`);
  }

  public getResults(groupId: number, section = Section.Masculino): Observable<ResultsData> {
    return this._http.get<ResultsData>(`${this._baseUrl}results/${groupId}/section/${section}`);
  }

  public getRecords(groupIds: number[], section = Section.Masculino): Observable<Records> {
    return this._http.post<Records>(`${this._baseUrl}records/section/${section}`, { groupIds });
  }

  public getParticipants(groupIds: number[], section = Section.Masculino): Observable<Array<Team>> {
    return this._http.post<Array<Team>>(`${this._baseUrl}participants/section/${section}`, { groupIds });
  }
}
