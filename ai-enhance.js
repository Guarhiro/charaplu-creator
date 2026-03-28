// ai-enhance.js — AI強化ロジック（5機能）

// ── 1. プロンプト推敲 ──
async function enhancePrompt(data) {
  const sys = `あなたはGemini Gem「キャラぷ」のプロンプト設計の専門家です。
ダイスロールで生成された下書きプロンプトを、プロフェッショナル品質に推敲してください。
ルール：
- 日本語で3000字〜最大4000字程度まで情報を詳述し、大幅に拡張すること
- 文章が途中で切れないよう、必ず末尾まで完結させること
- 推敲後の文は基本的に「体言止め」を多用し、情報の密度を高めること
- {{user}}表記を維持
- 【】セクション構造を維持
- 好感度・執着度の内部管理システムを維持
- キーワードブック参照指示を含める
- より自然で魅力的な文体に改善
- ゲームシステムとしての設計を強化
- 出力はプロンプト本文のみ（説明不要）`;

  const user = `以下のダイスロール結果に基づくプロンプト下書きを推敲してください：

【ダイスロール結果】
キャラ名：${data.rolls.charName}
文化レベル：${data.rolls.culture}
舞台：${data.rolls.location}
ジャンル：${data.rolls.genre}
年齢：${data.rolls.age}
容姿：${data.rolls.hairColor}の${data.rolls.hairStyle}、${data.rolls.eyeColor}の瞳
MBTI：${data.rolls.mbti}
エニアグラム：${data.rolls.enneagram}
口調：${data.rolls.speechStyle}
属性：${data.rolls.attribute}
フェチ：${data.rolls.fetish}
関係性：${data.rolls.relationship}
一人称：${data.rolls.firstPerson}
好感度初期値：${data.rolls.affection}
執着度初期値：${data.rolls.obsession}
ストーリー展開：${data.rolls.story.join(' → ')}

【下書きプロンプト】
${data.charSetting.prompt}`;

  return await callAI(sys, user);
}

// ── 2. キーワードブック拡張 ──
async function enhanceKeywordBook(data, kwIndex) {
  const kw = data.keywordBook[kwIndex];
  const sys = `あなたはキャラぷのキーワードブック設計の専門家です。
キーワードブックのノート情報を最大限活用した濃密で長大な設定文に書き換えてください。
ルール：
- 日本語で限界まで長文で、克明に設定を描写すること
- 推敲後の文は基本的に「体言止め」を多用し、情報の密度を高めること
- {{user}}表記を維持
- 台詞例がある場合は口調の特徴が出るものに改善
- キャラの個性や場面の臨場感を最大化
- 出力は情報欄のテキストのみ（説明不要）`;

  const user = `以下のキーワードブックノートを強化してください：

【キャラ基本情報】
名前：${data.rolls.charName}（${data.rolls.age}）
属性：${data.rolls.attribute}
口調：${data.rolls.speechStyle}
一人称：${data.rolls.firstPerson}

【ノート名】${kw.name}
【キーワード】${kw.keywords.join(', ')}
【現在の情報】
${kw.info}`;

  return await callAI(sys, user);
}

// ── 3. 最初の一言強化 ──
async function enhanceFirstMessage(data, settingIndex) {
  const setting = data.initialSettings[settingIndex];
  const sys = `あなたはキャラぷの「最初の一言」を書くプロの小説家です。
チャット開始時のAIキャラの最初の発言を、臨場感あふれる長大な文章に書き換えてください。
ルール：
- 日本語で限界まで長文で、克明に情景を描写すること
- 推敲後の文は基本的に「体言止め」を多用し、情報の密度を高めること（台詞以外）
- {{user}}表記を維持（二重波括弧）
- キャラの台詞は「」で囲む
- 五感描写（視覚・聴覚・嗅覚・触覚・味覚）を織り交ぜる
- 読者を一瞬で物語に引き込む冒頭
- キャラの口調・性格を正確に反映
- 出力は「最初の一言」テキストのみ（説明不要）`;

  const user = `以下のキャラ設定に基づいて「最初の一言」を強化してください：

【キャラ情報】
名前：${data.rolls.charName}（${data.rolls.age}）
舞台：${data.rolls.culture}の${data.rolls.location}
ジャンル：${data.rolls.genre}
属性：${data.rolls.attribute}
口調：${data.rolls.speechStyle}
一人称：${data.rolls.firstPerson}
関係性：${data.rolls.relationship}
容姿：${data.rolls.hairColor}の${data.rolls.hairStyle}、${data.rolls.eyeColor}の瞳

【初期設定モード】${setting.name}

【現在の最初の一言】
${setting.firstMessage}`;

  return await callAI(sys, user);
}

// ── 4. キャラ深掘り ──
async function enhanceCharProfile(data) {
  const sys = `あなたはキャラぷのキャラクター設計の専門家です。
キャラの紹介文を、魅力的で読者を惹きつける長大な文章に書き換えてください。
ルール：
- 日本語で限界まで長文で、克明に描写すること
- 推敲後の文は基本的に「体言止め」を多用し、情報の密度を高めること
- {{user}}表記を維持
- 衝撃ワードやフック要素を含める（ランキング上位の傾向を意識）
- キャラの属性・関係性・ジャンルの魅力を凝縮
- 「距離感の近さ × 感情の重さ」を意識
- 出力は紹介文テキストのみ（説明不要）`;

  const user = `以下のキャラ情報から魅力的な紹介文を生成してください：

名前：${data.rolls.charName}（${data.rolls.age}）
舞台：${data.rolls.culture}の${data.rolls.location}
ジャンル：${data.rolls.genre}
属性：${data.rolls.attribute}
MBTI：${data.rolls.mbti}
口調：${data.rolls.speechStyle}
関係性：${data.rolls.relationship}
フェチ：${data.rolls.fetish}
好感度初期値：${data.rolls.affection}/100
執着度初期値：${data.rolls.obsession}/100
ストーリー：${data.rolls.story.join(' → ')}

【現在の紹介文】
${data.profile.intro}`;

  return await callAI(sys, user);
}

// ── 5. ランキング最適化 ──
async function optimizeForRanking(data) {
  const sys = `あなたはキャラぷのランキング最適化の専門家です。
タイトルと紹介文を、ランキング上位に入りやすいよう最適化してください。

キャラぷで人気が出やすい傾向（2026年3月時点）：
- ジャンル：恋愛・関係性もの約75%、ダーク/タブー系約20%
- キャラ属性：「距離感の近さ × 感情の重さ」が最大公約数
- タイトル：衝撃ワード（借金、NTR、触手、限界、禁欲、奪取等）を含むと上位
- リプレイ性のある仕組みを持つ作品が残りやすい

ルール：
- タイトルは30字以内（記号・絵文字不可）
- 紹介文は250字以内
- {{user}}表記を維持
- 出力形式：
タイトル：〇〇
紹介文：〇〇`;

  const user = `以下の作品を最適化してください：

【現在のタイトル】${data.title}
【キャラ名】${data.rolls.charName}
【ジャンル】${data.rolls.genre}
【属性】${data.rolls.attribute}
【関係性】${data.rolls.relationship}
【ストーリー】${data.rolls.story.join(' → ')}

【現在の紹介文】
${data.profile.intro}`;

  return await callAI(sys, user);
}

// ── 6. 立ち絵画像生成プロンプト ──
async function generateImagePrompt(data) {
  const sys = `あなたはAI画像生成のプロンプトエンジニアです。
キャラクターの立ち絵（全身 or 上半身）を生成するための、高品質な画像生成プロンプトを作成してください。

あなたの役割：
- ダイスロールで決まった基本容姿をベースに、世界観にマッチする服装・装飾品・小物をクリエイティブに追加する
- 文化レベル・舞台・ジャンルから最適な衣装デザインを判断する
- キャラの属性・性格から表情や立ちポーズを決める
- 画像生成AIが理解しやすい英語タグ＋自然言語のハイブリッド形式で出力する

出力形式（以下の3セクション全てを出力）：

【NovelAI / Stable Diffusion用】
masterpiece, best quality, ... （カンマ区切りのタグ形式）

【ネガティブプロンプト】
worst quality, low quality, ... （カンマ区切りのタグ形式）

【自然言語プロンプト（Gemini Imagen / DALL-E / Midjourney用）】
A detailed description of ... （英語の自然文）

ルール：
- 立ち絵として映える構図を意識（正面〜斜め向き、全身 or 膝上）
- 服装は世界観に完全マッチさせる（例：中世→甲冑や法衣、Sci-Fi→パワースーツやホロUI）
- アクセサリー・武器・小物を最低3つ追加する
- 髪型・髪色・瞳の色はダイスロール結果を正確に反映
- 表情はキャラの属性に合わせる（執着系→薄ら笑い、ツンデレ→そっぽ向き等）
- 背景は簡素または舞台を示唆する程度（立ち絵なので背景主張しすぎない）
- クオリティタグは必ず含める
- 性別は男性キャラとして生成する
- 各セクションは上記の【】見出しで区切る`;

  const user = `以下のキャラクターの立ち絵用画像生成プロンプトを作成してください。
服装・装飾品・小物はAIの判断でクリエイティブに追加してください。

【基本情報】
キャラ名：${data.rolls.charName}
年齢：${data.rolls.age}

【世界観】
文化レベル：${data.rolls.culture}
舞台：${data.rolls.location}
ジャンル：${data.rolls.genre}

【容姿】
髪色：${data.rolls.hairColor}
髪型：${data.rolls.hairStyle}
瞳の色：${data.rolls.eyeColor}

【性格・属性】
MBTI：${data.rolls.mbti}
エニアグラム：${data.rolls.enneagram}
属性：${data.rolls.attribute}
関係性：${data.rolls.relationship}
フェチ：${data.rolls.fetish}

【ストーリー背景】
${data.rolls.story.join(' → ')}`;

  return await callAI(sys, user);
}
