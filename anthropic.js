// anthropic.js — Anthropic(Claude) API クライアント

const ANTHROPIC_STORAGE_KEY = 'charaplu_anthropic_api_key';

function getAnthropicApiKey() {
  return localStorage.getItem(ANTHROPIC_STORAGE_KEY) || '';
}

function setAnthropicApiKey(key) {
  if (key) {
    localStorage.setItem(ANTHROPIC_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(ANTHROPIC_STORAGE_KEY);
  }
}

function hasAnthropicApiKey() {
  return !!getAnthropicApiKey();
}

async function callAnthropic(systemPrompt, userPrompt, modelValue) {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error('Anthropic APIキーが設定されていません。⚙️ボタンから設定してください。');
  }

  const url = 'https://api.anthropic.com/v1/messages';

  const body = {
    model: modelValue,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `Anthropic API Error: ${response.status}`;
    if (response.status === 400) throw new Error('APIリクエストが不正です。APIキーが無効か、モデルが存在しません。: ' + msg);
    if (response.status === 401 || response.status === 403) throw new Error('Anthropic APIキーが無効です。設定を確認してください。');
    if (response.status === 429) throw new Error('Anthropic API利用制限に達しました。時間をおいて再試行してください。');
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('AIからの応答が空でした。もう一度お試しください。');
  return text;
}
