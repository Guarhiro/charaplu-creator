// gemini.js — Gemini API クライアント

const STORAGE_KEY = 'charaplu_gemini_api_key';
const MODEL_STORAGE_KEY = 'charaplu_gemini_model';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash（推奨・高速）' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro（高精度）' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite（最速・低コスト）' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash（最新・高速）' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview（最新フラッグシップ）' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite（最新・最速）' },
];

const DEFAULT_MODEL = 'gemini-2.5-flash';

function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function setApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function hasApiKey() {
  return !!getApiKey();
}

function getModel() {
  return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
}

function setModel(model) {
  localStorage.setItem(MODEL_STORAGE_KEY, model);
}

async function callGemini(systemPrompt, userPrompt) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。⚙️ボタンから設定してください。');
  }

  const model = getModel();
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 4096,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `API Error: ${response.status}`;
    if (response.status === 400) throw new Error('APIキーが無効か、選択したモデルが利用できません。設定を確認してください。');
    if (response.status === 404) throw new Error(`モデル「${model}」が見つかりません。別のモデルを選択してください。`);
    if (response.status === 429) throw new Error('API利用制限に達しました。しばらく待ってから再試行してください。');
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('AIからの応答が空でした。もう一度お試しください。');
  return text;
}
