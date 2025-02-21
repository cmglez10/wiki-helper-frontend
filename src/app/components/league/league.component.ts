import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { isNumber, toInteger, trimEnd } from 'lodash-es';
import { HttpService } from '../../services/http/http.service';
import { LeagueTeam } from '../../services/http/interfaces/league.interface';
import { Utils } from '../../utilities/utils';

enum Section {
  Masculino = 'm',
  Femenino = 'f',
  Juvenil = 'j',
}

interface FormGroupLeague {
  group: FormControl<string | null>;
  section: FormControl<Section | null>;
}

@Component({
  selector: 'cgi-league',
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
})
export class LeagueComponent {
  public form: FormGroup<FormGroupLeague>;
  public readonly league: WritableSignal<LeagueTeam[]> = signal([]);
  public readonly wikiCode: Signal<string>;
  public loading = signal(false);
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

  protected Section = Section;

  private readonly _httpService: HttpService = inject(HttpService);
  private readonly _teamDefinition: Signal<string>;
  private readonly _teamTable: Signal<string>;
  private readonly _teamOrder: Signal<string>;

  constructor() {
    this.form = new FormGroup<FormGroupLeague>({
      group: new FormControl<string>(''),
      section: new FormControl(Section.Masculino),
    });

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

      const code = `
<!-- '''LEER ESTO ANTES DE ACTUALIZAR:''' Por favor, no olvides actualizar la fecha a través del parámetro ({{parámetro|actualizado}}). -->
{{#invoke:Football table|main|estilo=WDL
|actualizado=completo
|fuente=[https://www.futbol-regional.es/competicion.php?${this.form.value.group} Fútbol Regional]

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
    let { group, section } = this.form.value;
    const groupInteger = toInteger(group);
    section = section || Section.Masculino;
    if (isNumber(groupInteger) && groupInteger > 0) {
      this.league.set([]);
      this.loading.set(true);
      this._httpService.getLeague(groupInteger, section).subscribe((league) => {
        this.league.set(league);
        this.loading.set(false);
      });
    }
  }
}
