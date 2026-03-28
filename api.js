// api.js — 統合APIルーター (Gemini & Anthropic)

const ANTHROPIC_MODELS = [
  { id: 'claude-4.6-opus-latest', name: 'Claude 4.6 Opus（最新・最高精度）' },
  { id: 'claude-4.6-sonnet-latest', name: 'Claude 4.6 Sonnet（推奨・高性能）' },
  { id: 'claude-4.5-haiku-latest', name: 'Claude 4.5 Haiku（高速・低コスト）' }
];

const ALL_MODELS_DATA = {
  gemini: AVAILABLE_MODELS, // gemini.jsで定義済み
  anthropic: ANTHROPIC_MODELS
};

// 結合したモデル一覧を返すユーティリティ
function getAllModels() {
  return [...ALL_MODELS_DATA.gemini, ...ALL_MODELS_DATA.anthropic];
}

async function callAI(systemPrompt, userPrompt) {
  const modelId = getModel(); // gemini.jsで定義されている現在の選択モデル取得関数を利用

  // モデルIDのプレフィックスでAPIを振り分け
  if (modelId.startsWith('claude')) {
    return await callAnthropic(systemPrompt, userPrompt, modelId);
  } else {
    // デフォルト・Gemini
    return await callGemini(systemPrompt, userPrompt);
  }
}
