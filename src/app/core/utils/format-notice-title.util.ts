/** Tiền tố chuẩn của tiêu đề thông báo đấu giá (MOJ / nguồn tương tự). */
export const NOTICE_TITLE_PREFIX =
  'Thông báo việc đấu giá đối với danh mục tài sản:';

/** Bỏ tiền tố chuẩn để title ngắn gọn trên card / danh sách. */
export function formatNoticeTitle(title: string | undefined | null): string {
  const t = title?.trim() ?? '';
  if (!t) {
    return '—';
  }
  if (t.startsWith(NOTICE_TITLE_PREFIX)) {
    const rest = t.slice(NOTICE_TITLE_PREFIX.length).trim();
    return rest || '—';
  }
  return t;
}
