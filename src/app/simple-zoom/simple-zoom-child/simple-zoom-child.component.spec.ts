import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleZoomChildComponent } from './simple-zoom-child.component';

describe('SimpleZoomChildComponent', () => {
  let component: SimpleZoomChildComponent;
  let fixture: ComponentFixture<SimpleZoomChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleZoomChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleZoomChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
