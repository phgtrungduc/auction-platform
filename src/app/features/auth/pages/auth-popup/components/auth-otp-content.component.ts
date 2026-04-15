import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-otp-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <h2>Xác thực OTP</h2>
      <p>Nhập mã OTP đã gửi đến email {{ email }}</p>

      <div class="otp-grid">
        @for (digit of otpDigits; track $index; let i = $index) {
          <input maxlength="1" [(ngModel)]="otpDigits[i]" />
        }
      </div>

      <p class="otp-time">Mã OTP sẽ hết hiệu lực sau: ({{ remainingSeconds }}s)</p>
      <p class="resend-row">Chưa nhận được mã OTP? <button type="button">Gửi lại mã</button></p>

      <button class="verify-btn" type="button" [disabled]="otpValue.length !== 6" (click)="verifyRequested.emit(otpValue)">
        Xác thực
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
      color: #5F788B;
      font-size: 12px;
      word-break: break-all;
      font-weight: 400;
    }
    .otp-grid {
      padding: 0 42px;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      //gap: 10px;
      margin: 10px 0;
    }
    .otp-grid input {
      height: 54px;
      width: 54px;
      border: 1px solid #7d98b3;
      border-radius: 10px;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
      outline: none;
      background: #fff;
    }
    .otp-time {
      margin-top: 6px;
      margin-bottom: 2px;
      font-size: 12px;
      color: #6b7280;
    }
    .resend-row {
      margin: 0 0 14px;
      font-size: 12px;
    }
    .resend-row button {
      color: #367639;
      font-weight: 700;
      margin-left: 4px;
    }
    .verify-btn {
      width: 100%;
      border-radius: 8px;
      background: #367639;
      color: #fff;
      padding: 11px 12px;
      font-size: 15px;
      font-weight: 500;
    }
    .verify-btn:disabled {
      opacity: 0.55;
    }
  `,
})
export class AuthOtpContentComponent {
  @Input() email = '';
  @Input() remainingSeconds = 56;
  @Output() verifyRequested = new EventEmitter<string>();

  otpDigits = ['', '', '', '', '', ''];

  get otpValue(): string {
    return this.otpDigits.join('').trim();
  }
}
