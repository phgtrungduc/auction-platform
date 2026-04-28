import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-email-content',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="content">
      <h2>Đăng nhập</h2>
      <p>Nhập email để tiếp tục</p>

      <label
        class="input-wrap"
        [class.has-error]="emailTouched && !isValidEmail()"
      >
        <span class="icon"><i class="fa-regular fa-user"></i></span>
        <input
          [(ngModel)]="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="Nhập email"
          (blur)="emailTouched = true"
          (keydown.enter)="onEnter()"
        />
      </label>
      <p class="error-text" *ngIf="emailTouched && email && !isValidEmail()">
        Email không đúng định dạng (ví dụ: example&#64;email.com)
      </p>

      <!-- <app-loading-overlay [loading]="isLoading"> -->
      <button
        type="button"
        [disabled]="!isValidEmail()"
        (click)="continueRequested.emit(email)"
      >
        Tiếp tục
      </button>
      <!-- </app-loading-overlay> -->
    </div>
  `,
  styles: `
    .content {
      width: min(100%, 520px);
      justify-self: center;
      margin-top: 60px;
      @media (max-width: 991px) {
        margin-top: 0;
      }
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
      margin: 4px 0 8px;
      text-align: left;
      color: #e53935;
      font-size: 11.5px;
      font-weight: 400;
    }
    button {
      margin-top: 14px;
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
export class AuthEmailContentComponent {
  @Input() set initialEmail(value: string) {
    this.email = value ?? '';
  }
  @Output() continueRequested = new EventEmitter<string>();
  email = '';
  emailTouched = false;

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  onEnter(): void {
    this.emailTouched = true;
    if (this.isValidEmail()) {
      this.continueRequested.emit(this.email);
    }
  }
}
