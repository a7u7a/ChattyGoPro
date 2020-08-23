import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSeriesWindowComponent } from './time-series-window.component';

describe('TimeSeriesWindowComponent', () => {
  let component: TimeSeriesWindowComponent;
  let fixture: ComponentFixture<TimeSeriesWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSeriesWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSeriesWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
