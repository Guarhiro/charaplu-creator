// dice.js — D16 / D64 ダイスエンジン

export function rollD16() {
  return Math.floor(Math.random() * 16);
}

export function rollD64() {
  return Math.floor(Math.random() * 64);
}

// エニアグラム用（1〜9）
export function rollD9() {
  return Math.floor(Math.random() * 9);
}

// ステータス（好感度・執着度）用 → 0〜100のパーセント
export function rollPercent() {
  return Math.floor(Math.random() * 101);
}
