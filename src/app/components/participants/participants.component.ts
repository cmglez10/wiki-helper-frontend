import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { groupBy, map, orderBy, reduce, sortBy, values } from 'lodash-es';
import { finalize, startWith } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { FreApiService } from '../../services/fre-api/fre-api.service';
import { Team } from '../../services/http/interfaces/team.interface';
import { MultiSearchComponent, SearchSettings } from '../multi-search/multi-search.component';

interface RegionsGrouped {
  count: number;
  regions: RegionParticipants[];
}

interface RegionParticipants {
  region: string;
  teams: Team[];
}

interface TableRowRequest {
  team: Team;
  showCountTeamsCell: boolean;
  countTeams: number;
  totalTeamsByCount: number;
  showRegionCell: boolean;
  region: string;
  totalTeamsByRegion: number;
}

@Component({
  selector: 'cgi-participants',
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss',
  imports: [
    CdkTextareaAutosize,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MultiSearchComponent,
    ReactiveFormsModule,
    MatTabsModule,
  ],
})
export class ParticipantsComponent {
  public readonly searchOptions = signal<SearchSettings>({
    groups: [],
    section: Section.Masculino,
    type: 'fre',
  });

  public readonly loading = signal(false);
  public readonly participants: WritableSignal<Array<Team> | null> = signal(null);
  public readonly participantsGrouped: Signal<RegionsGrouped[] | null> = signal(null);
  public readonly wikiCodeNotGrouped: Signal<string>;
  public readonly wikiCodeGrouped: Signal<string>;
  public readonly wikiLocation: Signal<string>;
  public readonly wikiCode: Signal<string>;
  public readonly groupByRegion: FormControl<boolean | null>;
  public readonly results: Signal<boolean>;

  private readonly _httpService: FreApiService = inject(FreApiService);

  constructor() {
    this.groupByRegion = new FormControl(false);

    this.participantsGrouped = computed(() => {
      if (!this.participants() || this.participants()!.length === 0) {
        return null;
      }
      return this._groupByCount(this._groupByRegion(this.participants()!));
    });

    this.wikiCodeGrouped = computed(() => {
      if (!this.participants()) {
        return '';
      }
      if (this.participants()!.length === 0) {
        return 'No participants found.';
      }

      let code = this._getCodeHeadersForGroupedTeams();

      for (const countGroup of this.participantsGrouped()!) {
        code += this._getCodeForGroupedCount(countGroup);
      }

      code += '|}';
      return code;
    });

    this.wikiCodeNotGrouped = computed(() => {
      if (!this.participants()) {
        return '';
      }
      if (this.participants()!.length === 0) {
        return 'No participants found.';
      }
      return this._getCodeForNotGroupedTeams();
    });

    const groupByRegionValue = toSignal(this.groupByRegion.valueChanges.pipe(startWith(this.groupByRegion.value)));

    this.wikiCode = computed(() => {
      if (groupByRegionValue()) {
        return this.wikiCodeGrouped();
      } else {
        return this.wikiCodeNotGrouped();
      }
    });

    this.wikiLocation = computed(() => {
      if (!this.participants() || this.participants()!.length === 0) {
        return '';
      }

      let code = `{{Mapa de localización+ |La Rioja|width=600 |float=right |caption=Localización de los equipos. |border=lightgrey |places=\n`;
      for (const team of this.participants()!) {
        if (team.coordinates) {
          code += `{{Geolocalización|La Rioja|${team.coordinates[0]}|${team.coordinates[1]}|${team.completeName}{{!}}<small>${team.name}</small>|15|e}}\n`;
        }
      }
      code += `}}\n`;
      return code;
    });

    this.results = computed(() => {
      return !!this.participants() && this.participants()!.length > 0;
    });
  }

  public getParticipants(): void {
    if (this.searchOptions().type === 'fre') {
      const groupIds: Array<number> = map(this.searchOptions().groups, 'id') as Array<number>;
      this.loading.set(true);
      this.participants.set(null);
      this._httpService
        .getParticipants(groupIds, this.searchOptions().section)
        .pipe(
          finalize(() => {
            this.loading.set(false);
          })
        )
        .subscribe((fetchedParticipants) => {
          this.participants.set(sortBy(fetchedParticipants, 'name'));
        });
    }
  }

  private _getCodeForNotGroupedTeams(): string {
    let code = `{| class="sortable collapsible collapsed" border=1 cellpadding="2" cellspacing="0" style="background: #f9f9f9; border: 1px #aaa solid; border-collapse: collapse; font-size: 85%;"
|- style="background:#DDDDDD; color:black"
!width=400| Equipo
!width=300| Localidad
!width=80| Fundación
!width=180| Estadio
`;
    for (const team of this.participants()!) {
      code += `|-
|'''[[${team.completeName}|${team.name}]]'''
|{{bandera|${team.region}|tamaño=15px}} [[${team.town}]]
|${team.foundationYear}
|${team.ground}
`;
    }
    code += `|}`;

    return code;
  }

  private _getCodeHeadersForGroupedTeams(): string {
    return `
{| class="wikitable"
! N.º
! Com. autónoma
! Equipos
`;
  }

  private _getCodeForGroupedCount(regionsCount: RegionsGrouped): string {
    const totalTeamsByCount = reduce(
      regionsCount.regions,
      (sum, regionParticipants) => sum + regionParticipants.teams.length,
      0
    );

    let code = ``;
    for (const [index, regionParticipants] of regionsCount.regions.entries()) {
      code += this._getCodeForRegion(regionParticipants, index === 0, totalTeamsByCount, regionsCount.count);
    }
    return code;
  }

  private _getCodeForRegion(
    regionParticipants: RegionParticipants,
    firstRegion: boolean,
    totalTeamsByCount: number,
    countTeams: number
  ): string {
    let code = ``;
    for (const [index, team] of regionParticipants.teams.entries()) {
      const firstTeam = index === 0;
      code += this._getCodeForGroupedTeam({
        team,
        showCountTeamsCell: firstRegion && firstTeam,
        countTeams,
        totalTeamsByCount,
        showRegionCell: firstTeam,
        region: regionParticipants.region,
        totalTeamsByRegion: regionParticipants.teams.length,
      });
    }
    return code;
  }

  private _getCodeForGroupedTeam(options: TableRowRequest): string {
    let code = `|-\n`;
    if (options.showCountTeamsCell) {
      code += `|${options.totalTeamsByCount > 1 ? 'rowspan=' + options.totalTeamsByCount + '|' : ''} ${options.countTeams}\n`;
    }
    if (options.showRegionCell) {
      code += `|${options.totalTeamsByRegion > 1 ? 'rowspan=' + options.totalTeamsByRegion + '|' : ''} {{bandera2|${options.region}|tamaño=25px}}\n`;
    }
    code += `|[[${options.team.completeName}|${options.team.name}]]\n`;
    return code;
  }

  private _groupByRegion(participants: Team[]): RegionParticipants[] {
    return orderBy(
      map(values(groupBy(participants, 'region')), (regionParticipants) => {
        return {
          region: regionParticipants[0].region,
          teams: sortBy(regionParticipants, 'name'),
        };
      }),
      ['teams.length', 'region'],
      ['desc', 'asc']
    );
  }

  private _groupByCount(regions: RegionParticipants[]): RegionsGrouped[] {
    return orderBy(
      map(values(groupBy(regions, (region) => region.teams.length)), (regionParticipants) => {
        return {
          count: regionParticipants[0].teams.length,
          regions: sortBy(regionParticipants, 'region'),
        };
      }),
      ['count'],
      ['desc']
    );
  }
}
