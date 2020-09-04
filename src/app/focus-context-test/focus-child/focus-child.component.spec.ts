import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusChildComponent } from './focus-child.component';

describe('FocusChildComponent', () => {
  let component: FocusChildComponent;
  let fixture: ComponentFixture<FocusChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FocusChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FocusChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
