import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsDisplayComponent } from './records-display.component';

describe('RecordsDisplayComponent', () => {
  let component: RecordsDisplayComponent;
  let fixture: ComponentFixture<RecordsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordsDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
