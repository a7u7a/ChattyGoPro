import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineContainerComponent } from './line-container.component';

describe('LineContainerComponent', () => {
  let component: LineContainerComponent;
  let fixture: ComponentFixture<LineContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
