import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Section } from '../../constants/section.enum';
import { ISearchData, SearchOrigin } from './interfaces/search-response.interface';

const sectionIcon: Record<Section, string> = {
  [Section.Femenino]: 'female',
  [Section.Masculino]: 'male',
  [Section.Juvenil]: 'child_care',
};

interface IFormSearchFre {
  groupId: FormControl<number | null>;
  section: FormControl<Section | null>;
  flags: FormControl<boolean | null>;
}

interface IFormSearchFrf {
  url: FormControl<string | null>;
}

@Component({
  selector: 'cgi-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    ReactiveFormsModule,
  ],
})
export class SearchComponent {
  public readonly cgiSearchDisableSectionSelector = input<boolean>(false);
  public readonly cgiSearch = output<ISearchData>();
  public formFrf: FormGroup<IFormSearchFrf>;
  public formFre: FormGroup<IFormSearchFre>;
  public tabIndex = SearchOrigin.FRF;

  protected Section = Section;
  protected sectionIcon = sectionIcon;

  constructor() {
    this.formFrf = new FormGroup<IFormSearchFrf>({
      url: new FormControl<string>('', [Validators.required]),
    });

    this.formFre = new FormGroup<IFormSearchFre>({
      groupId: new FormControl<number | null>(null, [Validators.required]),
      section: new FormControl<Section>(Section.Masculino, [Validators.required]),
      flags: new FormControl<boolean>(false),
    });

    effect(() => {
      if (this.cgiSearchDisableSectionSelector()) {
        this.formFre.get('section')?.disable();
      } else {
        this.formFre.get('section')?.enable();
      }
    });
  }

  public searchFrf(): void {
    this.cgiSearch.emit({
      origin: SearchOrigin.FRF,
      url: this.formFrf.value.url!,
    });
  }

  public searchFre(): void {
    this.cgiSearch.emit({
      origin: SearchOrigin.FRE,
      groupId: this.formFre.value.groupId!,
      section: this.formFre.value.section!,
      flags: this.formFre.value.flags!,
    });
  }
}
