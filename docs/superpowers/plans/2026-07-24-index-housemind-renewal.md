# index.html Housemind風リニューアル Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aidandaide.com のトップページ（index.html）に実写真4枚を追加し、配色をネイビー×ブルーに変更し、AI生成っぽいと指摘されたコピーを会話調に書き直す。

**Architecture:** 単一の静的HTMLファイル（index.html）内のCSS変数・HTML構造・テキストをEditツールで直接書き換える。画像は新規 `images/` ディレクトリにファイルとして配置し、これまでのbase64埋め込みは踏襲しない。テストはユニットテストではなく、grepによる変更確認とブラウザでの目視確認（chrome-devtools-mcp）で行う。

**Tech Stack:** 素のHTML/CSS（GitHub Pages配信）、curl（画像ダウンロード）、chrome-devtools-mcp（目視確認）

**参照spec:** `docs/superpowers/specs/2026-07-24-index-housemind-renewal-design.md`

---

## 前提知識（エンジニア向け）

- `index.html` は `C:\Users\aktfk\aidandaide` 直下にある単一ファイル。GitHub Pagesでそのまま配信される（ビルドステップなし）。
- **重要な罠**: `index.html` にはロゴ・チーム写真のbase64画像が埋め込まれており、Readツールで全文を読むとトークン上限に達する。全文を確認したい場合は、先に以下のコマンドで一時ファイルを作ってから読むこと。

```bash
SCRATCH="/c/Users/aktfk/AppData/Local/Temp/claude/C--Users-aktfk/d2435963-8f43-4a5e-b6e8-b720f79c3d61/scratchpad"
mkdir -p "$SCRATCH"
sed -E 's/(data:image\/[a-zA-Z]+;base64,)[A-Za-z0-9+\/=]{200,}/\1[TRUNCATED]/g' index.html > "$SCRATCH/index_clean.html"
```

このplanの各タスクは、Editツールの `old_string` に十分なコンテキストを含めているので、上記の一時ファイルを経由しなくてもそのままEditできる設計になっている。ただし変更前に該当箇所を目視確認したい場合は、Grepツールで対象文字列を検索すること（Readで全文は読まない）。

- リポジトリ運用：mainブランチに直接コミット・push（ユーザーの明示的な希望、`[[feedback_push_always]]`）。各タスックごとにコミット・pushする。
- 画像ライセンス：Unsplash License（商用利用可、帰属表示は任意）。

---

### Task 1: 画像素材の追加

**Files:**
- Create: `images/case-bar-owner.jpg`
- Create: `images/case-craftsman.jpg`
- Create: `images/case-cafe-owner.jpg`
- Create: `images/case-kitchen-car.jpg`

- [ ] **Step 1: imagesディレクトリを作成し、4枚をダウンロードする**

```bash
mkdir -p images
curl -L "https://images.unsplash.com/photo-1730297221520-edb32650e0ba?w=1200&auto=format&fit=crop&q=80" -o images/case-bar-owner.jpg
curl -L "https://images.unsplash.com/photo-1566453838084-7ec27e71b3ca?w=1200&auto=format&fit=crop&q=80" -o images/case-craftsman.jpg
curl -L "https://images.unsplash.com/photo-1749813387632-046a0a68c0fc?w=1200&auto=format&fit=crop&q=80" -o images/case-cafe-owner.jpg
curl -L "https://images.unsplash.com/photo-1704820505492-3713586e2bd1?w=1200&auto=format&fit=crop&q=80" -o images/case-kitchen-car.jpg
```

- [ ] **Step 2: ダウンロードできたか確認する**

Run: `ls -la images/`
Expected: 4ファイルとも数十KB〜数百KB程度のサイズがあること（0バイトや数百バイトならダウンロード失敗）。

Run: `file images/*.jpg`
Expected: 4ファイルすべて `JPEG image data` と表示されること。もし `HTML document` 等と表示された場合、curlがエラーページを取得してしまっている（ネットワーク到達性の問題）ので、その場でユーザーに報告し画像を手動で用意してもらう。

- [ ] **Step 3: コミット**

```bash
git add images/
git commit -m "$(cat <<'EOF'
feat: index.htmlリニューアル用の実写真4枚を追加

Unsplashの無料写真（居酒屋店主・工務店職人・カフェ店主・キッチンカー）。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 2: 配色をネイビー×ブルーに変更する

**Files:**
- Modify: `index.html` (`<style>` 内の `:root` 定義と `var(--red)` を使用する全箇所)

- [ ] **Step 1: `:root` にブルー変数を追加し、ネイビーへ変更する**

old_string:
```
:root{--ink:#303030;--red:#E31E23;--mid:#808080;--faint:#E8E8E8;--bg:#ffffff}
```

new_string:
```
:root{--ink:#1B2A4A;--blue:#3A7BD5;--red:#E31E23;--mid:#808080;--faint:#E8E8E8;--bg:#ffffff}
```

- [ ] **Step 2: `var(--red)` を使っている全箇所を `var(--blue)` に置き換える**

`--red` はこの後もCSS変数として定義したままにする（ロゴ画像の視覚的な赤みとの整合を保つためで、削除はしない）が、装飾・インタラクションで参照している箇所は全てブルーに切り替える。ロゴ自体はbase64埋め込みの画像なので、この置換の影響を受けない。

Run:
```bash
sed -i 's/var(--red)/var(--blue)/g' index.html
```

- [ ] **Step 3: 置き換えが正しく行われたか確認する**

Run: `grep -c "var(--red)" index.html`
Expected: `0`（`var(--red)` という文字列参照はもう存在しない。`--red:#E31E23` という定義自体は残っているのでファイル内に `red` という文字は残るが、それは想定通り）

Run: `grep -c "var(--blue)" index.html`
Expected: `20`前後（元々`var(--red)`を使っていた箇所の数だけ増える）

- [ ] **Step 4: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
style: アクセントカラーを赤からネイビー×ブルーに変更

housemind.netを参考にした配色変更。--ink をネイビー(#1B2A4A)に、
装飾・リンク色の --red 参照を新設の --blue(#3A7BD5) に置き換え。
ロゴ画像（base64埋め込み）はこの変更の影響を受けないため赤のまま残る。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 3: ヒーローセクションに写真パネルを追加する

**Files:**
- Modify: `index.html` (`.hero-inner` のCSSと、hero内のHTML構造)

- [ ] **Step 1: `.hero-inner` のグリッド列を3列に変更し、`.hero-photo` のCSSを追加する**

old_string:
```
.hero-inner{display:grid;grid-template-columns:1fr 380px;min-height:calc(100vh - 68px - 56px);align-items:center;gap:0}
```

new_string:
```
.hero-inner{display:grid;grid-template-columns:1fr 280px 380px;min-height:calc(100vh - 68px - 56px);align-items:center;gap:0}
.hero-photo{align-self:stretch;overflow:hidden;border-right:1px solid var(--faint);background:#eee}
.hero-photo img{width:100%;height:100%;object-fit:cover;display:block}
```

- [ ] **Step 2: モバイル用メディアクエリに `.hero-photo` の高さ指定を追加する**

old_string:
```
  .hero-inner{grid-template-columns:1fr}
  .hero-l{padding:56px 24px;gap:24px}
  .hero-r{border-top:1px solid var(--faint)}
```

new_string:
```
  .hero-inner{grid-template-columns:1fr}
  .hero-l{padding:56px 24px;gap:24px}
  .hero-photo{min-height:220px;border-right:none;border-bottom:1px solid var(--faint)}
  .hero-r{border-top:1px solid var(--faint)}
```

- [ ] **Step 3: `.hero-l` と `.hero-r` の間にHTMLの写真パネルを挿入する**

old_string:
```
      <div class="hero-act">
        <a class="btn" href="#contact">無料相談を申し込む</a>
        <span class="btn-note">初回相談 / 完全無料 / 約60分</span>
      </div>
    </div>
    <div class="hero-r">
```

new_string:
```
      <div class="hero-act">
        <a class="btn" href="#contact">無料相談を申し込む</a>
        <span class="btn-note">初回相談 / 完全無料 / 約60分</span>
      </div>
    </div>
    <div class="hero-photo">
      <img src="images/case-cafe-owner.jpg" alt="接客をするお店の店主">
    </div>
    <div class="hero-r">
```

- [ ] **Step 4: ブラウザで確認する**

`file:///C:/Users/aktfk/aidandaide/index.html` を開き、PC幅（1400px程度）とスマホ幅（375px程度）の両方でヒーローセクションを確認する。写真がテキストとメニューの間に表示され、レイアウトが崩れていないこと。

- [ ] **Step 5: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: ヒーローセクションに実写真パネルを追加

現状のテキスト+3メニューの2カラム構成に、実写真を挟んだ3カラム構成に変更。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 4: 既存ケースカード（工務店・居酒屋）に写真を追加する

**Files:**
- Modify: `index.html` (`.case-meta` 用CSSの追加、Case 03・Case 05のHTML)

- [ ] **Step 1: `.case-photo` のCSSを追加する**

old_string:
```
.case-meta{padding:40px 36px;border-right:1px solid var(--faint);display:flex;flex-direction:column;gap:12px;background:#fafafa}
```

new_string:
```
.case-meta{padding:40px 36px;border-right:1px solid var(--faint);display:flex;flex-direction:column;gap:12px;background:#fafafa}
.case-photo{width:100%;aspect-ratio:4/3;overflow:hidden;border:1px solid var(--faint)}
.case-photo img{width:100%;height:100%;object-fit:cover;display:block}
```

- [ ] **Step 2: Case 03（工務店）に写真を追加する**

old_string:
```
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 03</div>
```

new_string:
```
      <div class="case-item">
        <div class="case-meta">
          <div class="case-photo"><img src="images/case-craftsman.jpg" alt="工務店の職人が作業する様子"></div>
          <div class="case-n">Case 03</div>
```

- [ ] **Step 3: Case 05（飲食・居酒屋）に写真を追加する**

old_string:
```
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 05</div>
```

new_string:
```
      <div class="case-item">
        <div class="case-meta">
          <div class="case-photo"><img src="images/case-bar-owner.jpg" alt="居酒屋の店主"></div>
          <div class="case-n">Case 05</div>
```

- [ ] **Step 4: ブラウザで確認する**

`file:///C:/Users/aktfk/aidandaide/index.html` の実績セクション（Results）で、Case 03とCase 05のカード左上に写真が表示され、レイアウトが崩れていないことを確認する。

- [ ] **Step 5: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: 実績ケースカード（工務店・居酒屋）に実写真を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 5: 新規ケースカード（カフェ・キッチンカー）を追加する

**Files:**
- Modify: `index.html` (Case 07の直後にCase 08・Case 09を追加)

- [ ] **Step 1: Case 07の直後に2件のケースカードを追加する**

old_string:
```
          <div class="case-result"><div class="case-result-n">2mo.</div><div class="case-result-text"><strong>組織なき成長は止まる。</strong>オペレーションを整えたから、販路が開いた。ビズエイドは「順番を整える」ことから始めます。</div></div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- WHY US -->
```

new_string:
```
          <div class="case-result"><div class="case-result-n">2mo.</div><div class="case-result-text"><strong>組織なき成長は止まる。</strong>オペレーションを整えたから、販路が開いた。ビズエイドは「順番を整える」ことから始めます。</div></div>
        </div>
      </div>

      <div class="case-item">
        <div class="case-meta">
          <div class="case-photo"><img src="images/case-cafe-owner.jpg" alt="カフェの店主"></div>
          <div class="case-n">Case 08</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">カフェ（女性店主・個人経営）</div>
          <div class="case-title">SNS投稿だけでは伝わらなかった魅力を、口コミで補完</div>
          <div class="case-stat-num">18<span class="unit">件</span></div>
          <div class="case-stat-label">4ヶ月で集まった口コミ投稿数</div>
          <div class="ctags"><div class="ctag">QR設置</div><div class="ctag">AI執筆支援</div><div class="ctag">SNS連携</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">Instagramには力を入れていたが、投稿を見ても「実際どんな雰囲気の店か」が伝わりきらないという声があった。新規のお客様が入店をためらうことも。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">レジ横にQRを設置し、会計時に一言添えて投稿をお願いする運用に。AIの執筆支援で投稿のハードルが下がり、4ヶ月で18件の口コミが集まり、自社サイト・SNSに掲載。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">18件</div><div class="case-result-text"><strong>「行ってみたい」を後押しする声になった。</strong>SNSだけでは伝わらない安心感を、口コミが補ってくれるようになりました。</div></div>
        </div>
      </div>

      <div class="case-item">
        <div class="case-meta">
          <div class="case-photo"><img src="images/case-kitchen-car.jpg" alt="キッチンカーの出店の様子"></div>
          <div class="case-n">Case 09</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">キッチンカー（移動販売）</div>
          <div class="case-title">出店場所が変わっても、口コミが「次はどこ？」を伝えてくれる</div>
          <div class="case-stat-num">月<span class="unit">+3</span></div>
          <div class="case-stat-label">口コミ経由のリピート来店増加数</div>
          <div class="ctags"><div class="ctag">QR設置</div><div class="ctag">AI執筆支援</div><div class="ctag">リピート促進</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">出店場所が日によって変わるため、常連以外には「今日はどこにいるか」が伝わりにくかった。せっかく気に入ってもらっても再来店につながりにくい状態だった。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">購入時にQRを渡し、口コミ投稿と合わせて出店予定もSNSで発信。口コミが「また食べたい」を後押しし、投稿を見た新しいお客様の来店にもつながった。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">+3</div><div class="case-result-text"><strong>「また会える」への期待が、リピートに変わった。</strong>移動販売でも、口コミが常連づくりの土台になっています。</div></div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- WHY US -->
```

- [ ] **Step 2: ブラウザで確認する**

実績セクションにCase 08（カフェ）・Case 09（キッチンカー）が追加され、既存のカードと同じスタイルで表示されることを確認する。

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: 実績セクションにカフェ・キッチンカーのケースを追加

これまでの7業種に加え、カフェ（女性店主）とキッチンカーの
プレースホルダー事例を追加。実際のお客様事例が集まり次第、順次差し替え予定。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 6: ヒーローのコピーを会話調に書き直す

**Files:**
- Modify: `index.html` (hero-label, hero-tag, hero-sub, 3つのhero-svc-desc)

- [ ] **Step 1: ヒーローラベル・見出し・本文を書き直す**

old_string:
```
      <p class="hero-logo-text">集客支援ミッケ！</p>
      <span class="hero-label">UGC MARKETING × AI DISCOVERY</span>
      <h1 class="hero-tag">顧客の声が、<br>人にもAIにも届く。</h1>
      <p class="hero-sub">口コミ・SNS投稿・レビュー——これがUGC（ユーザー生成コンテンツ）。<br>ChatGPT・Claude・Googleすべてが「本物の声」を参照する今、<br>顧客の声を仕組み化した会社が選ばれます。</p>
```

new_string:
```
      <p class="hero-logo-text">集客支援ミッケ！</p>
      <span class="hero-label">口コミを、集める仕組み</span>
      <h1 class="hero-tag">「うちの口コミ、<br>全然増えないんです。」</h1>
      <p class="hero-sub">よく聞く悩みです。今はChatGPTやGoogleに聞いても、口コミの多いお店が先に出てきます。<br>だったら、口コミが自然に集まる仕組みを作ってしまえばいい。<br>それが私たちの仕事です。</p>
```

- [ ] **Step 2: 3つのhero-svc-descを書き直す**

old_string:
```
          <div class="hero-svc-name">集客支援ミッケ！UGC</div>
          <div class="hero-svc-desc">QRコード1枚で口コミ投稿→AIが執筆支援→自社HPに掲載</div>
```

new_string:
```
          <div class="hero-svc-name">集客支援ミッケ！UGC</div>
          <div class="hero-svc-desc">QRコードを置くだけ。お客様の声が、自社サイトに並びます</div>
```

old_string:
```
          <div class="hero-svc-name">生成AIツール作成</div>
          <div class="hero-svc-desc">「あれもできる？」に全部応える</div>
```

new_string:
```
          <div class="hero-svc-name">生成AIツール作成</div>
          <div class="hero-svc-desc">「こんなこともできる？」と思ったら、まず聞いてください</div>
```

old_string:
```
          <div class="hero-svc-name">伴走コンサルティング</div>
          <div class="hero-svc-desc">経営・営業・組織の現場支援</div>
```

new_string:
```
          <div class="hero-svc-name">伴走コンサルティング</div>
          <div class="hero-svc-desc">数字だけでなく、現場に一緒に立ちます</div>
```

- [ ] **Step 3: ブラウザで確認する**

ヒーロー部分の文言が変わっていること、レイアウトが崩れていないこと（文字数が変わって折り返し位置が変わる可能性があるため）を確認する。

- [ ] **Step 4: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
copy: ヒーローのコピーを会話調に書き直し

英語・カタカナ交じりのラベルやバズワードを避け、
実際の悩みの声から始まる自然な言い回しに変更。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 7: UGCセクションのコピーを書き直す

**Files:**
- Modify: `index.html` (`.ugc-lead`, `.ugc-body` の2段落)

- [ ] **Step 1: 見出しと本文を書き直す**

old_string:
```
      <h2 class="ugc-lead">「顧客の声」が、<br>最強の集客になる。</h2>
        <p class="ugc-body">UGC（User Generated Content）とは、顧客・利用者が自発的に投稿する口コミ・SNS投稿・レビューのこと。<br><br>広告より信頼され、ChatGPT・Claude・Perplexityなど生成AIが「おすすめ」を答えるとき、最も参照される情報源です。<br><br>UGCが多い会社ほど、人にもAIにも自然に見つけてもらえます。</p>
        <p class="ugc-body" style="margin-top:20px">Aid &amp; Aideの「集客支援ミッケ！UGC」は、この仕組みそのものを提供するツールです。QRコードから投稿された口コミをAIが執筆支援し、あなたの会社のホームページに埋め込みウィジェットとして直接表示します。<br><a href="mikke.html" style="color:var(--ink);font-weight:700;text-decoration:underline">→ ミッケUGCの詳細を見る</a></p>
```

new_string:
```
      <h2 class="ugc-lead">結局、<br>「お客さんの声」が一番強い。</h2>
        <p class="ugc-body">口コミ、SNSの投稿、レビュー。専門用語だとUGC（ユーザー生成コンテンツ）と呼びますが、要は「お客さんが自分から書いてくれた言葉」のことです。<br><br>広告より信じられますし、今はChatGPTやPerplexityに「おすすめのお店」を聞いても、口コミが多いところから答えます。<br><br>だから、口コミが多い会社ほど、人にもAIにも見つけてもらいやすくなります。</p>
        <p class="ugc-body" style="margin-top:20px">「集客支援ミッケ！UGC」は、この口コミを集める仕組みそのものです。QRコードから投稿してもらった声を、AIが文章にするお手伝いをして、そのままあなたの会社のホームページに表示します。<br><a href="mikke.html" style="color:var(--ink);font-weight:700;text-decoration:underline">→ ミッケUGCの詳細を見る</a></p>
```

- [ ] **Step 2: ブラウザで確認する**

UGCセクションの文言が変わっていることを確認する。

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
copy: UGCセクションのコピーを会話調に書き直し

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 8: PROBLEMセクションのコピーを書き直す

**Files:**
- Modify: `index.html` (`.prob-h3`, `.prob-body`)

- [ ] **Step 1: 見出しと本文を書き直す**

old_string:
```
        <h2 class="prob-h3">「声」が集まらない<br>会社は、選ばれない。</h2>
        <p class="prob-body">AIも人も、今や「本物の声」を判断基準にしています。口コミ・SNS・レビューがない会社は、どんなに良いサービスを持っていても見つけてもらえません。</p>
```

new_string:
```
        <h2 class="prob-h3">こんなお悩み、<br>ありませんか。</h2>
        <p class="prob-body">どんなに良いサービスをしていても、口コミやSNSでの声がなければ、今は見つけてもらえません。AIも人も、判断材料にするのは「本物の声」だからです。</p>
```

- [ ] **Step 2: ブラウザで確認する**

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
copy: PROBLEMセクションのコピーを会話調に書き直し

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 9: SERVICES導入文を書き直す

**Files:**
- Modify: `index.html` (`.svc-intro`)

- [ ] **Step 1: 導入文を書き直す**

old_string:
```
    <p class="svc-intro">集客支援ミッケ！UGCを起点に、AI発見・ツール作成・伴走支援まで一気通貫。「あれもできる？これもできる？」に全部応えます。</p>
```

new_string:
```
    <p class="svc-intro">まずは口コミを集めるところから。そこから先、AIツールづくりや経営の相談まで、必要になったら何でも聞いてください。</p>
```

- [ ] **Step 2: ブラウザで確認する**

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
copy: SERVICESセクションの導入文を会話調に書き直し

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 10: AI TOOLSセクションのコピーを書き直す

**Files:**
- Modify: `index.html` (`.aitools-lead`, `.aitools-sub`)

- [ ] **Step 1: 見出しとサブ文を書き直す**

old_string:
```
    <p class="aitools-lead">「UGCを仕組み化したら、次は何ができますか？」</p>
    <p class="aitools-sub">あれもできる。これもできる。<br>生成AIで、その会社に必要なものを一緒につくります。</p>
```

new_string:
```
    <p class="aitools-lead">「口コミの次は、何をすればいいですか？」</p>
    <p class="aitools-sub">よく聞かれます。答えは「その会社に必要なもの」です。<br>生成AIを使って、一緒に考えて、一緒に作ります。</p>
```

- [ ] **Step 2: ブラウザで確認する**

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
copy: AI TOOLSセクションのコピーを会話調に書き直し

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 11: WHY USセクションのコピーを書き直す

**Files:**
- Modify: `index.html` (`.whyus-quote-sub`, `.whyus-p` x3, `.whyus-em`)

- [ ] **Step 1: 引用のサブ文・本文3段落・強調文を書き直す**

old_string:
```
        <p class="whyus-quote-sub">UGCがAIに選ばれる鍵です。</p>
      </div>
      <div class="whyus-r">
        <div class="whyus-body">
          <p class="whyus-p">ChatGPT・Claude・Perplexityなど、AIが「おすすめ」を答える時代になりました。AIは口コミ・SNS投稿・レビューなどUGCを参照して回答を生成します。</p>
          <p class="whyus-p">これがLLMO（Large Language Model Optimization）です。<strong>AIに言及・推薦される会社になること。</strong>Googleマップ・Instagram・HP・note——Web上の存在感を総合的に高めることが、そのままLLMO対策になります。</p>
          <p class="whyus-p">Aid &amp; AideはUGCを起点に、AIに引用される「存在感」と人に選ばれる「信頼感」を同時に構築します。口コミが増えるほど、AIにも人にも見つけてもらいやすくなります。</p>
          <div class="whyus-divider"></div>
          <p class="whyus-em">だから私たちは「全方位で設計する」。</p>
          <p class="whyus-p">AIに計測させ、現場で動くのはヒト。データと伴走の両輪で、あなたの会社をAI時代の集客勝者へ。</p>
```

new_string:
```
        <p class="whyus-quote-sub">実際にお客様から聞いた声です。</p>
      </div>
      <div class="whyus-r">
        <div class="whyus-body">
          <p class="whyus-p">今、ChatGPTやPerplexityに「おすすめのお店」を聞く人が増えています。そのとき、AIは口コミやSNSの投稿を材料にして答えを作ります。</p>
          <p class="whyus-p">つまり、口コミが多い会社ほど、AIに紹介されやすくなるということです。専門用語ではLLMOと呼ばれますが、やることは単純で、<strong>Googleマップ・Instagram・自社サイト——お店の「声」が集まる場所を増やす</strong>、それだけです。</p>
          <p class="whyus-p">Aid &amp; Aideは、口コミを起点にこの「見つけてもらいやすさ」を一緒に作ります。口コミが増えるほど、AIにも人にも見つかりやすくなります。</p>
          <div class="whyus-divider"></div>
          <p class="whyus-em">数字は見るけど、動くのは人。</p>
          <p class="whyus-p">AIで状況を計測しながら、実際に動くのは私たち自身です。データと現場、両方から一緒に取り組みます。</p>
```

- [ ] **Step 2: ブラウザで確認する**

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
copy: WHY USセクションのコピーを会話調に書き直し

「全方位で設計する」等の抽象的な決め台詞を、具体的な説明に置き換え。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011ddoq3v1BNRgw8pBcX5wWd
EOF
)"
git push origin main
```

---

### Task 12: 最終の目視確認（ブラウザ）

**Files:** なし（確認のみ）

- [ ] **Step 1: chrome-devtools-mcpでページ全体を確認する**

`mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page` で `file:///C:/Users/aktfk/aidandaide/index.html` を開き、`take_screenshot`（`fullPage:true`）でページ全体をキャプチャする。

確認項目：
- ヒーロー、実績セクション（Case 08・09含む）の写真が正しく表示されているか（壊れた画像リンクがないか）
- 配色がネイビー×ブルーになっており、赤が残っていないか（ロゴ以外）
- モバイル幅（375px）でもレイアウトが崩れていないか（`emulate` viewportで確認）
- コピーの誤字・脱字がないか

- [ ] **Step 2: 問題があれば該当タスクに戻って修正する**

問題が見つかった場合、該当するTaskのStepに戻ってEditで修正し、再度コミット・pushする。

- [ ] **Step 3: ユーザーに完了報告する**

スクリーンショットを添えて、変更内容のサマリー（配色・写真4枚追加・新規ケース2件・コピー書き直し箇所）をユーザーに報告し、最終確認を依頼する。

---

## Self-Review（このplanの自己チェック）

- **spec網羅性**: spec項目1（レイアウト）→Task3,4,5、項目2（配色）→Task2、項目3（写真）→Task1,3,4,5、項目4（コピー）→Task6-11、項目5（技術注意点）→前提知識セクション＋各Taskのコミット規約。すべて対応するTaskがある。
- **プレースホルダーチェック**: 各Stepのold_string/new_stringはすべて実際の文字列。「TBD」「後で決める」等の記述はない。
- **型・命名の一貫性**: `.hero-photo` `.case-photo` のクラス名はTask3とTask4/5で同じ名前を使っている。画像ファイル名（`images/case-*.jpg`）もTask1で定義したものをTask3・4・5で一貫して参照している。
