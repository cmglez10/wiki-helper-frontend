import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Section } from '../../constants/section.enum';
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
}
