const SCRIPT_ID = 'tencent-captcha-sdk';

declare global {
  interface Window {
    TencentCaptcha?: new (
      appId: string,
      callback: (res: TencentCaptchaResult) => void,
      options?: Record<string, unknown>
    ) => { show: () => void; destroy?: () => void };
  }
}

export interface TencentCaptchaResult {
  ret: number;
  randstr: string;
  ticket: string;
  appid: string;
  bizState?: string;
  err_msg?: string;
}

function injectCaptchaScript(): Promise<void> {
  if (window.TencentCaptcha) {
    return Promise.resolve();
  }

  if (document.getElementById(SCRIPT_ID)) {
    return new Promise((resolve) => {
      const listener = () => {
        document.removeEventListener('tencent-captcha:ready', listener);
        resolve();
      };
      document.addEventListener('tencent-captcha:ready', listener);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://turing.captcha.qcloud.com/TJCaptcha.js';
    script.async = true;
    script.onload = () => {
      document.dispatchEvent(new Event('tencent-captcha:ready'));
      resolve();
    };
    script.onerror = () => reject(new Error('验证码组件加载失败'));
    document.body.appendChild(script);
  });
}

export async function requestCaptcha(appId: string): Promise<TencentCaptchaResult> {
  await injectCaptchaScript();

  const Constructor = window.TencentCaptcha;
  if (!Constructor) {
    throw new Error('验证码组件不可用');
  }

  return new Promise((resolve, reject) => {
    const instance = new Constructor(appId, (res) => {
      if (res.ret === 0) {
        resolve(res);
      } else {
        reject(new Error(res.err_msg || '用户取消了验证'));
      }
      instance.destroy?.();
    });

    instance.show();
  });
}
