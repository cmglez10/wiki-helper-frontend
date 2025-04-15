import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { isNumber, trimEnd } from 'lodash-es';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { LeagueTeam } from '../../services/http/interfaces/league.interface';
import { Utils } from '../../utilities/utils';
import { ISearchData } from '../search/interfaces/search-response.interface';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'cgi-league',
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss',
  imports: [
    CdkTextareaAutosize,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    ReactiveFormsModule,
    SearchComponent,
    SearchComponent,
  ],
})
export class LeagueComponent {
  public readonly searchData: WritableSignal<ISearchData> = signal({
    groupId: 0,
    section: Section.Masculino,
    flags: false,
  });
  public readonly league: WritableSignal<LeagueTeam[]> = signal([]);
  public readonly wikiCode: Signal<string>;
  public readonly loading = signal(false);
  public readonly displayedColumns = [
    'position',
    'shield',
    'name',
    'played',
    'won',
    'drawn',
    'lost',
    'gf',
    'ga',
    'gd',
    'sanction',
    'points',
  ];

  private readonly _httpService: HttpService = inject(HttpService);
  private readonly _teamDefinition: Signal<string>;
  private readonly _teamTable: Signal<string>;
  private readonly _teamOrder: Signal<string>;

  constructor() {
    this._teamDefinition = computed(() => {
      let res = '';
      for (const team of this.league()) {
        res += `
|nombre_${Utils.getInitials(team.name)}=[[${team.completeName}|${team.name}]]`;
      }
      return res;
    });

    this._teamTable = computed(() => {
      let res = '';
      for (const team of this.league()) {
        res += `
|ganados_${Utils.getInitials(team.name)}=${team.won}  |empates_${Utils.getInitials(team.name)}=${
          team.drawn
        }  |perdidos_${Utils.getInitials(team.name)}=${
          team.lost
        } |gf_${Utils.getInitials(team.name)}=${team.gf} |gc_${Utils.getInitials(team.name)}=${team.ga}`;
        if (team.sanction !== 0) {
          res += ` |ajustar_puntos_${Utils.getInitials(team.name)}=${team.sanction}`;
        }
        res += ` <!-- ${team.name} -->`;
      }
      return res;
    });

    this._teamOrder = computed(() => {
      let res = '|orden_equipo= ';
      for (const team of this.league()) {
        res += `${Utils.getInitials(team.name)}, `;
      }
      return trimEnd(res, ', ');
    });

    this.wikiCode = computed(() => {
      if (!this.league().length) {
        return '';
      }

      const urlFem = this.searchData().section === Section.Femenino ? 'sec=f&' : '';

      const code = `
<!-- '''LEER ESTO ANTES DE ACTUALIZAR:''' Por favor, no olvides actualizar la fecha a través del parámetro ({{parámetro|actualizado}}). -->
{{#invoke:Football table|main|estilo=WDL
|actualizado=completo
|fuente=[https://www.futbol-regional.es/competicion.php?${urlFem}${this.searchData().groupId} Fútbol Regional]

<!--Definiciones de los equipos (wikilinks en tabla)-->
${this._teamDefinition()}

<!--Actualizar los resultados de los equipos aquí, (no hace falta modificar las posiciones en está sección, el modelo lo hace automaticamente). No olvides actualizar la fecha a través del parámetro actualizado-->
${this._teamTable()}

<!--Actualizar las posiciones de los equipos aquí-->
${this._teamOrder()}
`;
      return code;
    });
  }

  public getLeague(event: ISearchData): void {
    let { groupId: group, section } = event;
    section = section || Section.Masculino;
    if (isNumber(group) && group > 0) {
      this.league.set([]);
      this.loading.set(true);
      this._httpService.getLeague(group, section).subscribe((league) => {
        this.searchData.set(event);
        this.league.set(league);
        this.loading.set(false);
      });
    }
  }
}
