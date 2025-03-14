import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SignupComponent } from './components/signup/signup.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContentsComponent } from './components/contents/contents.component';

import { authGuardFactory } from './auth.guard';
import { adminGuardFactory } from './admin.guard';
import { AdminComponent } from './components/admin/admin.component';
import { FifthGradeComponent } from './components/fifth-grade/fifth-grade.component';
import { SixthGradeComponent } from './components/sixth-grade/sixth-grade.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ToolsComponent } from './components/tools/tools.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    SignupComponent,
    NavbarComponent,
    ContentsComponent,
    AdminComponent,
    FifthGradeComponent,
    SixthGradeComponent,
    DashboardComponent,
    ToolsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: 'authGuard',
      useFactory: authGuardFactory,
      deps: [Injector]
    },
    {
      provide: 'adminGuard',
      useFactory: adminGuardFactory,
      deps: [Injector]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
