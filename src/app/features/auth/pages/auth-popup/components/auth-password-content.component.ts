import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-password-content',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <form class="content" (ngSubmit)="onSubmit($event)">
      <h2>Nhập mật khẩu</h2>
      <!-- Thêm trường username ẩn để trình duyệt biết lưu mật khẩu cho tài khoản nào -->
      <input type="text" [value]="email" name="username" autocomplete="username" style="display: none;" />
      
      <p>Nhập mật khẩu đăng nhập của bạn</p>

      <label class="input-wrap">
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
          name="password"
          autocomplete="current-password"
          [(ngModel)]="password"
          [type]="showPassword ? 'text' : 'password'"
          placeholder="Mật khẩu"
        />
        <span class="eye" (click)="togglePassword()">
          <svg
            *ngIf="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#667085"
          >
            <path
              stroke-width="2"
              d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"
            />
            <circle cx="12" cy="12" r="3" stroke-width="2" />
          </svg>

          <svg
            *ngIf="showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#667085"
          >
            <path stroke-width="2" d="M3 3l18 18" />
            <path
              stroke-width="2"
              d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42"
            />
            <path
              stroke-width="2"
              d="M9.88 5.09A10.94 10.94 0 0112 5c6 0 10 7 10 7a17.73 17.73 0 01-5.06 5.94M6.1 6.1A17.73 17.73 0 002 12s4 7 10 7c1.61 0 3.09-.38 4.41-1.06"
            />
          </svg>
        </span>
      </label>

      <div class="row">
        <label class="remember">
          <!-- <input type="checkbox" [(ngModel)]="remember" name="remember" />
          <span>Nhớ mật khẩu</span> -->
        </label>
        <button type="button" class="forgot-btn">Quên mật khẩu?</button>
      </div>

      <button
        type="submit"
        [disabled]="password.length < 8"
      >
        Đăng nhập
      </button>
    </form>
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
    }
    .icon {
      color: #367639;
      font-size: 15px;
    }
    input[type='password'] {
      flex: 1;
      border: 0;
      background: transparent;
      outline: none;
      color: #1f2937;
    }
    input[type='text'] {
      flex: 1;
      border: 0;
      background: transparent;
      outline: none;
      color: #1f2937;
    }
    .row {
      margin: 10px 0 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #667085;
    }
    .remember {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      width: 70%;
      font-size: 12px;
    }
    .forgot-btn {
      width: 30%;
      border: none;
      background: transparent;
      color: #367639;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      text-align: right;
    }
    button {
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
export class AuthPasswordContentComponent {
  @Input() email = '';
  @Output() submitRequested = new EventEmitter<string>();
  password = '';
  remember = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (this.password.length >= 8) {
      this.submitRequested.emit(this.password);
    }
  }
}
