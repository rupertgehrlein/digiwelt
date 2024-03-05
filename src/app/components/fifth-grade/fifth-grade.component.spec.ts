import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FifthGradeComponent } from './fifth-grade.component';

describe('FifthGradeComponent', () => {
  let component: FifthGradeComponent;
  let fixture: ComponentFixture<FifthGradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FifthGradeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FifthGradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
