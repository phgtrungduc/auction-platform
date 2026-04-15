import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthBrandLogoComponent } from './auth-brand-logo.component';

@Component({
  selector: 'app-auth-popup-layout',
  standalone: true,
  imports: [CommonModule, AuthBrandLogoComponent],
  template: `
    <div class="layout-shell">
      <div class="layout-left">
        <img src="assets/images/login-layout-img.png" alt="Login layout image" />
      </div>

      <div class="layout-right">
        <button class="close-btn" type="button" (click)="closeRequested.emit()">&#215;</button>
        <div class="brand-block">
          <app-auth-brand-logo />
        </div>
        @if (showBack) {
          <button class="back-btn" type="button" (click)="backRequested.emit()">
            <span aria-hidden="true">&#8592;</span>
            <span>Quay lại</span>
          </button>
        }
        <div class="content-slot">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: `
    .layout-shell {
      display: grid;
      grid-template-columns: minmax(300px, 1fr) minmax(360px, 1fr);
      gap: 18px;
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      min-height: 590px;
    }

    .layout-left {
      border: 1px solid #82af8a;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }

    .layout-left img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .layout-right {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 8px 6px 8px 0;
    }

    .close-btn {
      position: absolute;
      top: -2px;
      right: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid #3c3c3c;
      font-size: 15px;
      line-height: 18px;
      display: grid;
      place-items: center;
      color: #1f2937;
      background: transparent;
    }

    .brand-block {
      width: 256px;
      margin-top: 10px;
    }

    .back-btn {
      margin-top: 34px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #343434;
      font-size: 14px;
      width: fit-content;
    }

    .content-slot {
      margin-top: 22px;
      //display: grid;
      justify-items: stretch;
      padding-right: 8px;
    }

    @media (max-width: 991px) {
      .layout-shell {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .layout-left {
        display: none;
      }

      .layout-right {
        padding-right: 0;
      }
    }
  `,
})
export class AuthPopupLayoutComponent {
  @Input() showBack = false;
  @Output() closeRequested = new EventEmitter<void>();
  @Output() backRequested = new EventEmitter<void>();
}
