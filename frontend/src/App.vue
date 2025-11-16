<template>
  <div class="min-h-screen bg-gray-50 pb-16 text-gray-900">
    <div class="mx-auto max-w-6xl px-4 py-10">
      <header class="flex flex-col gap-6 pb-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-semibold uppercase tracking-wide text-gray-700">HeyTea DIY Toolkit</p>
          <a
            :href="GITHUB_URL"
            class="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-4 w-4 fill-current"
              aria-hidden="true"
            >
              <path
                d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56v-2c-3.21.7-3.89-1.38-3.89-1.38a3.07 3.07 0 0 0-1.28-1.7c-1.05-.72.08-.7.08-.7a2.43 2.43 0 0 1 1.78 1.2 2.46 2.46 0 0 0 3.35 1 2.47 2.47 0 0 1 .74-1.55c-2.56-.3-5.26-1.28-5.26-5.71A4.47 4.47 0 0 1 5.31 8a4.14 4.14 0 0 1 .11-3.05s1-.32 3.3 1.23a11.33 11.33 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23a4.14 4.14 0 0 1 .12 3.05 4.46 4.46 0 0 1 1.18 3.11c0 4.45-2.71 5.41-5.28 5.7a2.77 2.77 0 0 1 .8 2.16v3.21c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"
              />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">喜茶杯贴工作台</h1>
        
        <!-- Legal Disclaimer -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="flex items-start gap-3">
            <el-icon :size="20" class="mt-0.5 flex-shrink-0 text-amber-500"><WarningFilled /></el-icon>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 mb-2">免责声明</p>
              <div class="text-sm text-gray-600 space-y-1.5 leading-relaxed">
                <p>本软件仅供学习交流使用，不得用于任何非法用途。</p>
                <p>请合理使用，禁止用于违法用途。</p>
                <p>使用者应遵守相关法律法规，承担使用本软件产生的一切后果。</p>
                <p>开发者不对因使用本软件而产生的任何损失或法律责任负责。</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-5">
        <section class="lg:col-span-2">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div
              :class="[
                'rounded-lg border p-5 text-sm font-medium',
                user
                  ? 'border-gray-300 bg-gray-900 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-900'
              ]"
            >
              <p class="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
                当前状态
              </p>
              <p class="text-xl font-semibold">
                {{ user ? `已登录 ${user.name}` : '未登录' }}
              </p>
              <p v-if="user" class="text-sm mt-2 opacity-75">
                ID: {{ user.user_main_id }}
              </p>
            </div>

            <el-tabs v-model="activeTab" class="custom-tabs">
              <el-tab-pane label="短信验证码" name="sms">
                <template v-if="!user">
                  <el-form label-position="top" class="space-y-4">
                    <el-form-item label="手机号 (仅支持国内 11 位)">
                      <el-input v-model="phone" maxlength="11" placeholder="例：13800000000" />
                    </el-form-item>
                    <el-form-item label="短信验证码">
                      <div class="flex gap-2">
                        <el-input v-model="smsCode" maxlength="6" placeholder="6 位数字" />
                        <el-button
                          type="primary"
                          :loading="isSendingCode"
                          :disabled="isSendingCode || countdown > 0"
                          @click="handleSendCode"
                        >
                          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                        </el-button>
                      </div>
                    </el-form-item>
                    <el-button type="primary" :loading="isLoggingIn" @click="handleSmsLogin">
                      使用短信登录
                    </el-button>
                  </el-form>
                </template>
                <template v-else>
                  <el-alert
                    type="success"
                    :closable="false"
                    show-icon
                    title="已登录"
                    description="如需重新登录，请先退出。"
                  />
                </template>
              </el-tab-pane>

              <el-tab-pane label="Token 登录" name="token">
                <el-form label-position="top" class="space-y-4">
                  <el-form-item label="Bearer Token">
                    <el-input
                      v-model="manualToken"
                      type="textarea"
                      :rows="4"
                      placeholder="粘贴已有 Token"
                    />
                  </el-form-item>
                  <el-button type="primary" :loading="isLoggingIn" @click="handleTokenLogin">
                    使用 Token 登录
                  </el-button>
                </el-form>
              </el-tab-pane>
            </el-tabs>

            <div class="mt-2 flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                <el-switch v-model="rememberMe" size="small" /> 记住 Token（本地加密存储）
              </label>
              <el-button class="font-medium" link type="danger" @click="clearAuth" :disabled="!authToken">
                退出登录
              </el-button>
            </div>
          </div>
        </section>

        <section class="lg:col-span-3">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div class="flex flex-wrap items-center gap-3">
              <button
                @click="triggerFileDialog"
                class="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
              >
                <el-icon><Upload /></el-icon>
                选择或拖入 PNG / JPG
              </button>
              <span class="text-sm font-medium text-gray-600">{{ selectedFileLabel }}</span>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="hidden"
                @change="onFileInput"
              />
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">杯贴效果 {{ CUP_WIDTH }}×{{ CUP_HEIGHT }} px</h3>
                  <span class="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">@2:3 比例</span>
                </div>

                <!-- Preview Area -->
                <div
                  class="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
                  @dragenter.prevent="handleDragEnter"
                  @dragover.prevent="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop.prevent="handleDrop"
                >
                  <canvas
                    v-show="hasPreview"
                    ref="canvasRef"
                    class="w-full rounded-lg"
                    style="aspect-ratio: 596 / 832"
                  />
                  <div
                    v-if="!hasPreview && !workingImage"
                    class="flex h-[420px] flex-col items-center justify-center gap-3 text-gray-400"
                  >
                    <el-icon :size="56"><Picture /></el-icon>
                    <p class="text-sm font-medium text-center px-4 text-gray-500">先选择一张图片，系统会自动缩放到 596×832 并可选灰度</p>
                  </div>
                  <div
                    v-if="isRendering"
                    class="absolute inset-4 rounded-lg bg-white/95 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div class="text-sm font-medium text-gray-700">
                      正在处理图片…
                    </div>
                  </div>
                  <div
                    v-if="isDraggingFile"
                    class="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-400 bg-white/95 text-center backdrop-blur"
                  >
                    <el-icon :size="40" class="text-gray-500"><Download /></el-icon>
                    <p class="font-medium text-gray-700">松开即可上传图片</p>
                  </div>
                </div>
                <div class="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>当前文件：{{ processedFormatLabel }} · {{ processedSizeLabel }}</span>
                  <span :class="exceedsLimit ? 'font-semibold text-red-600' : ''">限制 ≤ {{ MAX_SIZE_KB }}KB</span>
                </div>
                <p v-if="compressionHint" class="text-xs font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">{{ compressionHint }}</p>
                <div v-if="workingImage && !hasPreview" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div class="flex gap-2 text-xs font-medium text-gray-600">
                    <el-icon class="mt-0.5 flex-shrink-0"><InfoFilled /></el-icon>
                    <div class="leading-relaxed">
                      图片已上传，点击"编辑裁切"按钮进行裁切调整。
                    </div>
                  </div>
                </div>
                <div v-else class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div class="flex gap-2 text-xs font-medium text-gray-600">
                    <el-icon class="mt-0.5 flex-shrink-0"><InfoFilled /></el-icon>
                    <div class="leading-relaxed">
                      可在黑白 / 灰度 / 原图模式间切换，确保宽高符合喜茶要求（596×832，小于 200KB）。
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-3">色彩模式</label>
                    <div class="flex gap-2">
                      <button
                        v-for="mode in toneOptions"
                        :key="mode.value"
                        @click="toneMode = mode.value"
                        :class="[
                          'flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition',
                          toneMode === mode.value
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                      >
                        {{ mode.label }}
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="toneMode === 'binary'">
                    <label class="block text-sm font-semibold text-gray-900 mb-2">黑白阈值</label>
                    <el-slider v-model="binaryThreshold" :min="60" :max="220" :step="5" show-stops />
                    <p class="mt-2 text-xs font-medium text-gray-500">
                      阈值越高整体越亮（当前：{{ binaryThreshold }}）。
                    </p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">强制输出 PNG</label>
                    <el-switch v-model="forcePng" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">文件名</label>
                    <input
                      v-model="downloadName"
                      placeholder="上传时使用的文件名"
                      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div class="flex flex-wrap gap-3">
                  <button
                    v-if="workingImage && !hasPreview"
                    @click="showCropperModal"
                    class="rounded-lg border border-gray-300 bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800"
                  >
                    <el-icon class="mr-1"><Edit /></el-icon>
                    编辑裁切
                  </button>
                  <button
                    v-if="workingImage && !hasPreview"
                    @click="cancelCrop"
                    class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <el-icon class="mr-1"><Close /></el-icon>
                    重新选择
                  </button>
                  <button
                    :disabled="!canUpload"
                    @click="handleUpload"
                    :class="[
                      'rounded-lg border px-5 py-2.5 font-medium transition',
                      canUpload
                        ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    ]"
                  >
                    <el-icon class="mr-1"><Upload /></el-icon>
                    {{ isUploading ? '上传中...' : '上传杯贴' }}
                  </button>
                  <button
                    :disabled="!hasPreview"
                    @click="handleDownload"
                    :class="[
                      'rounded-lg border px-5 py-2.5 font-medium transition',
                      hasPreview
                        ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    ]"
                  >
                    <el-icon class="mr-1"><Download /></el-icon>
                    下载 PNG
                  </button>
                  <button
                    v-if="hasPreview"
                    @click="resetToEdit"
                    class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <el-icon class="mr-1"><Refresh /></el-icon>
                    重新编辑
                  </button>
                </div>

                <div v-if="uploadState" class="rounded-lg border border-gray-200 bg-white p-5">
                  <div class="flex items-start gap-3">
                    <el-icon :size="20" :class="uploadState.type === 'success' ? 'text-green-600' : 'text-red-600'">
                      <SuccessFilled v-if="uploadState.type === 'success'" />
                      <CircleClose v-else />
                    </el-icon>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900 mb-2">{{ uploadState.message }}</p>
                      <p
                        v-if="uploadState.type === 'success'"
                        class="text-sm text-gray-600"
                      >
                        如果工具对你有帮助，欢迎
                        <a
                          :href="DONATE_QR_URL"
                          target="_blank"
                          rel="noreferrer"
                          class="font-semibold text-gray-900 underline hover:no-underline"
                        >赞赏</a
                        >，谢谢支持 💛
                      </p>
                      <p
                        v-else-if="uploadState.type === 'error'"
                        class="text-sm text-red-600"
                      >
                        可能是触发了每日上传 10 张的限制，请稍后再试。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <!-- Cropper Modal -->
    <el-dialog
      v-model="showCropper"
      title="裁切图片"
      width="min(90%, 900px)"
      :close-on-click-modal="false"
      class="cropper-dialog"
      @close="handleCropperClose"
    >
      <div class="cropper-modal-content">
        <div class="cropper-container">
          <Cropper
            ref="cropperRef"
            class="cropper"
            :src="cropperImageSrc"
            :stencil-props="{
              aspectRatio: CUP_WIDTH / CUP_HEIGHT,
            }"
            image-restriction="none"
            :transitions="false"
          />
        </div>
        <p class="mt-4 text-sm text-gray-600 text-center">
          💡 使用鼠标滚轮或双指缩放图片，拖动调整位置。允许缩放超出边框，超出部分将填充白色。
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            @click="showCropper = false"
            class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="applyCrop"
            class="rounded-lg border border-gray-900 bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800"
          >
            应用裁切
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus';
import { Upload, Download, Picture, Refresh, WarningFilled, InfoFilled, Close, SuccessFilled, CircleClose, Edit } from '@element-plus/icons-vue';
import { isAxiosError } from 'axios';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { CAPTCHA_APP_ID, CUP_HEIGHT, CUP_WIDTH, MAX_UPLOAD_BYTES } from '@/config/heytea';
import { requestCaptcha } from '@/utils/captcha';
import { loadImage, type ToneMode } from '@/utils/image';
import {
  fetchUserInfo,
  loginWithSms,
  sendSmsCode,
  uploadCupSticker,
  type CaptchaPayload,
  type HeyTeaUser,
} from '@/services/heytea';

const GITHUB_URL = 'https://github.com/YangguangZhou/HeyTea-DIY-Toolkit/';
const STORAGE_KEY = 'heytea-token';
const DONATE_QR_URL = `${import.meta.env.BASE_URL}donate.jpg`;

const toneOptions = [
  { label: '黑白', value: 'binary' as ToneMode },
  { label: '灰度', value: 'grayscale' as ToneMode },
  { label: '原图', value: 'original' as ToneMode },
];

type UploadState = {
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
};

function extractServerMessage(payload: unknown): string | null {
  if (!payload) {
    return null;
  }
  if (typeof payload === 'string') {
    return payload;
  }
  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['message', 'msg', 'error']) {
      const value = record[key];
      if (typeof value === 'string') {
        return value;
      }
    }
  }
  return null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const serverMessage = extractServerMessage(error.response?.data);
    if (serverMessage) {
      return serverMessage;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

function formatServerPayload(payload: unknown): string | null {
  if (payload === null || payload === undefined) {
    return null;
  }
  if (typeof payload === 'string') {
    return payload;
  }
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

const activeTab = ref<'sms' | 'token'>('sms');
const phone = ref('');
const smsCode = ref('');
const manualToken = ref('');
const rememberMe = ref(true);
const authToken = ref<string | null>(localStorage.getItem(STORAGE_KEY));
const user = ref<HeyTeaUser | null>(null);

const isSendingCode = ref(false);
const isLoggingIn = ref(false);
const countdown = ref(0);
let countdownTimer: number | null = null;

const fileInputRef = ref<HTMLInputElement>();
const canvasRef = ref<HTMLCanvasElement>();
const cropperRef = ref<InstanceType<typeof Cropper>>();

const workingImage = ref<HTMLImageElement | null>(null);
const cropperImageSrc = ref<string>('');
const processedBlob = ref<Blob | null>(null);
const toneMode = ref<ToneMode>('binary');
const isDraggingFile = ref(false);
const binaryThreshold = ref(170);
const forcePng = ref(true);
const isRendering = ref(false);
const downloadName = ref('target.png');
const showCropper = ref(false);
const selectedFileLabel = computed(() =>
  processedBlob.value
    ? buildFilename(downloadName.value, processedBlob.value)
    : downloadName.value || '未选择文件'
);
const uploadState = ref<UploadState | null>(null);
const isUploading = ref(false);
const compressionHint = ref('');
const lastUploadHash = ref<string | null>(null);

const hasPreview = computed(() => Boolean(processedBlob.value));
const canUpload = computed(
  () => !!(authToken.value && user.value && processedBlob.value) && !isUploading.value
);
const processedSizeLabel = computed(() =>
  processedBlob.value ? `${(processedBlob.value.size / 1024).toFixed(1)} KB` : '--'
);
const processedFormatLabel = computed(() =>
  processedBlob.value ? (processedBlob.value.type === 'image/jpeg' ? 'JPG' : 'PNG') : '--'
);
const exceedsLimit = computed(
  () => (processedBlob.value?.size ?? 0) > MAX_UPLOAD_BYTES
);
const MAX_SIZE_KB = Math.round(MAX_UPLOAD_BYTES / 1024);

function triggerFileDialog() {
  fileInputRef.value?.click();
}

function startCountdown() {
  countdown.value = 60;
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
  }
  countdownTimer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

async function handleSendCode(payload?: CaptchaPayload) {
  if (!/^1\d{10}$/.test(phone.value)) {
    ElMessage.error('请输入有效的 11 位手机号');
    return;
  }

  if (!payload) {
    isSendingCode.value = true;
  }

  try {
    const result = await sendSmsCode(phone.value, payload);
    if (result.requiresCaptcha) {
      isSendingCode.value = false;
      const captcha = await requestCaptcha(CAPTCHA_APP_ID);
      await handleSendCode({ ticket: captcha.ticket, randstr: captcha.randstr });
      return;
    }

    startCountdown();
    ElMessage.success('验证码已发送');
  } catch (error) {
    const message = getErrorMessage(error, '发送失败');
    ElMessage.error(message);
  } finally {
    if (!payload) {
      isSendingCode.value = false;
    }
  }
}

async function bindToken(token: string) {
  authToken.value = token;
  manualToken.value = token;
  if (rememberMe.value) {
    localStorage.setItem(STORAGE_KEY, token);
  }
  await resolveUserProfile();
}

async function handleSmsLogin() {
  if (!/^1\d{10}$/.test(phone.value)) {
    ElMessage.error('请输入正确的手机号');
    return;
  }
  if (!/^\d{4,6}$/.test(smsCode.value)) {
    ElMessage.error('请输入收到的验证码');
    return;
  }

  isLoggingIn.value = true;
  try {
    const token = await loginWithSms(phone.value, smsCode.value);
    await bindToken(token);
    ElMessage.success('登录成功');
  } catch (error) {
    const message = getErrorMessage(error, '登录失败');
    ElMessage.error(message);
  } finally {
    isLoggingIn.value = false;
  }
}

async function handleTokenLogin() {
  if (!manualToken.value.trim()) {
    ElMessage.error('请输入有效的 Token');
    return;
  }
  isLoggingIn.value = true;
  try {
    await bindToken(manualToken.value.trim());
    ElMessage.success('Token 登录成功');
  } catch (error) {
    const message = getErrorMessage(error, '登录失败');
    ElMessage.error(message);
    authToken.value = null;
  } finally {
    isLoggingIn.value = false;
  }
}

async function resolveUserProfile() {
  if (!authToken.value) {
    return;
  }
  try {
    const info = await fetchUserInfo(authToken.value);
    user.value = info;
  } catch (error) {
    const message = getErrorMessage(error, '获取用户信息失败');
    ElMessage.error(message);
    clearAuth(false);
  }
}

function clearAuth(showToast = true) {
  authToken.value = null;
  manualToken.value = '';
  user.value = null;
  uploadState.value = null;
  lastUploadHash.value = null;
  localStorage.removeItem(STORAGE_KEY);
  if (showToast) {
    ElMessage.success('已退出登录');
  }
}

async function onFileInput(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) return;
  await handleFile(files[0]);
  (event.target as HTMLInputElement).value = '';
}

async function handleFile(file: File) {
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) return;
      cropperImageSrc.value = e.target.result as string;
      const image = await loadImage(e.target.result as string);
      workingImage.value = image;
      downloadName.value = file.name.replace(/\.[^.]+$/, '') + '.png';
      processedBlob.value = null;
      // Automatically open cropper modal after image is loaded
      showCropper.value = true;
    };
    reader.readAsDataURL(file);
  } catch (error) {
    const message = getErrorMessage(error, '图片处理失败');
    ElMessage.error(message);
  }
}

function showCropperModal() {
  showCropper.value = true;
}

function handleCropperClose() {
  // Modal closed
}

async function compressImage(blob: Blob, maxSizeBytes: number): Promise<Blob> {
  // Use browser-image-compression library
  if (typeof (window as any).imageCompression === 'undefined') {
    throw new Error('图片压缩库未加载');
  }

  const imageCompression = (window as any).imageCompression;
  
  // Convert blob to File if needed
  const file = blob instanceof File ? blob : new File([blob], 'image.png', { type: blob.type });
  
  const options = {
    maxSizeMB: maxSizeBytes / (1024 * 1024),
    maxWidthOrHeight: Math.max(CUP_WIDTH, CUP_HEIGHT),
    useWebWorker: true,
    fileType: forcePng.value ? 'image/png' : undefined,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return blob;
  }
}

async function applyCrop() {
  if (!cropperRef.value || !canvasRef.value) return;
  
  showCropper.value = false;
  isRendering.value = true;
  
  try {
    const result = cropperRef.value.getResult();
    const canvas = result.canvas;
    
    if (!canvas) {
      throw new Error('无法获取裁切结果');
    }

    // Create a new canvas with cup dimensions
    const outputCanvas = canvasRef.value;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('当前浏览器不支持 Canvas');
    }

    outputCanvas.width = CUP_WIDTH;
    outputCanvas.height = CUP_HEIGHT;
    
    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CUP_WIDTH, CUP_HEIGHT);
    
    // Draw the cropped image
    ctx.drawImage(canvas, 0, 0, CUP_WIDTH, CUP_HEIGHT);

    // Apply tone mode
    if (toneMode.value !== 'original') {
      const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      switch (toneMode.value) {
        case 'binary':
          applyBinaryThreshold(imageData, binaryThreshold.value);
          break;
        case 'grayscale':
          applyGrayscale(imageData);
          break;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Export to blob
    let blob = await exportWithCompression(outputCanvas, MAX_UPLOAD_BYTES, forcePng.value);
    
    // Check size and compress if needed
    if (blob.size > MAX_UPLOAD_BYTES) {
      ElMessage.warning('图片超过200KB，正在自动压缩...');
      try {
        blob = await compressImage(blob, MAX_UPLOAD_BYTES);
        
        if (blob.size > MAX_UPLOAD_BYTES) {
          compressionHint.value = `压缩后仍超过 ${MAX_SIZE_KB}KB (${(blob.size / 1024).toFixed(1)}KB)。建议使用在线工具进一步压缩：https://tinypng.com/`;
          ElMessageBox.alert(
            compressionHint.value,
            '图片过大提示',
            {
              confirmButtonText: '我知道了',
              type: 'warning',
            }
          );
        } else {
          compressionHint.value = `已自动压缩至 ${(blob.size / 1024).toFixed(1)}KB`;
          ElMessage.success(compressionHint.value);
        }
      } catch (compressError) {
        console.error('Compression failed:', compressError);
        compressionHint.value = `自动压缩失败。图片大小：${(blob.size / 1024).toFixed(1)}KB，建议使用在线工具压缩：https://tinypng.com/`;
        ElMessageBox.alert(
          compressionHint.value,
          '压缩失败提示',
          {
            confirmButtonText: '我知道了',
            type: 'warning',
          }
        );
      }
    } else {
      compressionHint.value = '';
    }
    
    processedBlob.value = blob;
    uploadState.value = null;
  } catch (error) {
    const message = getErrorMessage(error, '处理失败');
    ElMessage.error(message);
  } finally {
    isRendering.value = false;
  }
}

function cancelCrop() {
  workingImage.value = null;
  cropperImageSrc.value = '';
  processedBlob.value = null;
}

function resetToEdit() {
  processedBlob.value = null;
}

function hasFilePayload(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

function handleDragEnter(event: DragEvent) {
  if (hasFilePayload(event)) {
    isDraggingFile.value = true;
  }
}

function handleDragOver(event: DragEvent) {
  if (!hasFilePayload(event)) {
    return;
  }
  event.dataTransfer!.dropEffect = 'copy';
  isDraggingFile.value = true;
}

function handleDragLeave(event: DragEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null;
  const related = event.relatedTarget as Node | null;
  if (!currentTarget || !related || !currentTarget.contains(related)) {
    isDraggingFile.value = false;
  }
}

async function handleDrop(event: DragEvent) {
  if (!hasFilePayload(event)) {
    isDraggingFile.value = false;
    return;
  }
  isDraggingFile.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) {
    await handleFile(files[0]);
  }
}

function applyGrayscale(imageData: ImageData) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
}

function applyBinaryThreshold(imageData: ImageData, threshold = 170) {
  const limit = Math.max(0, Math.min(255, Math.round(threshold)));
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const value = gray >= limit ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = value;
  }
}

async function exportWithCompression(canvas: HTMLCanvasElement, maxBytes: number, preferPng: boolean): Promise<Blob> {
  const attempts: Array<{ type: string; quality?: number }> = preferPng
    ? [{ type: 'image/png' }]
    : [
        { type: 'image/png' },
        { type: 'image/jpeg', quality: 0.95 },
        { type: 'image/jpeg', quality: 0.9 },
        { type: 'image/jpeg', quality: 0.85 },
        { type: 'image/jpeg', quality: 0.8 },
        { type: 'image/jpeg', quality: 0.75 },
        { type: 'image/jpeg', quality: 0.7 },
        { type: 'image/jpeg', quality: 0.65 },
        { type: 'image/jpeg', quality: 0.6 },
        { type: 'image/jpeg', quality: 0.55 },
        { type: 'image/jpeg', quality: 0.5 },
      ];

  let candidate: Blob | null = null;
  for (const attempt of attempts) {
    const blob = await canvasToBlob(canvas, attempt.type, attempt.quality);
    if (!blob) continue;
    candidate = blob;
    if (blob.size <= maxBytes) return blob;
  }

  if (!candidate) {
    throw new Error('无法导出图片');
  }
  return candidate;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function renderPreview() {
  // This function is now replaced by applyCrop
  await applyCrop();
}

async function handleUpload() {
  if (!authToken.value || !user.value || !processedBlob.value) {
    ElMessage.error('请先登录并准备好图片');
    return;
  }
  isUploading.value = true;
  uploadState.value = null;
  try {
    const currentHash = await hashBlob(processedBlob.value);
    if (lastUploadHash.value && lastUploadHash.value === currentHash) {
      try {
        await ElMessageBox.confirm(
          '检测到你刚刚上传过相同的图片，是否继续？',
          '重复上传提醒',
          {
            confirmButtonText: '继续上传',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
      } catch {
        ElMessage.info('已取消重复上传');
        isUploading.value = false;
        return;
      }
    }

    await uploadCupSticker({
      token: authToken.value,
      userMainId: user.value.user_main_id,
      blob: processedBlob.value,
      filename: buildFilename(downloadName.value, processedBlob.value),
    });
    uploadState.value = { type: 'success', message: '上传成功 🎉' };
    lastUploadHash.value = currentHash;
    ElMessage.success('杯贴上传成功');
  } catch (error) {
    const message = getErrorMessage(error, '上传失败');
    const details = isAxiosError(error) ? formatServerPayload(error.response?.data) : null;
    const nextState: UploadState = { type: 'error', message };
    if (details) {
      nextState.details = details;
      console.error('HeyTea upload failed:', details);
    }
    uploadState.value = nextState;
    ElMessage.error(message);
  } finally {
    isUploading.value = false;
  }
}

function handleDownload() {
  if (!processedBlob.value) return;
  const link = document.createElement('a');
  const url = URL.createObjectURL(processedBlob.value);
  link.href = url;
  link.download = buildFilename(downloadName.value, processedBlob.value);
  link.click();
  URL.revokeObjectURL(url);
}

watch([toneMode, binaryThreshold, forcePng], () => {
  if (hasPreview.value && workingImage.value) {
    applyCrop();
  }
});

watch(rememberMe, (next) => {
  if (!next) {
    localStorage.removeItem(STORAGE_KEY);
  } else if (authToken.value) {
    localStorage.setItem(STORAGE_KEY, authToken.value);
  }
});

if (authToken.value) {
  manualToken.value = authToken.value;
  resolveUserProfile();
}

onUnmounted(() => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
  }
});

function buildFilename(base: string, blob?: Blob | null) {
  const cleanBase = base ? base.replace(/\.[^.]+$/, '') : 'cup';
  const ext = blob?.type === 'image/jpeg' ? '.jpg' : '.png';
  return `${cleanBase}${ext}`;
}

async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const subtle = await getSubtleCrypto();
  const digest = await subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

let cachedSubtle: SubtleCrypto | null = null;
async function getSubtleCrypto(): Promise<SubtleCrypto> {
  if (cachedSubtle) {
    return cachedSubtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    cachedSubtle = globalThis.crypto.subtle;
    return cachedSubtle;
  }
  const nodeCrypto = await import('crypto');
  cachedSubtle = nodeCrypto.webcrypto.subtle;
  return cachedSubtle;
}
</script>

<style scoped>
.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.custom-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  color: #374151;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #111827;
  font-weight: 600;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #111827;
  height: 2px;
}

.cropper-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem;
}

.cropper-dialog :deep(.el-dialog__body) {
  padding: 1.5rem;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.cropper-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #e5e7eb;
  padding: 1.25rem;
}

.cropper-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cropper-container {
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 350px);
  margin: 0 auto;
  aspect-ratio: 596 / 832;
  border: 3px solid #374151;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f9fafb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.cropper {
  height: 100%;
  background: #f3f4f6;
}

:deep(.vue-advanced-cropper__background),
:deep(.vue-advanced-cropper__foreground) {
  background: #ffffff;
}

:deep(.vue-advanced-cropper__stretcher) {
  background: transparent;
}

:deep(.vue-line-wrapper) {
  border: 2px dashed #6b7280 !important;
}

:deep(.vue-handler) {
  background: #374151 !important;
  border: 2px solid #ffffff !important;
  width: 14px !important;
  height: 14px !important;
}
</style>