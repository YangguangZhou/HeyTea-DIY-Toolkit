const HEYTEA_API_BASE = "https://app-go.heytea.com";
const HEYTEA_BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 16; 2410DPN6CC Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4433 MMWEBSDK/20220904 Mobile Safari/537.36 MMWEBID/5976 SAAASDK miniProgram Luggage/3.0.2 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
  Connection: "keep-alive",
  Accept: "application/prs.heytea.v1+json",
  "Accept-Encoding": "gzip",
  "Content-Type": "application/json",
  charset: "utf-8",
  "accept-language": "zh-CN",
  "x-client-version": "4.0.1",
  "current-page": "/pages/login/login_app/index",
  "client-version": "4.0.1",
  version: "4.0.1",
  "gmt-zone": "+08:00",
  "x-region-id": "10",
  "x-client": "app",
  client: "2",
  region: "1",
  "x-version": "4.0.1",
  referer: "https://servicewechat.com/wx696a42df4f2456d3/400000137/page-frame.html",
};

const HEYTEA_UPLOAD_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 16; 2410DPN6CC Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.180 Mobile Safari/537.36 XWEB/1380283 MMWEBSDK/20250904 MMWEBID/9130 MicroMessenger/8.0.64.2940(0x28004033) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
  Connection: "keep-alive",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Content-Type": "multipart/form-data",
  charset: "utf-8",
  Referer: "https://servicewechat.com/wx696a42df4f2456d3/400000137/page-frame.html",
};

const CAPTCHA_APP_ID = "197451715";
const CUP_WIDTH = 596;
const CUP_HEIGHT = 832;

module.exports = {
  HEYTEA_API_BASE,
  HEYTEA_BASE_HEADERS,
  HEYTEA_UPLOAD_HEADERS,
  CAPTCHA_APP_ID,
  CUP_WIDTH,
  CUP_HEIGHT,
};
