import { TestBed } from '@angular/core/testing';

import { ChartControlsService } from './chart-controls.service';

describe('ChartControlsService', () => {
  let service: ChartControlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartControlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
