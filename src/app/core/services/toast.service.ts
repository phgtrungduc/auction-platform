import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  status: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  show(toast: ToastMessage) {
    this.toastSubject.next(toast);
  }

  success(message: string, title?: string) {
    this.show({ status: 'success', title: title ?? 'Thành công!', message });
  }

  error(message: string, title?: string) {
    this.show({ status: 'error', title: title ?? 'Thất bại!', message });
  }

  info(message: string, title?: string) {
    this.show({ status: 'info', title, message });
  }
}
