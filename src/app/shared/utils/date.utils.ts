import moment, { Moment } from 'moment';

export namespace DateUtils {
  export function formatDateTime(date: Date | string | Moment): string | null {
    if (!date || date === '0001-01-01T00:00:00Z') return null;
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  }

  export function toVietnamTime(date: Date | string): Moment {
    return moment.utc(date).utcOffset(7);
  }

  export function formatVietnamDateTime(date: Date | string): string | null {
    if (!date || date === '0001-01-01T00:00:00Z') return null;
    return formatDateTime(toVietnamTime(date));
  }
}
