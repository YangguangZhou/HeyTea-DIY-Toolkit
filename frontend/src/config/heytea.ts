const apiRoot = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
export const BACKEND_API_BASE = `${apiRoot}/api`;
export const CAPTCHA_APP_ID = '197451715';
export const CUP_WIDTH = 596;
export const CUP_HEIGHT = 832;
export const MAX_UPLOAD_BYTES = 200 * 1024;
