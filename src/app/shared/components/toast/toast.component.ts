import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

interface Toast extends ToastMessage {
  id: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private toastService = inject(ToastService);
  private subscription!: Subscription;
  private idCounter = 0;

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe((toast: ToastMessage) => {
      const newToast: Toast = { ...toast, id: this.idCounter++ };
      this.toasts.push(newToast);

      // Auto remove after 5 seconds
      setTimeout(() => {
        this.removeToast(newToast.id);
      }, 5000);
    });
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
