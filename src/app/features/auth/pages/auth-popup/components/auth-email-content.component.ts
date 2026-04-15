import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-email-content',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="content">
      <h2>Đăng nhập</h2>
      <p>Nhập email để tiếp tục</p>

      <label class="input-wrap">
        <span class="icon"><i class="fa-regular fa-user"></i></span>
        <input [(ngModel)]="email" type="email" placeholder="Nhập email" />
      </label>

      <button type="button" [disabled]="!isValidEmail()" (click)="continueRequested.emit(email)">
        Tiếp tục
      </button>
    </div>
  `,
  styles: `
    .content {
      width: min(100%, 520px);
      justify-self: center;
      margin-top: 60px;
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
  @Output() continueRequested = new EventEmitter<string>();
  email = '';

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }
}
