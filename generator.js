// generator.js — プロンプト自動生成ロジック
import { rollD16, rollD64, rollD9, rollPercent } from './dice.js';
import { TABLES } from './tables.js';

function pick(table) {
  const t = TABLES[table];
  const dice = t.dice || 16;
  const idx = (dice === 64 ? rollD64() : dice === 9 ? rollD9() : rollD16());
  return t.items[idx % t.items.length];
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
  rolls.chatClass = pick('chatClass');

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
  sections.push(`【内部ステータス（参考値）】
・好感度：初期値${r.affection}（0〜100）
・執着度：初期値${r.obsession}（0〜100）
{{user}}の行動によって変動する。好感度は純粋な好意、執着度は独占欲や依存を表す。
- 好感↑ 執着↓：穏やかで健全な関係
- 好感↑ 執着↑：溺愛、過保護、束縛
- 好感↓ 執着↑：ストーカー的、歪んだ愛
- 好感↓ 執着↓：無関心、冷淡`);

  // チャット分類とステータス表示
  sections.push(`【チャット分類と毎ターンのステータス表示】
ゲームジャンル：${r.chatClass.type}
（${r.chatClass.desc}）

【重要: ステータスの出力】
このチャットシステム自体には変数を記憶する内部機能がありません。そのため、AIは**毎回の返信の一番最後に、必ず現在のステータスをフォーマット出力**して状態を維持する必要があります。

表示するステータス項目は、好感度や執着度に限らず、AIがジャンル「${r.chatClass.type}」やキャラの状況に合わせて最適な項目（例：機嫌、疲労度、警戒心、信頼度など）を毎回2〜3個選び、表現してください。

【ステータス出力フォーマット例】
\`\`\`
【現在地】〇〇
【時間帯】〇〇
【ステータス】ステータスA(表示値) / ステータスB(表示値)
\`\`\`

※物語の展開に応じてステータスを的確に変動させること。`);

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

  // NPC生成ヘルパー
  function genNPC() {
    return {
      name: `${pick('npcNameFirst')} ${pick('npcNameLast')}`,
      role: pick('npcRole'),
      personality: pick('npcPersonality')
    };
  }
  const npc1 = genNPC();
  const npc2 = genNPC();
  const npc3 = genNPC();
  const hiddenLore1 = pick('hiddenBackstory');
  const hiddenLore2 = pick('hiddenBackstory');
  const sideEv1 = pick('sideEvent');
  const sideEv2 = pick('sideEvent');
  const sideEv3 = pick('sideEvent');

  // KW1: キャラ基本（通常モード）
  books.push({
    name: `${r.charName}：通常モード`,
    keywords: [r.charName, r.lastName, r.firstName, '普段', '通常'],
    info: truncate(`${r.charName}（${r.age}）。${r.relationship}。一人称：${r.firstPerson}。
性格：${r.mbti}×${r.enneagram}。${r.attribute}。
口調：${r.speechStyle}。普段は落ち着いているが、感情が高ぶると本性が出る。
台詞例：
通常「ん？ どうした、{{user}}」
好感高「……{{user}}のことだけは、放っておけないんだ」
嫉妬「誰と話してたんだ？ ……別にいいけど」`, 400)
  });

  // KW2: 好感度高モード
  books.push({
    name: `${r.charName}：好感度高`,
    keywords: ['好き', 'デレ', '甘い', '優しい', r.firstName],
    info: truncate(`好感度60以上の${r.charName}。態度軟化、素直になる。目線が柔らかく、距離が近い。
台詞例：
「……今日は、帰りたくないな」
「{{user}}の隣が一番落ち着く」
「触れてもいい？ ……ダメって言っても触れるけど」
${r.fetish}に関する言動が自然に出始める。独占欲が滲む。`, 400)
  });

  // KW3: 執着・闇モード
  books.push({
    name: `${r.charName}：執着モード`,
    keywords: ['執着', 'ヤンデレ', '束縛', '監禁', '独占'],
    info: truncate(`執着度70以上。理性の箍が外れる。行動を把握、他者接触に過剰反応。笑顔の裏に狂気。
台詞例：
「ねえ、どこに行ってたの？ ……嘘はわかるよ？」
「{{user}}は${r.firstPerson}のものだ。誰にも渡さない」
「逃げたら——どうなるかわかるよね？」
描写：瞳が変化する、握力増、声トーン低下。${npc1.name}を排除しようとする。`, 400)
  });

  // KW4: 裏設定①（メインキャラの秘密）
  books.push({
    name: `${r.charName}の秘密`,
    keywords: ['秘密', '裏', '隠す', '真実', '過去'],
    info: truncate(`${r.charName}が隠している最大の秘密：${hiddenLore1}。
この秘密はストーリー第3幕（転換点）で露呈する可能性が高い。
好感度が高い状態で発覚→信頼は揺らぐが受け入れるルート。
好感度が低い状態で発覚→決定的な亀裂が生じる。
{{user}}がこの真実にどう反応するかで結末が大きく変わる。
ヒント：${r.location}内のある場所に手がかりが隠されている。`, 400)
  });

  // KW5: 裏設定②（世界の秘密）
  books.push({
    name: '世界の裏設定',
    keywords: ['世界', '真相', '黒幕', '裏側', '秘密'],
    info: truncate(`この${r.culture}世界に隠された真実：${hiddenLore2}。
${r.location}が舞台となった本当の理由がここに絡む。
${r.genre}のジャンルの裏に、もう一つの物語が進行している。
この裏設定は${npc2.name}が鍵を握っている。
ストーリー第4幕以降で明らかになり、全てのフラグが回収される。`, 400)
  });

  // KW6: NPC① — キーパーソン
  books.push({
    name: `${npc1.name}（${npc1.role}）`,
    keywords: [npc1.name.split(' ')[0], npc1.name.split(' ')[1], npc1.role.split('（')[0], '仲間', '第三者'],
    info: truncate(`${npc1.name}——${npc1.role}。性格：${npc1.personality}。
${r.charName}との関係：古くからの知り合い。{{user}}に対しては中立〜友好的。
しかし裏では独自の思惑を持つ。${r.charName}の秘密の一端を知っている。
好感度ルートでは助力者に、執着ルートでは排除対象になる。
台詞例：「あの人のこと、本当に知ってる？ ……知らない方が幸せなこともあるよ」`, 400)
  });

  // KW7: NPC② — 敵対or波乱要因
  books.push({
    name: `${npc2.name}（${npc2.role}）`,
    keywords: [npc2.name.split(' ')[0], npc2.name.split(' ')[1], npc2.role.split('（')[0], '敵', '障害'],
    info: truncate(`${npc2.name}——${npc2.role}。性格：${npc2.personality}。
${r.charName}にとって因縁の相手。{{user}}に近づこうとする。
${r.charName}との間に未解決の過去がある。ジャンル「${r.genre}」の核心に関わる人物。
登場タイミング：ストーリー第2幕後半〜第3幕。三角関係or対立構図を生む。
台詞例：「${r.charName}は優しい？ ……ふふ、あの人の本当の姿を知らないんだね」`, 400)
  });

  // KW8: NPC③ — サブキャラ（日常枠）
  books.push({
    name: `${npc3.name}（${npc3.role}）`,
    keywords: [npc3.name.split(' ')[0], npc3.name.split(' ')[1], npc3.role.split('（')[0], '日常', '相談'],
    info: truncate(`${npc3.name}——${npc3.role}。性格：${npc3.personality}。
{{user}}の身近な存在。恋愛相談や情報提供の役割。コミカルなシーンを担当。
${r.charName}に対して独自の評価を持つ（「あの人、ちょっと危なくない？」等）。
日常パートの会話相手として登場頻度高め。
台詞例：「え、また${r.charName}？ ……あんた完全にハマってるじゃん」`, 400)
  });

  // KW9-10: ストーリー展開（出会い〜接近）
  books.push({
    name: '出会い〜接近',
    keywords: ['出会い', '初めて', '接近', '始まり', '距離'],
    info: truncate(`第1幕「${r.story[0]}」→ 第2幕「${r.story[1]}」。
${r.culture}の${r.location}にて、{{user}}と${r.charName}が交差。好感度${r.affection}、執着度${r.obsession}からスタート。
${r.attribute}な第一印象。${r.speechStyle}で話す。
接近フェーズで${npc1.name}が介入、距離感に変化。
サイドイベント「${sideEv1}」が発生すると親密度が加速。`, 400)
  });

  books.push({
    name: '転換点〜クライマックス',
    keywords: ['転換', '真実', 'クライマックス', '最終', '覚悟'],
    info: truncate(`第3幕「${r.story[2]}」→ 第4幕「${r.story[3]}」。
${r.charName}の秘密「${hiddenLore1}」が露呈する瀬戸際。
${npc2.name}の暗躍が表面化。{{user}}に選択が迫られる。
${r.fetish}に関する決定的なシーンがここに配置される。
エンディング「${r.story[4]}」への分岐条件が確定する。`, 400)
  });

  // KW11: エンディング分岐
  books.push({
    name: 'エンディング分岐',
    keywords: ['エンディング', '結末', '終わり', 'エンド', 'THE END'],
    info: truncate(`最終幕：${r.story[4]}。
・好感↑執着↓→ 穏やか版。${npc1.name}が祝福。
・好感↑執着↑→ 共依存。二人だけの世界へ逃避。
・好感↓執着↑→ バッド。${r.charName}が暴走。${npc2.name}が介入するも——。
・好感↓執着↓→ 別離。${npc3.name}が慰める。
全てのNPCの結末もここで決まる。裏設定の回収を忘れずに。`, 400)
  });

  // KW12-14: サイドストーリー
  books.push({
    name: `サイドストーリー：${sideEv1}`,
    keywords: ['サイド', 'イベント', '日常', '特別', 'おまけ'],
    info: truncate(`サイドイベント「${sideEv1}」。
本編の息抜きかつ、キャラの新たな一面を見せるチャンス。
${r.charName}の${r.attribute}な面と、普段見せない表情のギャップ。
好感度+5〜10の変動あり。${r.fetish}に関する伏線を散りばめる。
${npc3.name}が巻き込まれてコミカル展開になることも。
場所：${r.location}内の予想外のスポットで発生。`, 400)
  });

  books.push({
    name: `サイドストーリー：${sideEv2}`,
    keywords: ['サイド', 'サブ', '番外', 'スピンオフ', '別視点'],
    info: truncate(`サイドイベント「${sideEv2}」。
${r.charName}の裏設定に間接的に触れるエピソード。
このイベントで${npc1.name}との関係が深まるor悪化する分岐点。
{{user}}の選択次第で、後の展開に影響する伏線が仕込まれる。
台詞例（${r.charName}）：「……こういう時間も、悪くないな」
場の雰囲気：${r.genre}のトーンを維持しつつ、緊張の緩和。`, 400)
  });

  books.push({
    name: `サイドストーリー：${sideEv3}`,
    keywords: ['秘密', '裏', '別ルート', '真相', 'もしも'],
    info: truncate(`サイドイベント「${sideEv3}」。
真相ルートへの隠し条件として機能するエピソード。
特定の選択をした場合のみ「${hiddenLore2}」の一端を知ることになる。
${npc2.name}の真の目的が垣間見える最初の兆候。
このイベントを見逃すとトゥルーエンドに辿り着けない。`, 400)
  });

  // KW15-16: 場所設定
  books.push({
    name: `${r.location}：拠点エリア`,
    keywords: ['拠点', '日常', 'ロビー', '表', '安全'],
    info: truncate(`物語の拠点。日常シーン多発。明るさと安心感。NPCとの遭遇率が高い。
${npc3.name}がよく出没する場所。${r.charName}との何気ない会話が好感度を左右。
掲示板・壁・飾りなどに世界の裏設定に関する手がかりが隠されている。
時間帯で雰囲気が変化（朝は活気、夜は人気がなくなり密会向き）。`, 400)
  });

  books.push({
    name: `${r.location}：禁域`,
    keywords: ['禁域', '裏', '禁止', '秘密の場所', '隠し部屋'],
    info: truncate(`${r.location}内の禁じられた場所。${r.charName}だけが知る隠し空間。
ストーリーの核心に関わるアイテムや証拠がここにある。
${npc2.name}もこの場所の存在を探っている。
高好感時に${r.charName}が{{user}}をここに連れてくる。
裏設定「${hiddenLore1}」の証拠がこの場所に眠る。`, 400)
  });

  // KW17-18: ステータスガイド
  books.push({
    name: '好感度ガイド',
    keywords: ['好感度', 'デレ', '仲良し', '信頼', '愛情'],
    info: truncate(`好感度ガイド：
0-20：警戒。敬語or素っ気ない態度。${npc1.name}経由でないと会話困難。
21-40：興味。目が合う。NPCへの態度と{{user}}への態度に差が出始める。
41-60：好意自覚前。無意識に目で追う。${r.fetish}的反応が微かに。
61-80：好意自覚。独占欲。${npc2.name}への態度が攻撃的に。
81-100：告白寸前。裏設定の自己開示が進む。`, 400)
  });

  books.push({
    name: '執着度ガイド',
    keywords: ['執着', '独占', '依存', '支配', '狂気'],
    info: truncate(`執着度ガイド：
0-20：健全。適度な距離感。
21-40：{{user}}の予定を何気なく確認。${npc3.name}に情報を聞く。
41-60：独占欲。他者接触に不快感。{{user}}の持ち物に異常に興味。
61-80：監視。行動制限の暗示。${npc1.name}を遠ざけようとする。
81-100：暴走。逃がさない。${npc2.name}と直接対決。壊してでも。`, 400)
  });

  // KW19: 文体ルール
  books.push({
    name: '文体・演出ルール',
    keywords: ['文体', '描写', 'ルール', '返信', '書き方'],
    info: truncate(`文体ルール：
・地の文は三人称（${r.charName}視点寄り）。NPC登場時は多視点可。
・台詞「」心内語（）。NPCの台詞も個性的に。
・五感描写を毎返信1つ以上。
・好感度変動を描写で暗示（視線、声色、距離感）。
・1返信300〜500字。サイドストーリー時はやや長めも可。
・裏設定の伏線は自然に、しかし確実に仕込む。`, 400)
  });

  // KW20: 隠しイベント
  books.push({
    name: '隠しイベント・真ルート条件',
    keywords: ['真ルート', 'トゥルー', '隠し', '条件', '分岐'],
    info: truncate(`トゥルーエンド到達条件（プレイヤーには明示しない）：
1. サイドイベント3つ中2つ以上を経験
2. ${npc1.name}と${npc2.name}両方の信頼を得る
3. 禁域を訪れ、裏設定の証拠を入手
4. 好感度60以上＋執着度40〜70の範囲を維持
5. 「${hiddenLore1}」を知った上で${r.charName}を受け入れる選択
条件未達成→ノーマルENDへ分岐。`, 400)
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
