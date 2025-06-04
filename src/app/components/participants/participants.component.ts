import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map } from 'lodash-es';
import { finalize } from 'rxjs';
import { Section } from '../../constants/section.enum';
import { HttpService } from '../../services/http/http.service';
import { MultiSearchComponent, SearchSettings } from '../multi-search/multi-search.component';

@Component({
  selector: 'cgi-participants',
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss',
  imports: [MatButtonModule, MatProgressSpinnerModule, MultiSearchComponent],
})
export class ParticipantsComponent {
  public readonly searchOptions = signal<SearchSettings>({
    groups: [],
    section: Section.Masculino,
  });

  public readonly loading = signal(false);
  public readonly results: WritableSignal<any | null> = signal(null);

  private readonly _httpService: HttpService = inject(HttpService);

  public getParticipants(): void {
    const groupIds = map(this.searchOptions().groups, 'id');
    this.loading.set(true);
    this.results.set(null);
    this._httpService
      .getParticipants(groupIds, this.searchOptions().section)
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
