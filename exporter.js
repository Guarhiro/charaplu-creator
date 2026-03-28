// exporter.js — Markdown出力・ダウンロード
import { countChars } from './generator.js';

export function generateMarkdown(data) {
  const lines = [];

  lines.push(`# 【${data.title}】─ キャラぷ入力データ一式`);
  lines.push('');

  // プロフィール
  lines.push('## プロフィール');
  lines.push(`### キャラ名（${countChars(data.profile.charName)}字）`);
  lines.push(data.profile.charName);
  lines.push('');
  lines.push(`### キャラ紹介文（${countChars(data.profile.intro)}字 / 250字以内）`);
  lines.push(data.profile.intro);
  lines.push('');

  // キャラ設定
  lines.push('## キャラ設定');
  lines.push('### テンプレート');
  lines.push(data.charSetting.template);
  lines.push('');
  lines.push(`### プロンプト（${countChars(data.charSetting.prompt)}字 / 4000字以内）`);
  lines.push(data.charSetting.prompt);
  lines.push('');

  // 初期設定
  data.initialSettings.forEach((setting, i) => {
    lines.push(`## 初期設定${i + 1}：${setting.name}`);
    lines.push(`### 最初の一言（${countChars(setting.firstMessage)}字 / 500字以内）`);
    lines.push(setting.firstMessage);
    lines.push('');
    lines.push(`### 初期設定の名称（${countChars(setting.label)}字 / 12字以内）`);
    lines.push(setting.label);
    lines.push('');
    lines.push(`### 初期設定の情報（${countChars(setting.info)}字 / 1000字以内）`);
    lines.push(setting.info);
    lines.push('');
  });

  // キーワードブック
  lines.push('## キーワードブック（20枠）');
  lines.push('');
  data.keywordBook.forEach((kw, i) => {
    lines.push(`### KW${i + 1}：${kw.name}`);
    lines.push(`【キーワード】${kw.keywords.join(', ')}`);
    lines.push(`【情報（${countChars(kw.info)}字 / 400字以内）】`);
    lines.push(kw.info);
    lines.push('');
  });

  return lines.join('\n');
}

export function downloadMarkdown(data) {
  const md = generateMarkdown(data);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title}_キャラぷデータ.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 文字数バリデーション結果を返す
export function validateCharCounts(data) {
  const results = [];

  results.push({ field: 'キャラ名', count: countChars(data.profile.charName), limit: 30, ok: countChars(data.profile.charName) <= 30 });
  results.push({ field: 'キャラ紹介文', count: countChars(data.profile.intro), limit: 250, ok: countChars(data.profile.intro) <= 250 });
  results.push({ field: 'プロンプト', count: countChars(data.charSetting.prompt), limit: 4000, ok: countChars(data.charSetting.prompt) <= 4000 });

  data.initialSettings.forEach((s, i) => {
    results.push({ field: `初期設定${i+1}：最初の一言`, count: countChars(s.firstMessage), limit: 500, ok: countChars(s.firstMessage) <= 500 });
    results.push({ field: `初期設定${i+1}：名称`, count: countChars(s.label), limit: 12, ok: countChars(s.label) <= 12 });
    results.push({ field: `初期設定${i+1}：情報`, count: countChars(s.info), limit: 1000, ok: countChars(s.info) <= 1000 });
  });

  data.keywordBook.forEach((kw, i) => {
    results.push({ field: `KW${i+1}：情報`, count: countChars(kw.info), limit: 400, ok: countChars(kw.info) <= 400 });
  });

  return results;
}
