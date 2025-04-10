import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Section } from '../../constants/section.enum';
import { ISearchData } from './interfaces/search-response.interface';

interface IFormSearch {
  groupId: FormControl<number | null>;
  section: FormControl<Section | null>;
  flags: FormControl<boolean | null>;
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
      groupId: new FormControl<number | null>(null, [Validators.required]),
      section: new FormControl<Section>(Section.Masculino, [Validators.required]),
      flags: new FormControl<boolean>(false),
    });
  }

  public search(): void {
    this.cgiSearch.emit({
      groupId: this.form.value.groupId!,
      section: this.form.value.section!,
      flags: this.form.value.flags!,
    });
  }
}
