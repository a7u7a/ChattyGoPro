import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Zoom2ChildComponent } from './zoom2-child.component';

describe('Zoom2ChildComponent', () => {
  let component: Zoom2ChildComponent;
  let fixture: ComponentFixture<Zoom2ChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Zoom2ChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Zoom2ChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
