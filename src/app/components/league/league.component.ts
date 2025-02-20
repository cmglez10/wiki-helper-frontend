import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { isNumber, toInteger } from 'lodash-es';
import { HttpService } from '../../services/http/http.service';
import { LeagueTeam } from '../../services/http/interfaces/league.interface';

@Component({
  selector: 'cgi-league',
  templateUrl: './league.component.html',
  styleUrl: './league.component.scss',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
})
export class LeagueComponent {
  public groupControl = new FormControl<string>('');
  public league: WritableSignal<LeagueTeam[]> = signal([]);
  public displayedColumns = [
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

  private _httpService: HttpService = inject(HttpService);

  public getLeague(): void {
    const group = toInteger(this.groupControl.value);
    if (isNumber(group) && group > 0) {
      this.league.set([]);
      this._httpService.getLeague(group).subscribe((league) => {
        this.league.set(league);
      });
    }
  }
}
