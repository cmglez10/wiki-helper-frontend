import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map } from 'lodash-es';
import { finalize } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { FreApiService } from '../../services/fre-api/fre-api.service';
import { Records } from '../../services/http/interfaces/results.interface';
import { MultiSearchComponent, SearchSettings } from '../multi-search/multi-search.component';
import { RecordsDisplayComponent } from '../records-display/records-display.component';

@Component({
  selector: 'cgi-records',
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss',
  imports: [MatButtonModule, MatProgressSpinnerModule, MultiSearchComponent, RecordsDisplayComponent],
})
export class RecordsComponent {
  public readonly searchOptions = signal<SearchSettings>({
    groups: [],
    section: Section.Masculino,
  });

  public readonly loading = signal(false);
  public readonly results: WritableSignal<Records | null> = signal(null);

  private readonly _httpService: FreApiService = inject(FreApiService);

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
}
