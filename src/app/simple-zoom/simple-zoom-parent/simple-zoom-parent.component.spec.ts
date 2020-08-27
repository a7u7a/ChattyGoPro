import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleZoomParentComponent } from './simple-zoom-parent.component';

describe('SimpleZoomParentComponent', () => {
  let component: SimpleZoomParentComponent;
  let fixture: ComponentFixture<SimpleZoomParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleZoomParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleZoomParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
