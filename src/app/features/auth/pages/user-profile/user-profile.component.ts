import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserProfileResponse } from '../../models/auth.model';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { LoggerService } from '../../../../core/services/logger.service';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { MultiSelectComponent } from '../../../../shared/components/multi-select/multi-select.component';
import { DvhcStore } from '../../../../store/dvhc/dvhc.store';
import { Dvhc } from '../../../../core/models/dvhc.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingOverlayComponent,
    CustomSelectComponent,
    DatePickerComponent,
    MultiSelectComponent,
  ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly dvhcStore = inject(DvhcStore);
  private readonly destroy$ = new Subject<void>();

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
  activeTab: 'profile' | 'notification' | 'credit' | 'password' = 'profile';
  readonly creditBalance = 0;
  readonly creditPackages = [
    { name: 'Starter', price: '69.000 đ', credits: 69, bonus: 0, featured: false, tone: 'default' },
    { name: 'Popular', price: '179.000 đ', credits: 179, bonus: 31, featured: true, tone: 'popular' },
    { name: 'Value', price: '299.000 đ', credits: 299, bonus: 31, featured: false, tone: 'default' },
    { name: 'Pro', price: '499.000 đ', credits: 499, bonus: 101, featured: false, tone: 'default' },
    { name: 'Max', price: '1.999.000 đ', credits: 1999, bonus: 601, featured: true, tone: 'premium' },
  ] as const;
  provinces: Dvhc[] = [];
  optionsLocation: SelectOption[] = [];
  selectedProvinceCode: string | null = null;
  selectedBirthDate: Date | null = null;
  selectedRole: string | null = null;
  selectedGender: string | null = null;
  selectedBudget: string | null = null;
  selectedExperience: string | null = null;
  selectedGoal: string | null = null;
  interestedProvinceCodes: string[] = [];
  selectedLegalCategoryIds: number[] = [1, 4, 5];

  readonly roleOptions: SelectOption[] = [
    { label: 'Nhà đầu tư', value: 'investor' },
    { label: 'Doanh nghiệp', value: 'business' },
    { label: 'Người mua cá nhân', value: 'individual' },
  ];

  readonly genderOptions: SelectOption[] = [
    { label: 'Nam', value: 'male' },
    { label: 'Nữ', value: 'female' },
    { label: 'Khác', value: 'other' },
  ];

  readonly budgetOptions: SelectOption[] = [
    { label: 'Dưới 1 tỷ', value: 'under-1b' },
    { label: 'Từ 1 - 5 tỷ', value: '1-5b' },
    { label: 'Từ 5 - 20 tỷ', value: '5-20b' },
    { label: 'Trên 20 tỷ', value: 'over-20b' },
  ];

  readonly experienceOptions: SelectOption[] = [
    { label: 'Mới bắt đầu', value: 'newbie' },
    { label: '1 - 3 năm', value: '1-3y' },
    { label: 'Trên 3 năm', value: '3y+' },
  ];

  readonly goalOptions: SelectOption[] = [
    { label: 'Đầu tư dài hạn', value: 'long-term' },
    { label: 'Mua để sử dụng', value: 'personal-use' },
    { label: 'Lướt sóng', value: 'short-term' },
  ];
  readonly legalCategories = [
    { id: 1, name: 'Bất động sản' },
    { id: 2, name: 'Xe cộ' },
    { id: 3, name: 'Máy móc' },
    { id: 4, name: 'Hàng hóa' },
    { id: 5, name: 'Đồ dùng' },
    { id: 6, name: 'Khác' },
  ];

  profileForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    isNotificated: [false],
    oldPassword: [''],
    password: [''],
    confirmPassword: [''],
  });

  ngOnInit(): void {
    this.dvhcStore.getProvinces$();
    this.dvhcStore.listProvinces$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (!data) return;
      this.provinces = data;
      this.optionsLocation = data.map(item => ({
        label: item.nameWithType,
        value: item.code,
      }));
    });
    this.fetchUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  setActiveTab(tab: 'profile' | 'notification' | 'credit' | 'password'): void {
    this.activeTab = tab;
  }

  toggleLegalCategory(id: number): void {
    if (this.selectedLegalCategoryIds.includes(id)) {
      this.selectedLegalCategoryIds = this.selectedLegalCategoryIds.filter(item => item !== id);
      return;
    }
    this.selectedLegalCategoryIds = [...this.selectedLegalCategoryIds, id];
  }

  isLegalCategoryActive(id: number): boolean {
    return this.selectedLegalCategoryIds.includes(id);
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
