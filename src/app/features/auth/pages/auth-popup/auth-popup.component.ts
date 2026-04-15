import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthEmailContentComponent } from './components/auth-email-content.component';
import { AuthOtpContentComponent } from './components/auth-otp-content.component';
import { AuthPasswordContentComponent } from './components/auth-password-content.component';
import { AuthPopupLayoutComponent } from './components/auth-popup-layout.component';
import { AuthRegisterContentComponent } from './components/auth-register-content.component';

type AuthPopupStep = 'email' | 'otp' | 'register' | 'password';

@Component({
  selector: 'app-auth-popup',
  standalone: true,
  imports: [
    CommonModule,
    AuthPopupLayoutComponent,
    AuthEmailContentComponent,
    AuthOtpContentComponent,
    AuthRegisterContentComponent,
    AuthPasswordContentComponent,
  ],
  templateUrl: './auth-popup.component.html',
  styleUrl: './auth-popup.component.scss',
})
export class AuthPopupComponent {
  isPopupOpen = false;
  currentStep: AuthPopupStep = 'email';
  submittedEmail = '';
  remainingOtpSeconds = 56;

  private readonly existingAccounts = new Set<string>(['admin@assetauction.vn', 'demo@assetauction.vn']);

  openPopup(): void {
    this.isPopupOpen = true;
    this.currentStep = 'email';
    this.submittedEmail = '';
    this.remainingOtpSeconds = 56;
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.currentStep = 'email';
  }

  handleEmailContinue(email: string): void {
    this.submittedEmail = email.trim().toLowerCase();
    this.currentStep = 'otp';
    this.remainingOtpSeconds = 56;
  }

  handleOtpVerify(otp: string): void {
    if (!otp || otp.length < 6) {
      return;
    }

    const isAccountExisted = this.existingAccounts.has(this.submittedEmail);
    if (isAccountExisted) {
      this.closePopup();
      return;
    }

    this.currentStep = 'register';
  }

  handleOtpBack(): void {
    this.currentStep = 'email';
  }

  handleRegisterBack(): void {
    this.currentStep = 'otp';
  }

  handleRegisterSubmit(): void {
    this.currentStep = 'password';
  }

  handlePasswordBack(): void {
    this.currentStep = 'register';
  }

  handlePasswordSubmit(): void {
    this.closePopup();
  }
}
