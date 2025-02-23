import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { isNumber } from 'lodash';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { ResultsData } from '../../services/http/interfaces/results.interface';
import { ISearchData, SearchComponent } from '../search/search.component';

@Component({
  selector: 'cgi-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  imports: [SearchComponent, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, CdkTextareaAutosize],
})
export class ResultsComponent {
  public readonly searchData: WritableSignal<ISearchData> = signal({
    group: null,
    section: Section.Masculino,
    flags: false,
  });
  public readonly loading = signal(false);
  public readonly wikiCode: Signal<string>;
  public readonly results: WritableSignal<ResultsData | null> = signal(null);

  private readonly _httpService: HttpService = inject(HttpService);

  constructor() {
    this.wikiCode = computed(() => {
      const code = `
  ${this._getCodeResults()}
`;
      return code;
    });
  }

  public getResults(event: ISearchData): void {
    let { group, section } = event;
    section = section || Section.Masculino;
    if (isNumber(group) && group > 0) {
      this.loading.set(true);
      this._httpService.getResults(10, group, 2024, section).subscribe((results) => {
        this.searchData.set(event);
        this.results.set(results);
        this.loading.set(false);
      });
    }
  }

  private _getCodeResults() {
    return JSON.stringify(this.results());
  }
}
