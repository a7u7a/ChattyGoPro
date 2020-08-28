import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Zoom2ParentComponent } from './zoom2-parent.component';

describe('Zoom2ParentComponent', () => {
  let component: Zoom2ParentComponent;
  let fixture: ComponentFixture<Zoom2ParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Zoom2ParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Zoom2ParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
