import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { isNumber, toInteger, trimEnd } from 'lodash-es';
import { HttpService } from '../../services/http/http.service';
import { LeagueTeam } from '../../services/http/interfaces/league.interface';
import { Utils } from '../../utilities/utils';

@Component({
  selector: 'cgi-league',
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
})
export class LeagueComponent {
  public groupControl = new FormControl<string>('');
  public readonly league: WritableSignal<LeagueTeam[]> = signal([]);
  public readonly wikiCode: Signal<string>;
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
  public readonly _teamDefinition: Signal<string>;
  public readonly _teamTable: Signal<string>;
  public readonly _teamOrder: Signal<string>;

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
      const code = `
<!-- '''LEER ESTO ANTES DE ACTUALIZAR:''' Por favor, no olvides actualizar la fecha a través del parámetro ({{parámetro|actualizado}}). -->
{{#invoke:Football table|main|estilo=WDL
|actualizado=completo
|fuente=[https://www.futbol-regional.es/competicion.php?${this.groupControl.value} Fútbol Regional]

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

  public getLeague(): void {
    const group = toInteger(this.groupControl.value);
    if (isNumber(group) && group > 0) {
      this.league.set([]);
      this._httpService.getLeague(group).subscribe((league) => {
        this.league.set(league);
      });
    }
  }
}
