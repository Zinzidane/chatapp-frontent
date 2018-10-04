import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthTabsComponent } from '../components/auth-tabs/auth-tabs.component';
import { LoginComponent } from '../components/login/login.component';
import { SignupComponent } from '../components/signup/signup.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [AuthTabsComponent, LoginComponent, SignupComponent],
  exports: [
    AuthTabsComponent,
    LoginComponent,
    SignupComponent
  ]
})
export class AuthModule { }
