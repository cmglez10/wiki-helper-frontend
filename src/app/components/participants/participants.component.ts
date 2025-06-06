import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { groupBy, map, orderBy, reduce, sortBy, values } from 'lodash-es';
import { finalize } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
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
    MultiSearchComponent,
  ],
})
export class ParticipantsComponent {
  public readonly searchOptions = signal<SearchSettings>({
    groups: [],
    section: Section.Masculino,
  });

  public readonly loading = signal(false);
  public readonly participants: WritableSignal<Array<Team> | null> = signal(null);
  public readonly participantsGrouped: Signal<RegionsGrouped[] | null> = signal(null);
  public readonly wikiCode: Signal<string>;

  private readonly _httpService: HttpService = inject(HttpService);

  constructor() {
    this.participantsGrouped = computed(() => {
      if (!this.participants() || this.participants()!.length === 0) {
        return null;
      }
      return this._groupByCount(this._groupByRegion(this.participants()!));
    });

    this.wikiCode = computed(() => {
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
  }

  public getParticipants(): void {
    const groupIds = map(this.searchOptions().groups, 'id');
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
