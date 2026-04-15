import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-register-content',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="content">
      <h2>Đăng ký</h2>
      <p>Tạo tài khoản đăng nhập của bạn</p>

      <label class="input-wrap">
        <span class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 4H10C6.229 4 4.343 4 3.172 5.172C2.001 6.344 2 8.229 2 12C2 15.771 2 17.657 3.172 18.828C4.344 19.999 6.229 20 10 20H12M15 4C18.114 4.01 19.765 4.108 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.765 19.892 18.114 19.99 15 20" stroke="#367639" stroke-width="1.5" stroke-linecap="round"/>
<path d="M9 12C9 12.2652 8.89464 12.5196 8.70711 12.7071C8.51957 12.8946 8.26522 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11C8.26522 11 8.51957 11.1054 8.70711 11.2929C8.89464 11.4804 9 11.7348 9 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12Z" fill="#367639"/>
<path d="M15 2V22" stroke="#367639" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</span>
        <input [(ngModel)]="password" type="password" placeholder="Mật khẩu" />
      </label>

      <div class="strength-wrap">
        <span>Độ bảo mật</span>
        <div class="bars">
          <span class="bar active"></span>
          <span class="bar active"></span>
          <span class="bar active"></span>
          <span class="bar"></span>
        </div>
      </div>

      <label class="input-wrap">
        <span class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 4H10C6.229 4 4.343 4 3.172 5.172C2.001 6.344 2 8.229 2 12C2 15.771 2 17.657 3.172 18.828C4.344 19.999 6.229 20 10 20H12M15 4C18.114 4.01 19.765 4.108 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.765 19.892 18.114 19.99 15 20" stroke="#367639" stroke-width="1.5" stroke-linecap="round"/>
<path d="M9 12C9 12.2652 8.89464 12.5196 8.70711 12.7071C8.51957 12.8946 8.26522 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11C8.26522 11 8.51957 11.1054 8.70711 11.2929C8.89464 11.4804 9 11.7348 9 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12Z" fill="#367639"/>
<path d="M15 2V22" stroke="#367639" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</span>
        <input [(ngModel)]="confirmPassword" type="password" placeholder="Xác nhận mật khẩu" />
      </label>

      <button type="button" [disabled]="!isValidForm()" (click)="registerRequested.emit()">Đăng ký</button>
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
      color: #5F788B;
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
      margin-bottom: 10px;
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
    .strength-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: #667085;
      font-size: 12px;
    }
    .bars {
      display: flex;
      gap: 6px;
    }
    .bar {
      width: 30px;
      height: 3px;
      border-radius: 999px;
      background: #bfd0e2;
    }
    .bar.active {
      background: #e9a950;
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
export class AuthRegisterContentComponent {
  @Output() registerRequested = new EventEmitter<void>();
  password = '';
  confirmPassword = '';

  isValidForm(): boolean {
    return this.password.length >= 6 && this.password === this.confirmPassword;
  }
}
