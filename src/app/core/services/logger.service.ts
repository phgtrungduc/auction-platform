import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConsoleService } from './console.service';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private static getTimeoutByMessageLength(length: number): number {
    const min = 3000;
    const max = 8000;
    return Math.min(Math.max(length * 50, min), max);
  }

  constructor(private readonly toastr: ToastrService) {}

  info(message: string, title?: string, timeout?: number): void {
    const duration = timeout ?? LoggerService.getTimeoutByMessageLength(message.length);
    this.toastr.info(message, title, { timeOut: duration, extendedTimeOut: duration });
  }

  success(message: string, title?: string, timeout?: number): void {
    const duration = timeout ?? LoggerService.getTimeoutByMessageLength(message.length);
    this.toastr.success(message, title, { timeOut: duration, extendedTimeOut: duration });
  }

  error(message: string, title?: string, timeout?: number): void {
    const duration = timeout ?? LoggerService.getTimeoutByMessageLength(message.length);
    this.toastr.error(message, title, { timeOut: duration, extendedTimeOut: duration });
    ConsoleService.logInfo({ message, title });
  }

  warn(message: string, title?: string, timeout?: number): void {
    const duration = timeout ?? LoggerService.getTimeoutByMessageLength(message.length);
    this.toastr.warning(message, title, { timeOut: duration, extendedTimeOut: duration });
    ConsoleService.logWarn({ message, title });
  }
}
