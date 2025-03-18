import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { isNumber, join, map } from 'lodash-es';
import { DateTime } from 'luxon';
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
  public readonly recordsCode: Signal<string>;
  public readonly results: WritableSignal<ResultsData | null> = signal(null);

  private readonly _httpService: HttpService = inject(HttpService);

  constructor() {
    this.wikiCode = computed(() => {
      return this._getCodeResults();
    });

    this.recordsCode = computed(() => {
      return this._getRecordsCode();
    });
  }

  public getResults(event: ISearchData): void {
    let { group, section } = event;
    section = section || Section.Masculino;
    if (isNumber(group) && group > 0) {
      this.loading.set(true);
      this.results.set(null);
      this._httpService.getResults(group, section).subscribe((results) => {
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
=== Tabla de resultados cruzados ===
<center>

{{#invoke:football results|main
| fuente=[https://www.futbol-regional.es/competicion.php?${this.searchData().group} Fútbol Regional]
| estilo_partidos= FBR
|actualizado=completo

${this._getTeamsInfo()}

${this._getTeamResults()}
}}
</center>
`;
  }

  private _getRecordsCode() {
    if (!this.results()) {
      return '';
    }

    const today = DateTime.now();

    return `=== Récords ===

{| align="left" cellpadding="2" cellspacing="0" style="background: #f9f9f9; border: 1px #aaa solid; border-collapse: collapse; font-size: 85%;"
|- style="color:black;" bgcolor="#ccddcc"
!colspan=9 bgcolor=#ccddcc width="100%"|{{font color|black|Récords de equipos}}
|-style="border: 1px #aaa solid;"
! width="15%" bgcolor=E6EEE6|Récord
! width="15%" bgcolor=E6EEE6|Fecha
! width="15%" bgcolor=E6EEE6|Equipo/s
! width="20%" bgcolor=E6EEE6|Local
! bgcolor=E6EEE6|
! bgcolor=E6EEE6|Resultado
! bgcolor=E6EEE6|
! width="20%" bgcolor=E6EEE6|Visitante
! width="15%" bgcolor=E6EEE6|{{abreviación|Rep.|Reporte}}

${this._getMoreGoalsMatchCode()}
${this._getBiggestHomeWinCode()}
${this._getBiggestAwayWinCode()}
|}
{{smaller|'''Fuente''': [https://www.futbol-regional.es/competicion.php?${this.searchData().group} Fútbol Regional]. Actualizado a '''{{fecha|${today.day}|${today.month}|${today.year}}}'''.}}
`;
  }

  private _getMoreGoalsMatchCode(): string {
    const moreGoalsMatches = this.results()!.records.moreGoalsMatch;

    if (moreGoalsMatches.length === 0) {
      return '';
    }

    let code = '';

    for (let i = 0; i < moreGoalsMatches.length; i++) {
      const homeTeam = `[[${moreGoalsMatches[i].homeTeam.completeName}|${moreGoalsMatches[i].homeTeam.name}]]`;
      const awayTeam = `[[${moreGoalsMatches[i].awayTeam.completeName}|${moreGoalsMatches[i].awayTeam.name}]]`;

      code += `|- align=center style="border: 1px #aaa solid;"\n`;
      if (i === 0) {
        code += `|style="border: 1px #aaa solid;" bgcolor=E6EEE6 rowspan=${moreGoalsMatches.length}|Más goles en un partido\n`;
      }
      code += `|
|align=left| ${homeTeam} y ${awayTeam} (${moreGoalsMatches[i].goals})
|${homeTeam}|| {{bandera|tamaño=15px|${moreGoalsMatches[i].homeTeam.flag}}}
|${moreGoalsMatches[i].result.home} – ${moreGoalsMatches[i].result.away}
|{{bandera|tamaño=15px|${moreGoalsMatches[i].awayTeam.flag}}} || ${awayTeam}
|
`;
    }
    return code;
  }

  private _getBiggestHomeWinCode(): string {
    const biggestHomeWin = this.results()!.records.biggestHomeWin;

    if (biggestHomeWin.length === 0) {
      return '';
    }

    let code = '';

    for (let i = 0; i < biggestHomeWin.length; i++) {
      const homeTeam = `[[${biggestHomeWin[i].homeTeam.completeName}|${biggestHomeWin[i].homeTeam.name}]]`;
      const awayTeam = `[[${biggestHomeWin[i].awayTeam.completeName}|${biggestHomeWin[i].awayTeam.name}]]`;

      code += `|- align=center style="border: 1px #aaa solid;"\n`;
      if (i === 0) {
        code += `|style="border: 1px #aaa solid;" bgcolor=E6EEE6 rowspan=${biggestHomeWin.length}|Mayor victoria local\n`;
      }
      code += `|
|align=left|${homeTeam} (+${biggestHomeWin[i].goals})
|'''${homeTeam}'''|| {{bandera|tamaño=15px|${biggestHomeWin[i].homeTeam.flag}}}
|${biggestHomeWin[i].result.home} – ${biggestHomeWin[i].result.away}
|{{bandera|tamaño=15px|${biggestHomeWin[i].awayTeam.flag}}} || ${awayTeam}
|
`;
    }

    return code;
  }

  private _getBiggestAwayWinCode(): string {
    const biggestAwayWin = this.results()!.records.biggestAwayWin;

    if (biggestAwayWin.length === 0) {
      return '';
    }

    let code = '';

    for (let i = 0; i < biggestAwayWin.length; i++) {
      const homeTeam = `[[${biggestAwayWin[i].homeTeam.completeName}|${biggestAwayWin[i].homeTeam.name}]]`;
      const awayTeam = `[[${biggestAwayWin[i].awayTeam.completeName}|${biggestAwayWin[i].awayTeam.name}]]`;

      code += `|- align=center style="border: 1px #aaa solid;"\n`;
      if (i === 0) {
        code += `|style="border: 1px #aaa solid;" bgcolor=E6EEE6 rowspan=${biggestAwayWin.length}|Mayor victoria visitante\n`;
      }
      code += `|
|align=left|${awayTeam} (+${biggestAwayWin[i].goals})
|${homeTeam}|| {{bandera|tamaño=15px|${biggestAwayWin[i].homeTeam.flag}}}
|${biggestAwayWin[i].result.home} – ${biggestAwayWin[i].result.away}
|{{bandera|tamaño=15px|${biggestAwayWin[i].awayTeam.flag}}} || '''${awayTeam}'''
|
`;
    }

    return code;
  }
}
