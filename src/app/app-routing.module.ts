import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SignupComponent } from './components/signup/signup.component';
import { ContentsComponent } from './components/contents/contents.component';
import { AdminComponent } from './components/admin/admin.component';
import { FifthGradeComponent } from './components/fifth-grade/fifth-grade.component';
import { SixthGradeComponent } from './components/sixth-grade/sixth-grade.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: SignupComponent },
  {
    path: 'contents',
    component: ContentsComponent,
    canActivate: ['authGuard'],
    children: [
      { path: 'fifth-grade', component: FifthGradeComponent },
      { path: 'sixth-grade', component: SixthGradeComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: ['adminGuard'],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
