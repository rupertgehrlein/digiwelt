import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SixthGradeComponent } from './sixth-grade.component';

describe('SixthGradeComponent', () => {
  let component: SixthGradeComponent;
  let fixture: ComponentFixture<SixthGradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SixthGradeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SixthGradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
