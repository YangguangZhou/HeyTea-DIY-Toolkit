import config from '../../shared/heyteaConfig.js';
import cryptoUtils from '../../shared/heyteaCrypto.js';

const { HEYTEA_API_BASE, HEYTEA_BASE_HEADERS, CUP_WIDTH, CUP_HEIGHT } = config;
const { encryptHeyteaMobile, timestampSign, decryptResponseData } = cryptoUtils;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const routes = [
  { method: 'GET', path: '/api/health', handler: handleHealth },
  { method: 'POST', path: '/api/sms/send', handler: handleSendSms },
  { method: 'POST', path: '/api/login/sms', handler: handleSmsLogin },
  { method: 'GET', path: '/api/user', handler: handleUserInfo },
  { method: 'POST', path: '/api/upload', handler: handleUpload },
];

export default {
  async fetch(request) {
    try {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      const url = new URL(request.url);
      const route = routes.find(
        (r) => r.method === request.method && r.path === url.pathname
      );

      if (!route) {
        return jsonResponse({ message: 'Not Found' }, 404);
      }

      const response = await route.handler(request, url);
      return withCors(response);
    } catch (error) {
      return withCors(handleError(error));
    }
  },
};

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

function jsonResponse(body, status = 200, extraHeaders) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), { status, headers });
}

function logInfo(tag, message, meta) {
  const ts = new Date().toISOString();
  if (meta) {
    console.log(`[${ts}][${tag}] ${message}`, meta);
  } else {
    console.log(`[${ts}][${tag}] ${message}`);
  }
}

function logError(tag, message, error) {
  const ts = new Date().toISOString();
  if (error) {
    console.error(`[${ts}][${tag}] ${message}`, error);
  } else {
    console.error(`[${ts}][${tag}] ${message}`);
  }
}

function maskMobile(mobile = '') {
  return String(mobile).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
}

function buildHeaders(currentPage, token) {
  const headers = {
    ...HEYTEA_BASE_HEADERS,
    'current-page': currentPage,
  };
  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return headers;
}

async function requestHeytea(path, init) {
  let response;
  try {
    response = await fetch(`${HEYTEA_API_BASE}${path}`, init);
  } catch (error) {
    logError('HTTP', '请求喜茶接口失败', error);
    throw new HttpError(502, '请求喜茶接口失败');
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    logError('HTTP', '解析喜茶响应失败', error);
    throw new HttpError(502, '解析喜茶响应失败');
  }

  if (!response.ok) {
    const message = data?.message || data?.msg || `喜茶接口错误(${response.status})`;
    throw new HttpError(response.status, message, data);
  }

  return data;
}

async function handleHealth() {
  return jsonResponse({
    ok: true,
    timestamp: Date.now(),
    env: 'cloudflare-worker',
  });
}

async function handleSendSms(request) {
  const body = await readJsonBody(request);
  const { mobile, ticket, randstr } = body || {};

  if (!mobile) {
    throw new HttpError(400, '手机号必填');
  }

  const payload = {
    client: 'app',
    brandId: '1000001',
    mobile: encryptHeyteaMobile(mobile),
    zone: '86',
    cryptoLevel: 2,
    ticketFrom: 'min',
  };

  if (ticket && randstr) {
    payload.ticket = ticket;
    payload.randstr = randstr;
  }

  logInfo('SMS', '请求发送验证码', { mobile: maskMobile(mobile) });
  const data = await requestHeytea(
    '/api/service-member/openapi/vip/user/sms/verifiyCode/send',
    {
      method: 'POST',
      headers: buildHeaders('/pages/login/login_app/index'),
      body: JSON.stringify(payload),
    }
  );

  if (data.code === 4005021) {
    logInfo('SMS', '需要人机验证', { mobile: maskMobile(mobile) });
    return jsonResponse({
      requiresCaptcha: true,
      message: data.message,
    });
  }

  if (data.code !== 0) {
    logError('SMS', `发送失败：${data.message}`);
    throw new HttpError(400, data.message || '验证码发送失败');
  }

  logInfo('SMS', '验证码发送成功', { mobile: maskMobile(mobile) });
  return jsonResponse({ requiresCaptcha: false, message: '短信已发送' });
}

async function handleSmsLogin(request) {
  const body = await readJsonBody(request);
  const { mobile, smsCode } = body || {};

  if (!mobile || !smsCode) {
    throw new HttpError(400, '手机号与验证码必填');
  }

  logInfo('LOGIN', '短信登录请求', { mobile: maskMobile(mobile) });
  const data = await requestHeytea('/api/service-login/openapi/vip/user/login_v1', {
    method: 'POST',
    headers: buildHeaders('/pages/login/login_app/verify_code/index'),
    body: JSON.stringify({
      channel: 'A',
      client: 'app',
      loginType: 'APP_CODE',
      brand: '1000001',
      phone: encryptHeyteaMobile(mobile),
      email: null,
      smsCode,
      zone: '86',
      cryptoLevel: 2,
      ticketFrom: 'min',
    }),
  });

  if (data.code !== 0 || !data.data?.token) {
    logError('LOGIN', `登录失败：${data.message}`, { mobile: maskMobile(mobile) });
    throw new HttpError(400, data.message || '登录失败');
  }

  logInfo('LOGIN', '短信登录成功', { mobile: maskMobile(mobile) });
  return jsonResponse({ token: data.data.token });
}

async function handleUserInfo(request, url) {
  const token = extractToken(request, url);
  if (!token) {
    throw new HttpError(400, '缺少授权 token');
  }

  const data = await requestHeytea('/api/service-member/vip/user/info', {
    method: 'GET',
    headers: buildHeaders('/pages/my/index', token),
  });

  if (data.code !== 0) {
    logError('USER', `获取用户信息失败：${data.message}`);
    throw new HttpError(400, data.message || '获取用户信息失败');
  }

  const user = decryptResponseData(data.data, true);
  logInfo('USER', '获取用户信息成功', {
    userId: user?.user_main_id,
    name: user?.name,
  });
  return jsonResponse({ user });
}

async function handleUpload(request) {
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
    throw new HttpError(400, 'Content-Type 必须是 multipart/form-data');
  }

  const formData = await request.formData();
  const token = formData.get('token');
  const userMainId = formData.get('userMainId');
  const widthValue = formData.get('width') || CUP_WIDTH;
  const heightValue = formData.get('height') || CUP_HEIGHT;
  const file = formData.get('file');

  if (!token || !userMainId) {
    throw new HttpError(400, '缺少 token 或 userMainId');
  }

  if (!(file instanceof File)) {
    throw new HttpError(400, '缺少文件');
  }

  const timestamp = Date.now();
  const sign = timestampSign(userMainId, timestamp);
  const headers = buildHeaders('/pages/diy/submit/index', token);
  delete headers['Content-Type'];

  const upstreamForm = new FormData();
  upstreamForm.append('file', file, file.name || 'cup.png');
  upstreamForm.append('width', String(widthValue || CUP_WIDTH));
  upstreamForm.append('height', String(heightValue || CUP_HEIGHT));

  logInfo('UPLOAD', '开始上传', { userMainId });
  const data = await requestHeytea(
    `/api/service-cps/user/diy?sign=${sign}&t=${timestamp}`,
    {
      method: 'POST',
      headers,
      body: upstreamForm,
    }
  );

  if (data.code !== 0) {
    logError('UPLOAD', `上传失败：${data.message}`, { userMainId });
    throw new HttpError(400, data.message || '上传失败');
  }

  logInfo('UPLOAD', '上传成功', { userMainId });
  return jsonResponse({ message: '上传成功', data: data.data });
}

async function readJsonBody(request) {
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      return await request.json();
    }
    return {};
  } catch (error) {
    throw new HttpError(400, '无法解析 JSON 请求体');
  }
}

function extractToken(request, url) {
  const auth = request.headers.get('authorization');
  if (auth) {
    if (auth.startsWith('Bearer ')) {
      return auth.slice(7);
    }
    return auth;
  }
  return url.searchParams.get('token');
}

function handleError(error) {
  if (error instanceof HttpError) {
    return jsonResponse(
      { message: error.message, details: error.details },
      error.status
    );
  }
  logError('WORKER', '未预期的错误', error);
  return jsonResponse({ message: '未预期的错误' }, 500);
}
