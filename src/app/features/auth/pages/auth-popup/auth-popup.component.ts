import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthEmailContentComponent } from './components/auth-email-content.component';
import { AuthOtpContentComponent } from './components/auth-otp-content.component';
import { AuthPasswordContentComponent } from './components/auth-password-content.component';
import { AuthPopupLayoutComponent } from './components/auth-popup-layout.component';
import { AuthRegisterContentComponent } from './components/auth-register-content.component';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';

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
  registrationToken = '';
  isSubmitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    private readonly router: Router,
  ) { }

  openPopup(): void {
    this.isPopupOpen = true;
    this.currentStep = 'email';
    this.submittedEmail = '';
    this.remainingOtpSeconds = 56;
    this.registrationToken = '';
    this.isSubmitting = false;
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.currentStep = 'email';
    this.registrationToken = '';
    this.isSubmitting = false;
  }

  handleEmailContinue(email: string): void {
    if (this.isSubmitting) {
      return;
    }

    this.submittedEmail = email.trim().toLowerCase();
    this.isSubmitting = true;

    this.authService.requestOtp({ email: this.submittedEmail }).subscribe({
      next: response => {
        if (!response.success) {
          this.logger.error('Không thể gửi OTP. Vui lòng thử lại.');
          this.isSubmitting = false;
          return;
        }

        if (response.userId !== null) {
          this.logger.info('Email đã có tài khoản. Tạm thời chuyển sang màn hình đăng nhập.');
          this.closePopup();
          this.router.navigate(['/auth/login']);
          this.isSubmitting = false;
          return;
        }

        this.currentStep = 'otp';
        this.remainingOtpSeconds = 60;
        this.logger.success('Mã OTP đã được gửi tới email của bạn.');
        this.isSubmitting = false;
      },
      error: () => {
        this.logger.error('Gửi OTP thất bại. Vui lòng kiểm tra email và thử lại.');
        this.isSubmitting = false;
      },
    });
  }

  handleOtpVerify(otp: string): void {
    if (!otp || otp.length < 6 || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.authService.verifyOtp({ email: this.submittedEmail, otp }).subscribe({
      next: response => {
        const isOtpVerified = response.otpVerified === true || response.success === true;
        if (!isOtpVerified) {
          this.logger.error('OTP không hợp lệ hoặc đã hết hạn.');
          this.isSubmitting = false;
          return;
        }

        this.registrationToken = response.registrationToken ?? '';
        this.currentStep = 'register';
        this.isSubmitting = false;
      },
      error: () => {
        this.logger.error('Xác thực OTP thất bại. Vui lòng thử lại.');
        this.isSubmitting = false;
      },
    });
  }

  handleOtpBack(): void {
    this.currentStep = 'email';
    this.registrationToken = '';
  }

  handleOtpResend(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.authService.requestOtp({ email: this.submittedEmail }).subscribe({
      next: response => {
        if (response.success) {
          this.remainingOtpSeconds = 60;
          this.logger.success('Mã OTP mới đã được gửi tới email của bạn.');
        } else {
          this.logger.error('Không thể gửi lại OTP. Vui lòng thử lại.');
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.logger.error('Gửi lại OTP thất bại. Vui lòng thử lại.');
        this.isSubmitting = false;
      },
    });
  }

  handleRegisterBack(): void {
    this.currentStep = 'otp';
  }

  handleRegisterSubmit(password: string): void {
    if (!password || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.authService
      .register({
        email: this.submittedEmail,
        password,
        registrationToken: this.registrationToken,
      })
      .subscribe({
        next: response => {
          // if (!response.accessToken) {
          //   this.logger.error('Đăng ký không thành công. Vui lòng thử lại.');
          //   this.isSubmitting = false;
          //   return;
          // }

          this.logger.success('Đăng ký thành công!');
          this.closePopup();
          this.router.navigate(['/']);
          this.isSubmitting = false;
        },
        error: () => {
          this.logger.error('Đăng ký thất bại. Vui lòng thử lại.');
          this.isSubmitting = false;
        },
      });
  }

  handlePasswordBack(): void {
    this.currentStep = 'register';
  }

  handlePasswordSubmit(): void {
    this.closePopup();
  }
}
