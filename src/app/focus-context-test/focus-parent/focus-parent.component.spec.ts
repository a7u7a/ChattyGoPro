import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusParentComponent } from './focus-parent.component';

describe('FocusParentComponent', () => {
  let component: FocusParentComponent;
  let fixture: ComponentFixture<FocusParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FocusParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FocusParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
