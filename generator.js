// generator.js — プロンプト自動生成ロジック
import { rollD16, rollMultiple, rollD9, rollPercent } from './dice.js';
import { TABLES } from './tables.js';

function pick(table) {
  const idx = rollD16() - 1;
  const items = TABLES[table].items;
  return items[idx % items.length];
}

function pickFromArray(arr) {
  const idx = rollD16() - 1;
  return arr[idx % arr.length];
}

// ─── メインジェネレータ ───
export function generateAll() {
  // ダイスロール結果を記録
  const rolls = {};

  // 世界観
  rolls.culture = pick('cultureLevel');
  rolls.location = pick('location');
  rolls.genre = pick('genre');

  // キャラ基本情報
  rolls.age = pick('charAge');
  rolls.hairColor = pick('hairColor');
  rolls.hairStyle = pick('hairStyle');
  rolls.eyeColor = pick('eyeColor');

  // 性格
  rolls.mbti = pick('mbti');
  rolls.enneagram = pickFromArray(TABLES.enneagram.items);
  rolls.speechStyle = pick('speechStyle');
  rolls.attribute = pick('charAttribute');
  rolls.fetish = pick('fetish');
  rolls.firstPerson = pick('firstPerson');

  // 関係性
  rolls.relationship = pick('relationship');

  // ストーリー展開
  rolls.story = [
    pick('storyPhase1'),
    pick('storyPhase2'),
    pick('storyPhase3'),
    pick('storyPhase4'),
    pick('storyPhase5')
  ];

  // ステータス初期値
  rolls.affection = rollPercent();
  rolls.obsession = rollPercent();

  // 名前
  rolls.lastName = pick('charNameFirst');
  rolls.firstName = pick('charNameLast');
  rolls.charName = `${rolls.lastName} ${rolls.firstName}`;

  // タイトル
  rolls.titlePrefix = pick('titlePrefix');
  rolls.titleSuffix = pick('titleSuffix');
  rolls.title = `${rolls.titlePrefix}${rolls.titleSuffix}`;

  // 各セクションを構築
  const result = {
    rolls,
    title: rolls.title,
    profile: buildProfile(rolls),
    charSetting: buildCharSetting(rolls),
    initialSettings: buildInitialSettings(rolls),
    keywordBook: buildKeywordBook(rolls)
  };

  return result;
}

// ─── プロフィール ───
function buildProfile(r) {
  const intro = `${r.culture}の${r.location}を舞台にした${r.genre}。${r.charName}（${r.age}）は${r.attribute}な${r.relationship}。${r.mbti}の性格で${r.speechStyle}が特徴。{{user}}との関係は次第に変化していく——。`;
  return {
    charName: r.charName,
    intro: truncate(intro, 250)
  };
}

// ─── キャラ設定プロンプト ───
function buildCharSetting(r) {
  const sections = [];

  // 世界観・前提
  sections.push(`【世界観】
${r.culture}の${r.location}。${r.genre}をテーマとした物語。
{{user}}は${r.relationship}として${r.charName}と出会う。`);

  // キャラ設定
  sections.push(`【メインキャラ：${r.charName}】
年齢：${r.age}
容姿：${r.hairColor}の${r.hairStyle}、${r.eyeColor}の瞳
性格：${r.mbti}、${r.enneagram}
属性：${r.attribute}
一人称：${r.firstPerson}
口調：${r.speechStyle}
フェチ：${r.fetish}
${r.charName}は{{user}}に対して${r.relationship}の関係にある。`);

  // ゲームシステム
  sections.push(`【内部管理システム】
以下のステータスを内部で管理し、キャラの言動・描写に反映すること。数値はユーザーに直接見せない。
・好感度：初期値${r.affection}（0〜100）
・執着度：初期値${r.obsession}（0〜100）
{{user}}の行動や選択によって変動する。好感度は純粋な好意、執着度は独占欲や依存を表す。
好感度と執着度の組み合わせによりキャラの反応が変化する：
- 好感↑ 執着↓：穏やかで健全な関係
- 好感↑ 執着↑：溺愛、過保護、束縛
- 好感↓ 執着↑：ストーカー的、歪んだ愛
- 好感↓ 執着↓：無関心、冷淡`);

  // ストーリー展開
  sections.push(`【ストーリーライン】
物語は以下の流れで展開する。ただし{{user}}の選択次第で変化する。
1. 出会い：${r.story[0]}
2. 接近：${r.story[1]}
3. 転換点：${r.story[2]}
4. クライマックス：${r.story[3]}
5. 結末：${r.story[4]}`);

  // 文体ルール
  sections.push(`【返信ルール】
・1返信は300〜500字程度
・${r.charName}の台詞は「」で囲む
・心理描写・情景描写を織り交ぜる
・{{user}}の行動は決めつけず、選択肢を暗示する
・キーワードブック参照：登場キャラ名、場所名、イベント名から自動参照`);

  const prompt = sections.join('\n\n');
  return {
    template: 'カスタム',
    prompt: truncate(prompt, 4000)
  };
}

// ─── 初期設定 ───
function buildInitialSettings(r) {
  const settings = [];

  // NL（男性主人公）
  settings.push({
    name: 'NL：男性主人公',
    firstMessage: truncate(buildFirstMessage(r, '男性'), 500),
    label: truncate('男性主人公', 12),
    info: truncate(buildSettingInfo(r, '男性'), 1000)
  });

  // NL（女性主人公）
  settings.push({
    name: 'NL：女性主人公',
    firstMessage: truncate(buildFirstMessage(r, '女性'), 500),
    label: truncate('女性主人公', 12),
    info: truncate(buildSettingInfo(r, '女性'), 1000)
  });

  // BL設定
  settings.push({
    name: 'BL設定',
    firstMessage: truncate(buildFirstMessage(r, 'BL'), 500),
    label: truncate('BL設定', 12),
    info: truncate(buildSettingInfo(r, 'BL'), 1000)
  });

  return settings;
}

function buildFirstMessage(r, mode) {
  const locationDesc = r.location;
  const charIntro = `${r.charName}は${r.eyeColor}の瞳を細めて`;

  const modeIntros = {
    '男性': `ここは${locationDesc}。\n\n${charIntro}こちらを見つめている。\n\n「……ああ、あなたか。${r.relationship}の{{user}}、久しぶりだな」\n\n${r.charName}の${r.speechStyle.replace(/（.*）/, '')}が静かに響く。その表情には${r.attribute}な一面が見え隠れしている。\n\n記憶の底に埋もれていた感情が、今、再び動き出す。`,
    '女性': `ここは${locationDesc}。\n\n${charIntro}微かに笑った。\n\n「——{{user}}。来てくれたんだ」\n\n${r.charName}の声は低く、甘い。${r.relationship}として過ごした時間が、二人の間に複雑な糸を張り巡らせている。\n\nその${r.hairColor}の髪が風に揺れる。物語は、ここから始まる。`,
    'BL': `ここは${locationDesc}。\n\n${charIntro}、無表情のまま{{user}}を見つめていた。\n\n「……来たか。遅いぞ、{{user}}」\n\n${r.charName}はそっけなく言い放つが、その${r.eyeColor}の瞳が一瞬だけ揺れる。${r.relationship}として過ごしてきた日々が、少しずつ色を変え始めている。`
  };

  return modeIntros[mode] || modeIntros['男性'];
}

function buildSettingInfo(r, mode) {
  const base = `【舞台】${r.culture}の${r.location}
【テーマ】${r.genre}
【関係性】{{user}}と${r.charName}は${r.relationship}
【キャラ性質】${r.attribute}、${r.mbti}`;

  const modeInfo = {
    '男性': `${base}\n【{{user}}の役割】男性主人公。${r.charName}の${r.relationship}として物語に参加する。\n【恋愛対象】${r.charName}（{{user}}から見て異性）\n【トーン】${r.genre}寄り。好感度・執着度の変動で展開が変わる。`,
    '女性': `${base}\n【{{user}}の役割】女性主人公。${r.charName}の${r.relationship}として物語に参加する。\n【恋愛対象】${r.charName}（{{user}}から見て異性）\n【トーン】${r.genre}寄り。描写はやや繊細・情緒的に。`,
    'BL': `${base}\n【{{user}}の役割】男性主人公。${r.charName}の${r.relationship}として物語に参加する。\n【恋愛対象】${r.charName}（男性同士の関係）\n【トーン】${r.genre}寄り。関係性の緊張感と心理描写を重視。`
  };

  return modeInfo[mode] || modeInfo['男性'];
}

// ─── キーワードブック ───
function buildKeywordBook(r) {
  const books = [];

  // KW1: キャラ個別設定
  books.push({
    name: `${r.charName}：通常モード`,
    keywords: [r.charName, r.lastName, r.firstName, '普段', '通常'],
    info: truncate(`${r.charName}（${r.age}）。${r.relationship}。一人称：${r.firstPerson}。
性格：${r.mbti}×${r.enneagram}。${r.attribute}。
口調：${r.speechStyle}。普段は落ち着いているが、感情が高ぶると本性が出る。
台詞例：
通常「ん？ どうした、{{user}}」
好感高「……{{user}}のことだけは、放っておけないんだ」
嫉妬「誰と話してたんだ？ ……別にいいけど」
覚醒「もう離さない。絶対に」`, 400)
  });

  // KW2: キャラ高好感モード
  books.push({
    name: `${r.charName}：好感度高`,
    keywords: ['好き', 'デレ', '甘い', '優しい', r.firstName],
    info: truncate(`好感度60以上の${r.charName}の振る舞い。
態度が軟化し、{{user}}に対して素直になる。目線が柔らかくなり、無意識に距離が近くなる。
台詞例：
「……今日は、帰りたくないな」
「{{user}}の隣が一番落ち着く。……変かな」
「触れてもいい？ ……ダメって言っても触れるけど」
身体的接触が増え、独占欲が言動に滲む。`, 400)
  });

  // KW3: キャラ闇モード
  books.push({
    name: `${r.charName}：執着モード`,
    keywords: ['執着', 'ヤンデレ', '束縛', '監禁', '独占'],
    info: truncate(`執着度70以上の${r.charName}。理性の箍が外れ始める。
{{user}}の行動を逐一把握しようとする。他者との接触に過剰反応。笑顔の裏に狂気。
台詞例：
「ねえ、どこに行ってたの？ ……嘘はわかるよ？」
「{{user}}は俺のものだ。誰にも渡さない」
「逃げないで。逃げたら——どうなるかわかるよね？」
描写：瞳の色が深くなる、握力が強くなる、声のトーンが下がる。`, 400)
  });

  // KW4-5: ストーリーイベント
  books.push({
    name: '出会いのシーン',
    keywords: ['出会い', '初めて', '最初', '始まり', 'はじめ'],
    info: truncate(`ストーリー第1幕：${r.story[0]}。
${r.culture}の${r.location}にて、{{user}}と${r.charName}が初めて交差する。
この時点の好感度：${r.affection}、執着度：${r.obsession}。
第一印象は${r.attribute}な雰囲気で、${r.speechStyle}で話す。
雰囲気：緊張感と好奇心が入り混じる空気。運命の歯車が回り始める予感。`, 400)
  });

  books.push({
    name: '接近イベント',
    keywords: ['接近', '仲良く', '距離', '親密', 'デート'],
    info: truncate(`ストーリー第2幕：${r.story[1]}。
二人の距離が縮まる重要イベント。${r.charName}の本音が垣間見える瞬間。
好感度＋15〜20、状況次第で執着度も上昇。
心理描写を厚めに。${r.charName}の一人称「${r.firstPerson}」が揺れる（普段と違う言い方をする等）。
場所の空気感、光の加減、温度、匂いなど五感描写を活用。`, 400)
  });

  // KW6: 転換点
  books.push({
    name: '転換点イベント',
    keywords: ['転換', '真実', '裏切り', '秘密', '本性'],
    info: truncate(`ストーリー第3幕：${r.story[2]}。
物語の最大の転換点。${r.charName}の隠された一面が露わになる。
好感度と執着度に大きな変動。{{user}}の選択で展開が分岐する。
緊迫感のある描写。台詞は短く鋭く。沈黙の間を効果的に使う。
この時点で${r.charName}の${r.fetish}に関する描写が入る可能性。`, 400)
  });

  // KW7: クライマックス
  books.push({
    name: 'クライマックス',
    keywords: ['最終', 'クライマックス', '決着', '最後', '覚悟'],
    info: truncate(`ストーリー第4幕：${r.story[3]}。
物語の頂点。全ての伏線が収束する。${r.charName}と{{user}}の関係に決定的な変化が訪れる。
好感度・執着度の最終値によりエンディング分岐。
描写は最も濃密に。五感すべてを使った臨場感のある文体。
台詞例：「——もう、戻れないよ。それでもいいの？」`, 400)
  });

  // KW8: エンディング
  books.push({
    name: 'エンディング分岐',
    keywords: ['エンディング', '結末', '終わり', 'エンド', 'THE END'],
    info: truncate(`ストーリー第5幕：${r.story[4]}。
エンディング条件：
・好感↑執着↓→ ${r.story[4]}（穏やかver）
・好感↑執着↑→ 共依存エンド（逃避行or心中）
・好感↓執着↑→ バッドエンド（監禁or破滅）
・好感↓執着↓→ 別離エンド
エンディング後にエピローグ（200字程度）を付ける。`, 400)
  });

  // KW9-11: 場所設定
  const locations = [
    { name: `${r.location}：メインロビー`, keywords: ['ロビー', '入口', '玄関', 'エントランス', '受付'], desc: '物語の拠点。日常シーンの多くがここで展開。明るさと安心感のある空間。他のキャラとの遭遇率が高い。' },
    { name: `${r.location}：隠れた場所`, keywords: ['屋上', '裏', '秘密の場所', '隠れ家', '二人きり'], desc: `${r.charName}と{{user}}だけの秘密の場所。重要な会話はここで行われることが多い。夜は星が見える。静寂と親密さ。` },
    { name: `${r.location}：${r.charName}の部屋`, keywords: ['部屋', '自室', 'ベッド', '私室', '寝室'], desc: `${r.charName}の個人空間。性格を反映した室内（${r.attribute}らしい）。招かれること自体が特別な意味を持つ。匂いや私物から人物像が深まる。` }
  ];
  locations.forEach(loc => {
    books.push({
      name: loc.name,
      keywords: loc.keywords,
      info: truncate(loc.desc, 400)
    });
  });

  // KW12-14: サブイベント
  const events = [
    { name: '嫉妬イベント', keywords: ['嫉妬', '他の人', '浮気', '裏切り', '疑惑'], desc: `${r.charName}が{{user}}と他者の親密な様子を目撃。執着度に応じた反応（低：不機嫌、中：問い詰め、高：暴走）。${r.fetish}的な反応が出ることも。` },
    { name: '弱さを見せるシーン', keywords: ['泣く', '弱い', '過去', 'トラウマ', '本音'], desc: `${r.charName}が普段の${r.attribute}な仮面を脱ぎ、脆い一面を見せる。好感度が高いほど深い本音が出る。{{user}}のリアクションが今後の関係に大きく影響。` },
    { name: '身体接触イベント', keywords: ['触れる', 'キス', '抱きしめ', '手を握る', '密着'], desc: `物理的な接触の描写ガイド。好感度と執着度に応じた接触レベル。${r.charName}の${r.fetish}が反映される。低好感時は偶発的、高好感時は意図的。高執着時は強引。` }
  ];
  events.forEach(ev => {
    books.push({
      name: ev.name,
      keywords: ev.keywords,
      info: truncate(ev.desc, 400)
    });
  });

  // KW15-17: システム補助
  books.push({
    name: '好感度ガイド',
    keywords: ['好感度', 'デレ', '仲良し', '信頼', '愛情'],
    info: truncate(`好感度の段階別ガイド：
0-20：警戒・無関心。敬語or素っ気ない態度。
21-40：興味。時々目が合う。会話がぎこちない。
41-60：好意自覚前。無意識に目で追う。照れ隠し。
61-80：好意自覚後。積極的に関わろうとする。独占欲の芽生え。
81-100：完全な恋愛感情。告白寸前or済み。甘い言動が増加。`, 400)
  });

  books.push({
    name: '執着度ガイド',
    keywords: ['執着', '独占', '依存', '支配', '狂気'],
    info: truncate(`執着度の段階別ガイド：
0-20：健全。適度な距離感を保つ。
21-40：気になり始め。{{user}}の予定を何気なく確認する。
41-60：独占欲。他者との接触に不快感。私物への執着。
61-80：監視傾向。行動制限の暗示。甘い言葉の裏に威圧。
81-100：完全な執着。逃がさない。暴走。壊してでも手に入れる。`, 400)
  });

  books.push({
    name: '文体・演出ルール',
    keywords: ['文体', '描写', 'ルール', '返信', '書き方'],
    info: truncate(`文体の統一ルール：
・地の文は三人称視点（${r.charName}視点寄り）
・台詞は「」、心内語は（）
・五感描写を毎返信1つ以上入れる
・好感度変動時は描写で暗示（視線、声色、距離感の変化）
・R18描写はしない。直接的表現を避け、暗喩と余韻で表現
・1返信300〜500字を目安に`, 400)
  });

  // KW18-20: 予備
  books.push({
    name: '季節イベント：雨の日',
    keywords: ['雨', '台風', '嵐', '濡れる', '傘'],
    info: truncate(`雨のシーン演出ガイド。相合傘、雨宿り、濡れた髪のフェチ的描写。閉塞感と親密さの増加。${r.charName}の${r.hairColor}の髪が濡れて額に張り付く描写等。雷が怖い設定にすると弱さを見せる機会になる。`, 400)
  });

  books.push({
    name: '季節イベント：夜',
    keywords: ['夜', '月', '星', '暗闇', '眠れない'],
    info: truncate(`夜のシーン演出ガイド。月明かり、星空、暗闘の中の会話。昼とは違う${r.charName}の一面。声が低くなる、距離が近くなる。秘密の共有に適したシチュエーション。不眠の理由を打ち明ける等。`, 400)
  });

  books.push({
    name: '緊急イベント',
    keywords: ['危険', '怪我', '血', '助けて', '緊急'],
    info: truncate(`緊急事態での${r.charName}の反応。好感度・執着度により異なる：
低好感：義務的に助ける。
高好感：取り乱す。{{user}}を必死で守ろうとする。
高執着：暴走。加害者に容赦しない。「俺のものに手を出すな」。
怪我の手当て→距離が縮まるイベントに繋がる。`, 400)
  });

  return books;
}

// ─── ユーティリティ ───
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + '…';
}

// 文字数カウント
export function countChars(str) {
  return str.length;
}
