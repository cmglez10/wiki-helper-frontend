import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Section } from '../../constants/section.enum';

interface IFormSearch {
  group: FormControl<number | null>;
  section: FormControl<Section | null>;
  flags: FormControl<boolean | null>;
}

export interface ISearchData {
  group: number | null;
  section: Section | null;
  flags: boolean | null;
}

@Component({
  selector: 'cgi-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class SearchComponent {
  public cgiSearch = output<ISearchData>();
  public form: FormGroup<IFormSearch>;

  protected Section = Section;

  constructor() {
    this.form = new FormGroup<IFormSearch>({
      group: new FormControl<number | null>(null, [Validators.required]),
      section: new FormControl<Section | null>(Section.Masculino),
      flags: new FormControl<boolean>(false),
    });
  }

  public search(): void {
    this.cgiSearch.emit(this.form.getRawValue());
  }
}
