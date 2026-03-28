// dice.js — 16面ダイスエンジン

export function rollD16() {
  return Math.floor(Math.random() * 16) + 1;
}

export function rollMultiple(n) {
  return Array.from({ length: n }, () => rollD16());
}

// 1-16 を 1-9 に変換（エニアグラム用）
export function rollD9() {
  return ((rollD16() - 1) % 9) + 1;
}

// 1-16 を 0-100 にマッピング
export function rollPercent() {
  return Math.round(((rollD16() - 1) / 15) * 100);
}
