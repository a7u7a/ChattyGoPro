import { TestBed } from '@angular/core/testing';

import { ChartConfigService } from './chart-config.service';

describe('ChartConfigService', () => {
  let service: ChartConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
