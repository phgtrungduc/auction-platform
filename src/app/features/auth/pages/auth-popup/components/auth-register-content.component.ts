import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-register-content',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="content">
      <h2>Đăng ký</h2>
      <p>Tạo tài khoản đăng nhập của bạn</p>

      <label
        class="input-wrap"
        [class.has-error]="passwordTouched && !isPasswordValid()"
      >
        <span class="icon"
          ><svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4H10C6.229 4 4.343 4 3.172 5.172C2.001 6.344 2 8.229 2 12C2 15.771 2 17.657 3.172 18.828C4.344 19.999 6.229 20 10 20H12M15 4C18.114 4.01 19.765 4.108 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.765 19.892 18.114 19.99 15 20"
              stroke="#367639"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M9 12C9 12.2652 8.89464 12.5196 8.70711 12.7071C8.51957 12.8946 8.26522 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11C8.26522 11 8.51957 11.1054 8.70711 11.2929C8.89464 11.4804 9 11.7348 9 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12Z"
              fill="#367639"
            />
            <path
              d="M15 2V22"
              stroke="#367639"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <input
          [(ngModel)]="password"
          (ngModelChange)="onPasswordChange()"
          (blur)="passwordTouched = true"
          [type]="showPassword ? 'text' : 'password'"
          placeholder="Mật khẩu"
        />
        <span class="eye" (click)="togglePassword()">
          <svg
            *ngIf="!showPassword"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            stroke="#667085"
            fill="none"
          >
            <path
              stroke-width="2"
              d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"
            />
            <circle cx="12" cy="12" r="3" stroke-width="2" />
          </svg>
          <svg
            *ngIf="showPassword"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            stroke="#667085"
            fill="none"
          >
            <path stroke-width="2" d="M3 3l18 18" />
            <path
              stroke-width="2"
              d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42"
            />
            <path stroke-width="2" d="M2 12s4 7 10 7c1.6 0 3-.4 4.4-1" />
          </svg>
        </span>
      </label>
      <p
        class="error-text"
        *ngIf="passwordTouched && password && !isPasswordValid()"
      >
        Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.
      </p>

      <div class="strength-wrap" *ngIf="password">
        <span class="strength-label"
          >Độ bảo mật:
          <strong [style.color]="strengthColor">{{
            strengthLabel
          }}</strong></span
        >
        <div class="bars">
          @for (bar of [1, 2, 3, 4]; track bar) {
            <span
              class="bar"
              [class.active]="strengthScore >= bar"
              [style.background]="
                strengthScore >= bar ? strengthColor : '#bfd0e2'
              "
            ></span>
          }
        </div>
      </div>

      <div class="rules" *ngIf="password">
        <div class="rule" [class.met]="password.length >= 8">
          <span class="rule-icon">{{ password.length >= 8 ? '✓' : '✗' }}</span>
          Ít nhất 8 ký tự
        </div>
        <div class="rule" [class.met]="hasUpperCase()">
          <span class="rule-icon">{{ hasUpperCase() ? '✓' : '✗' }}</span> Có chữ
          hoa (A-Z)
        </div>
        <div class="rule" [class.met]="hasLowerCase()">
          <span class="rule-icon">{{ hasLowerCase() ? '✓' : '✗' }}</span> Có chữ
          thường (a-z)
        </div>
        <div class="rule" [class.met]="hasNumber()">
          <span class="rule-icon">{{ hasNumber() ? '✓' : '✗' }}</span> Có chữ số
          (0-9)
        </div>
        <div class="rule" [class.met]="hasSpecialChar()">
          <span class="rule-icon">{{ hasSpecialChar() ? '✓' : '✗' }}</span> Có
          ký tự đặc biệt (!&#64;#$...)
        </div>
      </div>

      <label
        class="input-wrap"
        [class.has-error]="
          confirmTouched && confirmPassword && !isConfirmMatch()
        "
      >
        <span class="icon"
          ><svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4H10C6.229 4 4.343 4 3.172 5.172C2.001 6.344 2 8.229 2 12C2 15.771 2 17.657 3.172 18.828C4.344 19.999 6.229 20 10 20H12M15 4C18.114 4.01 19.765 4.108 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.765 19.892 18.114 19.99 15 20"
              stroke="#367639"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M9 12C9 12.2652 8.89464 12.5196 8.70711 12.7071C8.51957 12.8946 8.26522 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11C8.26522 11 8.51957 11.1054 8.70711 11.2929C8.89464 11.4804 9 11.7348 9 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12Z"
              fill="#367639"
            />
            <path
              d="M15 2V22"
              stroke="#367639"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <input
          [(ngModel)]="confirmPassword"
          (blur)="confirmTouched = true"
          [type]="showConfirmPassword ? 'text' : 'password'"
          (keydown.enter)="onEnter()"
          placeholder="Xác nhận mật khẩu"
        />
        <span class="eye" (click)="toggleConfirmPassword()">
          <svg
            *ngIf="!showConfirmPassword"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            stroke="#667085"
            fill="none"
          >
            <path
              stroke-width="2"
              d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"
            />
            <circle cx="12" cy="12" r="3" stroke-width="2" />
          </svg>
          <svg
            *ngIf="showConfirmPassword"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            stroke="#667085"
            fill="none"
          >
            <path stroke-width="2" d="M3 3l18 18" />
            <path
              stroke-width="2"
              d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42"
            />
            <path stroke-width="2" d="M2 12s4 7 10 7c1.6 0 3-.4 4.4-1" />
          </svg>
        </span>
      </label>
      <p
        class="error-text"
        *ngIf="confirmTouched && confirmPassword && !isConfirmMatch()"
      >
        Mật khẩu xác nhận không khớp.
      </p>

      <button
        type="button"
        [disabled]="!isValidForm()"
        (click)="registerRequested.emit(password)"
      >
        Đăng ký
      </button>
    </div>
  `,
  styles: `
    .content {
      width: min(100%, 520px);
      justify-self: center;
    }
    h2 {
      text-align: center;
      font-size: 24px;
      line-height: 140%;
      font-weight: 590;
      color: #151515;
    }
    p {
      margin: 4px 0 12px;
      text-align: center;
      color: #5f788b;
      font-size: 12px;
      word-break: break-all;
      font-weight: 400;
    }
    .input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #d5dbe2;
      border-radius: 8px;
      background: #eff2f4;
      padding: 0 12px;
      height: 48px;
      margin-bottom: 4px;
      transition: border-color 0.2s;
    }
    .input-wrap.has-error {
      border-color: #e53935;
      background: #fff5f5;
    }
    .icon {
      color: #367639;
      font-size: 15px;
    }
    input {
      flex: 1;
      border: 0;
      background: transparent;
      outline: none;
      color: #1f2937;
    }
    .error-text {
      margin: 2px 0 8px;
      text-align: left;
      color: #e53935;
      font-size: 11.5px;
      font-weight: 400;
    }
    .strength-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 6px 0 8px;
    }
    .strength-label {
      font-size: 12px;
      color: #667085;
      white-space: nowrap;
    }
    .bars {
      display: flex;
      gap: 5px;
      flex: 1;
    }
    .bar {
      flex: 1;
      height: 4px;
      border-radius: 999px;
      background: #bfd0e2;
      transition: background 0.3s;
    }
    .rules {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 10px;
      padding: 8px 10px;
      background: #f3f6f8;
      border-radius: 8px;
    }
    .rule {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: #9ca3af;
      transition: color 0.2s;
    }
    .rule.met {
      color: #367639;
    }
    .rule-icon {
      font-size: 12px;
      font-weight: 700;
      width: 14px;
      text-align: center;
    }
    button {
      margin-top: 4px;
      width: 100%;
      border-radius: 8px;
      background: #367639;
      color: #fff;
      padding: 11px 12px;
      font-size: 15px;
      font-weight: 500;
    }
    button:disabled {
      opacity: 0.55;
    }
  `,
})
export class AuthRegisterContentComponent {
  @Output() registerRequested = new EventEmitter<string>();
  password = '';
  confirmPassword = '';
  passwordTouched = false;
  confirmTouched = false;
  strengthScore = 0;
  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  readonly strengthLevels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  readonly strengthColors = ['', '#e53935', '#e9a950', '#2196f3', '#367639'];

  get strengthLabel(): string {
    return this.strengthLevels[this.strengthScore] ?? '';
  }

  get strengthColor(): string {
    return this.strengthColors[this.strengthScore] ?? '#bfd0e2';
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.password);
  }
  hasLowerCase(): boolean {
    return /[a-z]/.test(this.password);
  }
  hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }
  hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }

  isPasswordValid(): boolean {
    return (
      this.password.length >= 8 &&
      this.hasUpperCase() &&
      this.hasLowerCase() &&
      this.hasNumber()
    );
  }

  isConfirmMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  isValidForm(): boolean {
    return (
      this.isPasswordValid() &&
      this.isConfirmMatch() &&
      this.confirmPassword.length > 0
    );
  }

  onPasswordChange(): void {
    let score = 0;
    if (this.password.length >= 8) score++;
    if (this.password.length >= 12) score++;
    if (this.hasUpperCase() && this.hasLowerCase() && this.hasNumber()) score++;
    if (this.hasSpecialChar() && this.password.length >= 10) score++;
    this.strengthScore = Math.min(score, 4);
  }
  onEnter() {
    if (this.isValidForm()) {
      this.registerRequested.emit(this.password);
    }
  }
}
