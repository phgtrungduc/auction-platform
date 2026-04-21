import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
  selector: 'app-suggest-notificated-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggest-notificated-popup.component.html',
  styleUrl: './suggest-notificated-popup.component.scss',
})
export class SuggestNotificatedPopupComponent {
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  isOpen = false;
  isSubmitting = false;

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  onConfirm(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.authService
      .updateNotificationStatus({ statusReceiveNotification: true })
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.logger.success(response.message || 'Đã bật thông báo.');
            this.close();
          } else {
            this.logger.error(response.message || 'Không thể bật thông báo.');
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.logger.error('Không thể bật thông báo. Vui lòng thử lại.');
        },
      });
  }

  onLater(): void {
    this.close();
  }
}
