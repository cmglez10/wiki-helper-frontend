import { Component, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { filter, find } from 'lodash-es';
import { Section } from '../../constants/section.enum';
import { ISearchData } from '../search/interfaces/search-response.interface';
import { SearchComponent } from '../search/search.component';
import { isSearchDataFrf } from '../search/search.utils';

export interface SearchSettings {
  groups: Group[];
  section: Section;
}

export interface Group {
  id: number;
  name: string;
}

@Component({
  selector: 'cgi-multi-search',
  templateUrl: './multi-search.component.html',
  styleUrl: './multi-search.component.scss',
  imports: [SearchComponent, MatTableModule, MatFormFieldModule, MatIconModule, MatInputModule],
})
export class MultiSearchComponent {
  public readonly searchOptions = model<SearchSettings>({
    groups: [],
    section: Section.Masculino,
  });

  public displayedColumns = ['groupId', 'name', 'actions'];

  public addGroup(event: ISearchData): void {
    if (isSearchDataFrf(event)) {
      return;
    } else {
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
      }
    }
  }

  public removeGroup(groupId: number): void {
    this.searchOptions.update((searchOptions) => {
      return { ...searchOptions, groups: filter(searchOptions.groups, (group) => group.id !== groupId) };
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
