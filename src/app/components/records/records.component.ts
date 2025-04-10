import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { map } from 'lodash-es';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { Records } from '../../services/http/interfaces/results.interface';
import { ISearchData } from '../search/interfaces/search-response.interface';
import { SearchComponent } from '../search/search.component';

const sectionIcon: Record<Section, string> = {
  [Section.Femenino]: 'female',
  [Section.Masculino]: 'male',
  [Section.Juvenil]: 'child_care',
};

interface IGroup extends ISearchData {
  sectionIcon: string;
}

@Component({
  selector: 'cgi-records',
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss',
  imports: [MatButtonModule, MatIconModule, MatTableModule, SearchComponent],
})
export class RecordsComponent {
  public readonly groups = signal<IGroup[]>([]);
  public displayedColumns = ['groupId', 'section', 'actions'];
  public readonly loading = signal(false);
  public readonly results: WritableSignal<Records | null> = signal(null);

  private readonly _httpService: HttpService = inject(HttpService);

  public getResults(event: ISearchData): void {
    this.groups.update((groups) => [...groups, { ...event, sectionIcon: sectionIcon[event.section] }]);
  }

  public removeGroup(index: number): void {
    this.groups.update((groups) => {
      const newGroups = [...groups];
      newGroups.splice(index, 1);
      return newGroups;
    });
  }

  public getRecords(): void {
    const groupIds = map(this.groups(), (group) => group.groupId!);
    this.loading.set(true);
    this.results.set(null);
    this._httpService.getRecords(groupIds, this.groups()[0].section).subscribe((results) => {
      this.results.set(results);
      this.loading.set(false);
    });
  }
}
