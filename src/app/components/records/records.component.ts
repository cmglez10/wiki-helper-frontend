import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { filter, find, map } from 'lodash-es';
import { finalize } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { Records } from '../../services/http/interfaces/results.interface';
import { RecordsDisplayComponent } from '../records-display/records-display.component';
import { ISearchData } from '../search/interfaces/search-response.interface';
import { SearchComponent } from '../search/search.component';

export interface Group {
  id: number;
  name: string;
}

interface SearchSettings {
  groups: Group[];
  section: Section;
}

@Component({
  selector: 'cgi-records',
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    RecordsDisplayComponent,
    SearchComponent,
  ],
})
export class RecordsComponent {
  public readonly searchOptions = signal<SearchSettings>({
    groups: [],
    section: Section.Masculino,
  });

  public displayedColumns = ['groupId', 'name', 'actions'];
  public readonly loading = signal(false);
  public readonly results: WritableSignal<Records | null> = signal(null);

  private readonly _httpService: HttpService = inject(HttpService);

  public addGroup(event: ISearchData): void {
    if (this.searchOptions().groups.length === 0) {
      this.searchOptions.update((groups) => ({ ...groups, section: event.section }));
    }
    if (!find(this.searchOptions().groups, { id: event.groupId })) {
      this.searchOptions.update((searchOptions) => ({
        ...searchOptions,
        groups: [
          ...searchOptions.groups,
          {
            id: event.groupId,
            name: '',
          },
        ],
      }));
      this.results.set(null);
    }
  }

  public removeGroup(groupId: number): void {
    this.searchOptions.update((searchOptions) => {
      return { ...searchOptions, groups: filter(searchOptions.groups, (group) => group.id !== groupId) };
    });
    this.results.set(null);
  }

  public getRecords(): void {
    const groupIds = map(this.searchOptions().groups, 'id');
    this.loading.set(true);
    this.results.set(null);
    this._httpService
      .getRecords(groupIds, this.searchOptions().section)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((results) => {
        this.results.set(results);
      });
  }

  public updateGroupName(groupId: number, event: Event): void {
    this.searchOptions.update((searchOptions) => {
      const group = find(searchOptions.groups, { id: groupId });
      if (group) {
        group.name = (event.target as HTMLInputElement)?.value as string;
      }
      return { ...searchOptions };
    });
  }
}
