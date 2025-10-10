import { TestBed } from '@angular/core/testing';

import { FrfApiService } from './frf-api.service';

describe('FrfApiService', () => {
  let service: FrfApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrfApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
