import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, input, Signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { find } from 'lodash-es';
import { DateTime } from 'luxon';
import { Records } from '../../services/http/interfaces/results.interface';
import { IGroup } from '../multi-search/multi-search.component';

@Component({
  selector: 'cgi-records-display',
  templateUrl: './records-display.component.html',
  styleUrl: './records-display.component.scss',
  imports: [MatFormFieldModule, MatInputModule, CdkTextareaAutosize],
})
export class RecordsDisplayComponent {
  public readonly cgiRecordsDisplayRecords = input.required<Records>();
  public readonly cgiRecordsDisplayGroups = input<IGroup[]>([]);

  public readonly recordsCode: Signal<string>;

  constructor() {
    this.recordsCode = computed(() => {
      return this._getRecordsCode();
    });
  }

  private _getRecordsCode() {
    if (!this.cgiRecordsDisplayRecords()) {
      return '';
    }

    const today = DateTime.now();

    return `=== Récords ===

{| align="left" cellpadding="2" cellspacing="0" style="background: #f9f9f9; border: 1px #aaa solid; border-collapse: collapse; font-size: 85%;"
|- style="color:black;" bgcolor="#ccddcc"
!colspan=${this.cgiRecordsDisplayGroups().length > 1 ? '10' : '9'} bgcolor=#ccddcc width="100%"|{{font color|black|Récords de equipos}}
|-style="border: 1px #aaa solid;"
${this.cgiRecordsDisplayGroups().length > 1 ? '! width="15%" bgcolor=E6EEE6|Récord' : ''}
! width="15%" bgcolor=E6EEE6|Grupo
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
{{smaller|'''Fuente''': [https://www.futbol-regional.es/competicion.php?${this.cgiRecordsDisplayRecords().moreGoalsMatch[0].groupId} Fútbol Regional]. Actualizado a '''{{fecha|${today.day}|${today.month}|${today.year}}}'''.}}
`;
  }

  private _getMoreGoalsMatchCode(): string {
    const moreGoalsMatches = this.cgiRecordsDisplayRecords()!.moreGoalsMatch;

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
      code += `${this.cgiRecordsDisplayGroups().length > 1 ? '|' + this._getGroupName(moreGoalsMatches[i].groupId) : ''}
|${moreGoalsMatches[i].date}
|align=left| ${homeTeam} y ${awayTeam} (${moreGoalsMatches[i].goals})
|${homeTeam}|| {{bandera|tamaño=15px|${moreGoalsMatches[i].homeTeam.region}}}
|${moreGoalsMatches[i].result.home} – ${moreGoalsMatches[i].result.away}
|{{bandera|tamaño=15px|${moreGoalsMatches[i].awayTeam.region}}} || ${awayTeam}
|Jornada ${moreGoalsMatches[i].matchday}
`;
    }
    return code;
  }

  private _getBiggestHomeWinCode(): string {
    const biggestHomeWin = this.cgiRecordsDisplayRecords()!.biggestHomeWin;

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
      code += `${this.cgiRecordsDisplayGroups().length > 1 ? '|' + this._getGroupName(biggestHomeWin[i].groupId) : ''}
|${biggestHomeWin[i].date}
|align=left|${homeTeam} (+${biggestHomeWin[i].goals})
|'''${homeTeam}'''|| {{bandera|tamaño=15px|${biggestHomeWin[i].homeTeam.region}}}
|${biggestHomeWin[i].result.home} – ${biggestHomeWin[i].result.away}
|{{bandera|tamaño=15px|${biggestHomeWin[i].awayTeam.region}}} || ${awayTeam}
|Jornada ${biggestHomeWin[i].matchday}
`;
    }

    return code;
  }

  private _getBiggestAwayWinCode(): string {
    const biggestAwayWin = this.cgiRecordsDisplayRecords()!.biggestAwayWin;

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
      code += `${this.cgiRecordsDisplayGroups().length > 1 ? '|' + this._getGroupName(biggestAwayWin[i].groupId) : ''}
|${biggestAwayWin[i].date}
|align=left|${awayTeam} (+${biggestAwayWin[i].goals})
|${homeTeam}|| {{bandera|tamaño=15px|${biggestAwayWin[i].homeTeam.region}}}
|${biggestAwayWin[i].result.home} – ${biggestAwayWin[i].result.away}
|{{bandera|tamaño=15px|${biggestAwayWin[i].awayTeam.region}}} || '''${awayTeam}'''
|Jornada ${biggestAwayWin[i].matchday}
`;
    }

    return code;
  }

  private _getGroupName(groupId: number | string): string {
    const group = find(this.cgiRecordsDisplayGroups(), { id: groupId });
    return group ? group.name : '';
  }
}
