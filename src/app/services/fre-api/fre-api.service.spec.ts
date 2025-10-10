import { TestBed } from '@angular/core/testing';

import { FreApiService } from './fre-api.service';

describe('HttpService', () => {
  let service: FreApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
