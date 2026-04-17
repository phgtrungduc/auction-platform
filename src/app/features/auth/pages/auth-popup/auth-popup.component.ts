import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthEmailContentComponent } from './components/auth-email-content.component';
import { AuthOtpContentComponent } from './components/auth-otp-content.component';
import { AuthPasswordContentComponent } from './components/auth-password-content.component';
import { AuthPopupLayoutComponent } from './components/auth-popup-layout.component';
import { AuthRegisterContentComponent } from './components/auth-register-content.component';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';

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
    LoadingOverlayComponent,
  ],
  templateUrl: './auth-popup.component.html',
  styleUrl: './auth-popup.component.scss',
})
export class AuthPopupComponent {
  isPopupOpen = false;
  currentStep: AuthPopupStep = 'email';
  submittedEmail = '';
  remainingOtpSeconds = 600;
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
    this.remainingOtpSeconds = 600;
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
      next: response => this.handleRequestOtpResponse(response, true),
      error: error => this.handleRequestOtpError(error),
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
      next: response => this.handleRequestOtpResponse(response, false),
      error: error => this.handleRequestOtpError(error),
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
          //this.router.navigate(['/']);
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

  handlePasswordSubmit(password: string): void {
    if (!password || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.authService
      .login({
        email: this.submittedEmail,
        password,
      })
      .subscribe({
        next: response => {
          if (!response.accessToken) {
            this.logger.error('Đăng nhập không thành công. Vui lòng thử lại.');
            this.isSubmitting = false;
            return;
          }

          this.logger.success('Đăng nhập thành công!');
          this.closePopup();
          //this.router.navigate(['/']);
          this.isSubmitting = false;
        },
        error: (error: unknown) => {
          const httpError = error as HttpErrorResponse | null;
          const errorBody = (httpError?.error ?? {}) as { message?: string };
          const apiMessage = errorBody.message?.trim() ?? '';
          if (apiMessage === 'Email hoặc mật khẩu không đúng.') {
            this.logger.error('Mật khẩu không chính xác');
          } else {
            this.logger.error('Đăng nhập thất bại. Vui lòng thử lại.');
          }
          this.isSubmitting = false;
        },
      });
  }

  private handleRequestOtpResponse(
    response: { success?: boolean; userId?: number | null; message?: string | null },
    isInitialRequest: boolean,
  ): void {
    const normalizedMessage = response.message?.trim().toLowerCase() ?? '';
    const hasRecentOtpMessage =
      normalizedMessage.includes('đã yêu cầu otp gần đây') ||
      normalizedMessage.includes('vui lòng đợi trước khi gửi lại');

    if (response.userId != null) {
      //this.logger.info('Email đã có tài khoản. Tạm thời chuyển sang màn hình đăng nhập.');
      //this.closePopup();
      //this.router.navigate(['/auth/login']);
      this.currentStep = 'password';
      this.isSubmitting = false;
      return;
    }

    if (response.success || hasRecentOtpMessage) {
      this.currentStep = 'otp';
      this.remainingOtpSeconds = 600;

      if (hasRecentOtpMessage) {
        this.logger.info(response.message || 'Bạn đã yêu cầu OTP gần đây. Vui lòng tiếp tục nhập mã OTP.');
      } else if (isInitialRequest) {
        this.logger.success('Mã OTP đã được gửi tới email của bạn.');
      } else {
        this.logger.success('Mã OTP mới đã được gửi tới email của bạn.');
      }

      this.isSubmitting = false;
      return;
    }

    this.logger.error(response.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    this.isSubmitting = false;
  }

  private handleRequestOtpError(error: unknown): void {
    const httpError = error as HttpErrorResponse | null;
    const errorBody = (httpError?.error ?? {}) as { message?: string };
    const message = errorBody.message?.trim() ?? '';
    const normalizedMessage = message.toLowerCase();
    const isRecentOtpMessage =
      normalizedMessage.includes('đã yêu cầu otp gần đây') ||
      normalizedMessage.includes('vui lòng đợi trước khi gửi lại');

    if (httpError?.status === 400 && isRecentOtpMessage) {
      this.currentStep = 'otp';
      this.remainingOtpSeconds = 600;
      this.logger.info(message || 'Bạn đã yêu cầu OTP gần đây. Vui lòng tiếp tục nhập mã OTP.');
      this.isSubmitting = false;
      return;
    }

    this.logger.error('Gửi OTP thất bại. Vui lòng kiểm tra email và thử lại.');
    this.isSubmitting = false;
  }
}
