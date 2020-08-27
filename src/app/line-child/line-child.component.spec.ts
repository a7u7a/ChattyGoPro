import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChildComponent } from './line-child.component';

describe('LineChildComponent', () => {
  let component: LineChildComponent;
  let fixture: ComponentFixture<LineChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
