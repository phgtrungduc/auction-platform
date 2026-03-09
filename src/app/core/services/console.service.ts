import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConsoleService {
  private static readonly colorInfo = 'background: #2563EB; color: #fff; font-size: 14px;';
  private static readonly colorWarn = 'background: #D97706; color: #fff; font-size: 14px;';
  private static readonly colorSuccess = 'background: #16A34A; color: #fff; font-size: 14px;';
  private static readonly colorError = 'background: #DC2626; color: #fff; font-size: 14px;';
  private static readonly colorNormal = 'color: #2563EB; font-size: 12px';

  private static canShowLog(): boolean {
    return !!(localStorage['debugger'] || (window as any)['debugger']);
  }

  public static logInfo(ob: any, ...optionalParams: any[]): void {
    if (!ConsoleService.canShowLog()) return;
    if (typeof ob === 'string' || typeof ob === 'number') {
      console.log(`%c[${new Date().toISOString()}] ${ob}`, ConsoleService.colorNormal, ...optionalParams);
    } else {
      console.log(ob);
    }
  }

  public static logWarn(ob: any, ...optionalParams: any[]): void {
    if (!ConsoleService.canShowLog()) return;
    if (typeof ob === 'string' || typeof ob === 'number') {
      console.warn(`%c[${new Date().toISOString()}] ${ob}`, ConsoleService.colorWarn, ...optionalParams);
    } else {
      console.warn(ob);
    }
  }

  public static logError(ob: any, ...optionalParams: any[]): void {
    console.error(ob, ...optionalParams);
  }

  public warn(message: string): void {
    if (ConsoleService.canShowLog() && message) {
      console.log(`%c[${new Date().toISOString()}] ${message}`, ConsoleService.colorWarn);
    }
  }

  public info(message: string): void {
    if (ConsoleService.canShowLog() && message) {
      console.log(`%c[${new Date().toISOString()}] ${message}`, ConsoleService.colorInfo);
    }
  }

  public success(message: string): void {
    if (ConsoleService.canShowLog() && message) {
      console.log(`%c[${new Date().toISOString()}] ${message}`, ConsoleService.colorSuccess);
    }
  }

  public error(message: string): void {
    if (message) {
      console.log(`%c[${new Date().toISOString()}] ${message}`, ConsoleService.colorError);
    }
  }
}
