import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { isNumber, join, map } from 'lodash';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { ResultsData } from '../../services/http/interfaces/results.interface';
import { Utils } from '../../utilities/utils';
import { ISearchData, SearchComponent } from '../search/search.component';

@Component({
  selector: 'cgi-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  imports: [
    CdkTextareaAutosize,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    SearchComponent,
  ],
})
export class ResultsComponent {
  public readonly searchData: WritableSignal<ISearchData> = signal({
    group: null,
    section: Section.Masculino,
    flags: false,
  });
  public readonly loading = signal(false);
  public readonly wikiCode: Signal<string>;
  public readonly results: WritableSignal<ResultsData | null> = signal(null);

  private readonly _httpService: HttpService = inject(HttpService);

  constructor() {
    this.wikiCode = computed(() => {
      const code = `
  ${this._getCodeResults()}
`;
      return code;
    });
  }

  public getResults(event: ISearchData): void {
    let { group, section } = event;
    section = section || Section.Masculino;
    if (isNumber(group) && group > 0) {
      this.loading.set(true);
      this._httpService.getResults(10, group, 2024, section).subscribe((results) => {
        this.searchData.set(event);
        this.results.set(results);
        this.loading.set(false);
      });
    }
  }

  private _getTeamsInfo(): string {
    if (!this.results()) {
      return '';
    }

    const teams = map(this.results()!.teams, (team, index) => {
      return `|equipo${index + 1}=${Utils.getInitials(team.name)}`;
    });

    const teamNames = map(this.results()!.teams, (team) => {
      return `
|nombre_${Utils.getInitials(team.name)}=[[${team.completeName}|${team.name}]]`;
    });

    return `${join(teams, '')}
    ${join(teamNames, '')}`;
  }

  private _getTeamResults(): string {
    if (!this.results()) {
      return '';
    }

    let code = '';
    for (let i = 0; i < this.results()!.teams.length; i++) {
      for (let j = 0; j < this.results()!.teams.length; j++) {
        if (i === j) {
          continue;
        }

        const homeTeam = Utils.getInitials(this.results()!.teams[i].name);
        const awayTeam = Utils.getInitials(this.results()!.teams[j].name);
        const result = this.results()!.results[i][j]
          ? `${this.results()!.results[i][j].home}-${this.results()!.results[i][j].away}`
          : '';

        code += `|partido_${homeTeam}_${awayTeam}=${result}`;
        code += '\n';
      }
      code += '\n';
    }

    return code;
  }

  private _getCodeResults() {
    return `
{{#invoke:football results|main
| fuente=[https://www.futbol-regional.es/competicion.php?${this.searchData().group} Fútbol Regional]
| estilo_partidos= FBR
|actualizado=completo

${this._getTeamsInfo()}

${this._getTeamResults()}
}}
`;
  }
}
