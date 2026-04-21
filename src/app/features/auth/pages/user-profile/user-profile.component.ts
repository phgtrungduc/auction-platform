import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserProfileResponse } from '../../models/auth.model';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingOverlayComponent],
})
export class UserProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);

  isLoading = false;
  isSaving = false;
  isChangingPassword = false;
  isUpdatingNotification = false;
  loadError = '';
  userProfile: UserProfileResponse | null = null;
  showOldPassword = false;
  showPassword = false;
  showConfirmPassword = false;
  oldPasswordTouched = false;
  passwordTouched = false;
  confirmTouched = false;
  strengthScore = 0;

  profileForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    isNotificated: [false],
    oldPassword: [''],
    password: [''],
    confirmPassword: [''],
  });

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.isLoading = true;
    this.loadError = '';

    this.authService.getCurrentUser().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue(
          {
            displayName: profile.displayName ?? '',
            isNotificated: profile.isNotificated ?? false,
          },
          { emitEvent: false },
        );
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Không thể tải thông tin người dùng. Vui lòng thử lại.';
        this.isLoading = false;
      },
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.controls.displayName.invalid) {
      this.profileForm.controls.displayName.markAsTouched();
      return;
    }

    const displayName = (this.profileForm.controls.displayName.value ?? '').trim();
    if (!displayName) {
      this.logger.error('Vui lòng nhập tên hiển thị.');
      return;
    }

    this.isSaving = true;
    this.authService.updateDisplayName({ displayName }).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          const newName = response.displayName || displayName;
          if (this.userProfile) {
            this.userProfile = { ...this.userProfile, displayName: newName };
          }
          this.profileForm.controls.displayName.setValue(newName);
          this.logger.success(response.message || 'Cập nhật tên hiển thị thành công.');
        } else {
          this.logger.error(response.message || 'Cập nhật tên hiển thị thất bại.');
        }
      },
      error: () => {
        this.isSaving = false;
        this.logger.error('Không thể cập nhật tên hiển thị. Vui lòng thử lại.');
      },
    });
  }

  onChangePassword(): void {
    this.oldPasswordTouched = true;
    this.passwordTouched = true;
    this.confirmTouched = true;
    this.profileForm.controls.oldPassword.markAsTouched();
    this.profileForm.controls.password.markAsTouched();
    this.profileForm.controls.confirmPassword.markAsTouched();

    if (!this.isValidPasswordForm()) {
      return;
    }

    const payload = {
      oldPassword: this.oldPasswordValue,
      newPassword: this.passwordValue,
    };

    this.isChangingPassword = true;
    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        if (response.success) {
          this.logger.success(response.message || 'Đổi mật khẩu thành công.');
          this.resetPasswordFields();
        } else {
          this.logger.error(response.message || 'Đổi mật khẩu thất bại.');
        }
      },
      error: (err) => {
        this.isChangingPassword = false;
        const message =
          err?.error?.message || err?.error?.detail || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
        this.logger.error(message);
      },
    });
  }

  onNotificationToggle(event: Event): void {
    const nextValue = (event.target as HTMLInputElement)?.checked ?? false;
    const previousValue = !nextValue;

    this.profileForm.controls.isNotificated.setValue(nextValue, { emitEvent: false });
    this.isUpdatingNotification = true;

    this.authService
      .updateNotificationStatus({ statusReceiveNotification: nextValue })
      .subscribe({
        next: (response) => {
          this.isUpdatingNotification = false;
          if (response.success) {
            if (this.userProfile) {
              this.userProfile = { ...this.userProfile, isNotificated: nextValue };
            }
            this.logger.success(
              response.message ||
                (nextValue ? 'Đã bật thông báo.' : 'Đã tắt thông báo.'),
            );
          } else {
            this.profileForm.controls.isNotificated.setValue(previousValue, { emitEvent: false });
            this.logger.error(response.message || 'Cập nhật trạng thái thông báo thất bại.');
          }
        },
        error: () => {
          this.isUpdatingNotification = false;
          this.profileForm.controls.isNotificated.setValue(previousValue, { emitEvent: false });
          this.logger.error('Không thể cập nhật trạng thái thông báo. Vui lòng thử lại.');
        },
      });
  }

  private resetPasswordFields(): void {
    this.profileForm.patchValue({
      oldPassword: '',
      password: '',
      confirmPassword: '',
    });
    this.oldPasswordTouched = false;
    this.passwordTouched = false;
    this.confirmTouched = false;
    this.strengthScore = 0;
  }

  logout(): void {
    this.authService.logout();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  onPasswordChange(): void {
    const password = this.passwordValue;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (this.hasUpperCase() && this.hasLowerCase() && this.hasNumber()) score++;
    if (this.hasSpecialChar() && password.length >= 10) score++;
    this.strengthScore = Math.min(score, 4);
  }

  readonly strengthLevels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  readonly strengthColors = ['', '#e53935', '#e9a950', '#2196f3', '#367639'];

  get strengthLabel(): string {
    return this.strengthLevels[this.strengthScore] ?? '';
  }

  get strengthColor(): string {
    return this.strengthColors[this.strengthScore] ?? '#bfd0e2';
  }

  get passwordValue(): string {
    return this.profileForm.controls.password.value ?? '';
  }

  get confirmPasswordValue(): string {
    return this.profileForm.controls.confirmPassword.value ?? '';
  }

  get oldPasswordValue(): string {
    return this.profileForm.controls.oldPassword.value ?? '';
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(this.passwordValue);
  }

  isPasswordValid(): boolean {
    return this.passwordValue.length >= 8 && this.hasUpperCase() && this.hasLowerCase() && this.hasNumber();
  }

  isConfirmMatch(): boolean {
    return this.passwordValue === this.confirmPasswordValue;
  }

  isValidPasswordForm(): boolean {
    return (
      this.oldPasswordValue.length > 0 &&
      this.isPasswordValid() &&
      this.isConfirmMatch() &&
      this.confirmPasswordValue.length > 0
    );
  }
}
