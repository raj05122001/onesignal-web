// utils/formatDate.js
//
// Tiny date-utility helpers used across dashboards
// ------------------------------------------------
// Uses `Intl.DateTimeFormat` (no extra deps). If you already
// have dayjs/date-fns in the project, you can swap these out.

// Default formatter – “07 Jun 2025, 23:14”
const defaultFmt = new Intl.DateTimeFormat('en-IN', {
  day:       '2-digit',
  month:     'short',
  year:      'numeric',
  hour:      '2-digit',
  minute:    '2-digit',
});

/**
 * Format a JS Date (or ISO string) into “07 Jun 2025, 23:14”.
 * @param {Date | string | number} date
 * @param {Intl.DateTimeFormatOptions} [opts] – override options
 * @returns {string}
 */
export function formatDate(date, opts = {}) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return 'Invalid date';

  // Merge custom options if passed
  const fmt = Object.keys(opts).length
    ? new Intl.DateTimeFormat('en-IN', opts)
    : defaultFmt;

  return fmt.format(d);
}

/**
 * Short human-readable “x mins ago / yesterday” strings.
 * Simple logic; good enough for dashboards.
 *
 * @param {Date | string | number} date
 * @returns {string}
 */
export function timeAgo(date) {
  const now   = Date.now();
  const past  = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diff  = Math.floor((now - past) / 1000);         // seconds
  const units = [
    { label: 'year',   secs: 60 * 60 * 24 * 365 },
    { label: 'month',  secs: 60 * 60 * 24 * 30 },
    { label: 'day',    secs: 60 * 60 * 24 },
    { label: 'hour',   secs: 60 * 60 },
    { label: 'minute', secs: 60 },
  ];

  for (const { label, secs } of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) return `${val} ${label}${val > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
