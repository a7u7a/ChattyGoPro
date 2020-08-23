import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3TimeSeriesComponent } from './d3-time-series.component';

describe('D3TimeSeriesComponent', () => {
  let component: D3TimeSeriesComponent;
  let fixture: ComponentFixture<D3TimeSeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3TimeSeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3TimeSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
