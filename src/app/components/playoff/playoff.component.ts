import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { isNumber, last, split } from 'lodash-es';
import { DateTime } from 'luxon';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { Playoff, PlayoffMatch, PlayoffRound } from '../../services/http/interfaces/playoff.interface';
import { ISearchData } from '../search/interfaces/search-response.interface';
import { SearchComponent } from '../search/search.component';

interface MatchResult {
  homeGoals: number;
  awayGoals: number;
}

@Component({
  selector: 'cgi-playoff',
  templateUrl: './playoff.component.html',
  styleUrl: './playoff.component.scss',
  imports: [SearchComponent, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, CdkTextareaAutosize],
})
export class PlayoffComponent {
  public readonly searchData: WritableSignal<ISearchData> = signal({
    groupId: 0,
    section: Section.Masculino,
    flags: false,
  });
  public readonly loading = signal(false);
  public readonly wikiCode: Signal<string>;
  public readonly playoffs: WritableSignal<PlayoffRound[]> = signal([]);

  private readonly _httpService: HttpService = inject(HttpService);

  constructor() {
    this.wikiCode = computed(() => {
      const code = `
  ${this._getCodePlayoffRounds()}
`;
      return code;
    });
  }

  public getPlayoff(event: ISearchData): void {
    let { groupId: group, section } = event;
    section = section || Section.Masculino;
    if (isNumber(group) && group > 0) {
      this.loading.set(true);
      this._httpService.getPlayoff(group, section).subscribe((playoffs) => {
        this.searchData.set(event);
        this.playoffs.set(playoffs);
        this.loading.set(false);
      });
    }
  }

  private _getCodePlayoffRounds() {
    let res = '';
    for (const playoffRound of this.playoffs()) {
      res += `
== ${playoffRound.name} ==
${this.getCodePlayoffResume(playoffRound.playoffs)}

${this.getCodePlayoffMatches(playoffRound.playoffs)}
`;
    }

    return res;
  }

  public getCodePlayoffResume(playoffs: Playoff[]) {
    const maxNumberLegs = this.getMaxNumberLegs(playoffs);
    if (maxNumberLegs <= 1) {
      return '';
    }

    let res = `=== Cuadro ===
    {{TwoLegStart|partidos=${maxNumberLegs}}}`;
    for (const playoff of playoffs) {
      let homeNameLink = `[[${playoff.matches[0].homeCompleteName}|${playoff.matches[0].homeName}]]`;
      let awayNameLink = `[[${playoff.matches[0].awayCompleteName}|${playoff.matches[0].awayName}]]`;

      if (playoff.winner === 1) {
        homeNameLink = this.boldName(homeNameLink);
      } else if (playoff.winner === 2) {
        awayNameLink = this.boldName(awayNameLink);
      }

      res += `
      {{TwoLegResult
        | ${homeNameLink}
        | ${this.searchData().flags ? playoff.matches[0].homeFlag : ''}
        | ${this.getGlobalResultTxt(playoff)}
        | ${awayNameLink}
        | ${this.searchData().flags ? playoff.matches[0].awayFlag : ''}
        | ganador=${playoff.winner}`;
      for (const match of playoff.matches) {
        const result = this.getNormalizeResult(match, playoff.matches[0].homeName);
        res += `
        | ${result.homeGoals}-${result.awayGoals}`;
      }
      res += `
      }}`;
    }
    res += `
|}`;
    return res;
  }

  public boldName(name: string) {
    return `'''${name}'''`;
  }

  public getCodePlayoffMatches(playoffs: Playoff[]) {
    let res = `=== Partidos ===
`;

    for (const playoff of playoffs) {
      for (let i = 0; i < playoff.matches.length; i++) {
        const match = playoff.matches[i];
        res += `
{{Partidos`;
        if (playoff.matches.length > 1) {
          res += `
| competición = ${this.getLegName(i + 1)}`;
        }
        res += `
| local = [[${match.homeCompleteName}|${match.homeName}]]
| paíslocal = ${this.searchData().flags ? match.homeFlag : ''}
| paísvisita = ${this.searchData().flags ? match.awayFlag : ''}
| resultado = ${match.homeGoals}:${match.awayGoals}`;
        if (i > 0 && i === playoff.matches.length - 1) {
          const globalResult = this.getGlobalResult(playoff.matches);
          if (match.homeName === playoff.matches[0].homeName) {
            res += `
| global = ${globalResult.homeGoals}:${globalResult.awayGoals}`;
          } else {
            res += `
| global = ${globalResult.awayGoals}:${globalResult.homeGoals}`;
          }
        }
        res += `
| visita = [[${match.awayCompleteName}|${match.awayName}]]
| fecha = ${this.getNormalizeDate(match.date)} `;
        if (match.extraTime) {
          res += `
| prórroga = sí`;
        }
        if (match.homePenalties !== undefined) {
          res += `
| resultado penalti = ${match.homePenalties}-${match.awayPenalties}
| penaltis1 =
| penaltis2 =`;
        }
        res += `
| estadio =
| ciudad =
| asistencia =
| refe =
| reporte =
| estado = plegada
}}
        `;
      }
    }

    return res;
  }

  private getMaxNumberLegs(playoffs: Playoff[]): number {
    let max = 0;
    for (const playoff of playoffs) {
      if (playoff.matches.length > max) {
        max = playoff.matches.length;
      }
    }
    return max;
  }

  private getGlobalResult(matches: PlayoffMatch[]): MatchResult {
    const homeName = matches[0].homeName;
    let homeGoals = 0;
    let awayGoals = 0;

    for (const match of matches) {
      const result = this.getNormalizeResult(match, homeName);
      homeGoals += result.homeGoals;
      awayGoals += result.awayGoals;
    }

    return {
      homeGoals,
      awayGoals,
    };
  }

  private getGlobalResultTxt(playoff: Playoff): string {
    const globalResult = this.getGlobalResult(playoff.matches);
    let result = `${globalResult.homeGoals}-${globalResult.awayGoals}`;
    const pen = `{{small|''([[Tiros desde el punto penal|pen.]])''}}`;

    if (last(playoff.matches)?.homePenalties !== undefined) {
      result = playoff.winner === 1 ? `${pen} ${result}` : `${result} ${pen}`;
    }

    return result;
  }

  private getNormalizeResult(match: PlayoffMatch, homeName: string): MatchResult {
    if (match.homeName === homeName) {
      return {
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
      };
    } else {
      return {
        homeGoals: match.awayGoals,
        awayGoals: match.homeGoals,
      };
    }
  }

  private getLegName(leg: number) {
    switch (leg) {
      case 1:
        return 'Ida';
      case 2:
        return 'Vuelta';
      case 3:
        return 'Desempate';
      default:
        return '';
    }
  }

  private getNormalizeDate(date: string) {
    try {
      const shortDate = split(date, ', ')[1];
      const d = DateTime.fromFormat(shortDate, 'dd-MM-yyyy').setLocale('es-ES');
      return d.toFormat("{{'fecha'|dd|MM|yyyy}}");
    } catch (e) {
      console.error(`Error parsing date: ${date}`, e);
      return date;
    }
  }
}
