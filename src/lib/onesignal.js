// lib/onesignal.js
//
// Thin wrapper around OneSignal REST API v1 • Uses native fetch (Node 18+)
// ---------------------------------------------------------------

const APP_ID       = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const REST_API_KEY = process.env.NEXT_PUBLIC_ONESIGNAL_REST_API_KEY;
const BASE_URL     = "https://api.onesignal.com";

if (!APP_ID || !REST_API_KEY) {
  throw new Error('⚠️  ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY missing in environment');
}

/* ──────────────
   Core helper
──────────────── */
async function onesignalRequest(endpoint, { method = 'POST', body = null } = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${REST_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `OneSignal ${method} ${endpoint} → ${res.status}\n${JSON.stringify(err)}`
    );
  }

  return res.json();
}

/* ──────────────
   Public helpers
──────────────── */

/**
 * Send a push notification.
 *
 * @param {Object} opts
 * @param {string} opts.title           - Notification title
 * @param {string} opts.message         - Notification body
 * @param {string[]} [opts.playerIds]   - Array of OneSignal player IDs
 * @param {string[]} [opts.segments]    - Array of OneSignal segment names
 * @param {string}   [opts.url]         - Click-through URL
 * @param {string}   [opts.imageUrl]    - Big picture / thumbnail URL
 * @param {Date}     [opts.scheduleAt]  - Future Date object (UTC) to schedule
 */
export async function sendNotification(opts = {}) {
  const {
    title,
    message,
    playerIds = [],
    segments  = [],
    url,
    imageUrl,
    scheduleAt,
  } = opts;

  if (!title || !message) {
    throw new Error('title and message are required');
  }

  const payload = {
    app_id: APP_ID,
    headings: { en: title },
    contents: { en: message },
  };

  if (playerIds.length) payload.include_player_ids = playerIds;
  if (segments.length)  payload.included_segments  = segments;
  if (url)              payload.url               = url;
  if (imageUrl)         payload.big_picture       = imageUrl;
  if (scheduleAt)       payload.send_after        = scheduleAt.toUTCString();

  return onesignalRequest('/notifications', { body: payload });
}

/**
 * Create a dynamic segment (server-side filters)
 * Docs: https://documentation.onesignal.com/reference/create-segment
 *
 * @param {string} name
 * @param {Array}  filters – OneSignal filter array
 */
export async function createSegment(name, filters = []) {
  return onesignalRequest('/segments', {
    body: {
      app_id: APP_ID,
      name,
      filters,
    },
  });
}

/**
 * Delete a segment by ID.
 * @param {string} segmentId
 */
export async function deleteSegment(segmentId) {
  return onesignalRequest(`/segments/${segmentId}?app_id=${APP_ID}`, {
    method: 'DELETE',
  });
}

/**
 * Cancel a scheduled notification by ID.
 * @param {string} notificationId
 */
export async function cancelNotification(notificationId) {
  return onesignalRequest(
    `/notifications/${notificationId}?app_id=${APP_ID}`,
    { method: 'DELETE' }
  );
}
