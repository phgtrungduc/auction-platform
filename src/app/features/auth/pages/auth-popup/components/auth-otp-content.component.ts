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
          <input
            id="otp-input-{{ i }}"
            maxlength="1"
            inputmode="numeric"
            autocomplete="one-time-code"
            [ngModel]="otpDigits[i]"
            (ngModelChange)="onDigitChange($event, i)"
            (keydown)="onKeyDown($event, i)"
            (paste)="onPaste($event, i)"
          />
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

  onDigitChange(value: string, index: number): void {
    const sanitized = (value ?? '').replace(/\D/g, '');

    if (!sanitized) {
      this.otpDigits[index] = '';
      return;
    }

    // Handle fast typing/autofill where multiple digits can come at once.
    const digits = sanitized.slice(0, this.otpDigits.length - index).split('');
    digits.forEach((digit, offset) => {
      this.otpDigits[index + offset] = digit;
    });

    const nextIndex = Math.min(index + digits.length, this.otpDigits.length - 1);
    this.focusInput(nextIndex);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < this.otpDigits.length - 1) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') ?? '';
    const digits = pastedText.replace(/\D/g, '').slice(0, this.otpDigits.length - index).split('');

    if (!digits.length) {
      return;
    }

    digits.forEach((digit, offset) => {
      this.otpDigits[index + offset] = digit;
    });

    const lastFilledIndex = Math.min(index + digits.length - 1, this.otpDigits.length - 1);
    this.focusInput(lastFilledIndex);
  }

  private focusInput(index: number): void {
    const inputElement = document.getElementById(`otp-input-${index}`) as HTMLInputElement | null;
    if (!inputElement) {
      return;
    }

    inputElement.focus();
    inputElement.select();
  }
}
