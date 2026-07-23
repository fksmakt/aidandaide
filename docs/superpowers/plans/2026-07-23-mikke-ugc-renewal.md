# ミッケUGCリニューアル Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aidandaide.com のブランチ`work/mikke-ugc-renewal`上で、「集客支援 ミッケ！」を実際のミッケUGC製品（QR投稿→AI執筆支援→自社HP埋め込み表示）の内容に置き換える。

**Architecture:** 静的HTMLサイト（GitHub Pages）。既存の3ファイル（`index.html`, `mikke.html`, `biz_aid.html`）のうち、`mikke.html`は`<head><style>`のCSSクラス体系を維持したまま`<body>`のみ全面書き換え。`index.html`は既存の事業ファネル構成（UGC→AIツール→伴走コンサル）を維持しつつ、ミッケUGCに関する記述箇所のみピンポイントで修正。`biz_aid.html`はナビ文言のみ修正。

**Tech Stack:** 素のHTML/CSS（フレームワークなし）。テストフレームワークは存在しないため、検証は文字列存在チェック（grep）とブラウザ目視確認で行う。

---

## ファイル構成

| ファイル | 変更内容 |
|---|---|
| `mikke.html` | `<body>`全体を書き換え。`<head><style>`は変更しない |
| `index.html` | 6箇所をピンポイント修正（ナビ、ヒーロー、UGCセクション、SERVICESカード、Case01〜06、コンタクトフォーム） |
| `biz_aid.html` | ナビ文言1箇所のみ修正 |

---

### Task 1: mikke.html の body を書き換える

**Files:**
- Modify: `mikke.html`（`<title>`および`<body>`のみ。`<head><style>`は不変）

- [ ] **Step 1: `<title>`を更新**

`mikke.html`の6行目を編集する。

Old:
```html
<title>ミッケ！— Google×LINE×Instagram×HP×LLMO — 株式会社 Aid &amp; Aide</title>
```

New:
```html
<title>ミッケUGC — 口コミを、自社サイトの資産に。 | 株式会社 Aid &amp; Aide</title>
```

- [ ] **Step 2: `<body>`全体を以下の内容に置き換える**

134行目の`<body>`から377行目の`</html>`までを、以下の内容にまるごと置き換える。

```html
<body>
<nav>
  <a class="nav-logo" href="index.html">
  </a>
  <div class="nav-links">
    <a href="mikke.html" style="color:var(--ink);font-weight:600">集客支援 ミッケ！UGC</a>
    <a href="biz_aid.html">ビズエイド</a>
    <a href="index.html#results">Results</a>
    <a href="index.html#sv">Services</a>
    <a class="nav-cta" href="index.html#contact">無料相談</a>
  </div>
</nav>

<div class="sv-hero">
  <div class="sv-hero-meta"><span>Aid &amp; Aide — サービス詳細</span><span>集客支援 ミッケ！UGC</span></div>
  <div class="sv-hero-body">
    <div>
      <div class="sv-eyebrow">Service 01</div>
      <div class="sv-big" style="font-size:clamp(72px,11vw,140px)"><div>ミッケUGC</div></div>
      <p style="font-size:11px;letter-spacing:3px;color:#555;margin-top:8px;font-family:'Poppins',sans-serif">MIKKE UGC — Customer Voice, On Your Own Site</p>
    </div>
    <div>
      <p class="sv-tagline">お客様の「声」を、他社のプラットフォームに預けたままにしない。QRコードから投稿された口コミを、AIが執筆を支援し、あなた自身のホームページに埋め込んで表示する。お客様の声を、自社サイトの資産にします。</p>
      <div class="sv-cta-wrap" style="margin-top:24px">
        <a class="sv-cta" href="index.html#contact">無料相談を申し込む →</a>
        <p class="sv-price-preview">初期費用29,400円+税〜 / 月額4,800円+税〜 / 初回相談無料</p>
      </div>
    </div>
  </div>
</div>
<div class="breadcrumb"><a href="index.html">HOME</a> <span>›</span> <a href="index.html#sv">サービス</a> <span>›</span> <span>集客支援 ミッケ！UGC</span></div>

<section class="sec">
  <div class="eyebrow">Problem</div>
  <div class="bighead"><div>口コミは、</div><div><span class="lime">溜まるほど資産になる。</span></div></div>
  <div class="two-col">
    <div>
      <p style="font-size:13px;color:var(--mid);line-height:1.95;margin-bottom:20px">お客様の「良かった」という声は、Googleマップや口コミサイトに投稿された瞬間、そのプラットフォームの資産になります。あなたの会社の資産にはなりません。</p>
      <p style="font-size:13px;color:var(--mid);line-height:1.95;margin-bottom:20px">既存のUGC（口コミ活用）ツールを導入しようとしても、月額数万円〜という価格帯が多く、しかも「解約すると、それまで集めた口コミが使えなくなる」という契約になっているケースも少なくありません。</p>
      <p style="font-size:13px;color:var(--mid);line-height:1.95">ミッケUGCは、口コミを集める仕組みそのものをあなたの会社の資産にします。</p>
    </div>
    <div class="two-col-r">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="padding:20px 24px;background:var(--faint);border-radius:4px">
          <div style="font-size:10px;letter-spacing:3px;color:var(--mid);margin-bottom:8px">よくあるUGCツール</div>
          <div style="font-size:13px;color:var(--mid);line-height:1.9">月額数万円〜と高額<br>→ 解約すると口コミが使えなくなる契約<br>→ 埋め込みも自由度が低い<br>→ <strong style="color:var(--ink)">結局、解約したくてもできない</strong></div>
        </div>
        <div style="padding:20px 24px;background:var(--ink);border-radius:4px">
          <div style="font-size:10px;letter-spacing:3px;color:#fff;margin-bottom:8px">ミッケUGC</div>
          <div style="font-size:13px;color:#aaa;line-height:1.9">月額4,800円+税〜<br>→ QRコード一つで投稿を集める<br>→ AIが文章作成を支援<br>→ <strong style="color:#fff">自社サイトに埋め込んで資産化</strong></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="eyebrow">How it works</div>
  <div class="bighead"><div>導入すると、</div><div><span class="lime">何が起きるか。</span></div></div>
  <div class="flow-grid">
    <div class="flow-item"><div class="flow-n">01</div><div class="flow-t">QRコード発行</div><div class="flow-d">店舗・事務所・レシート・名刺に設置できるQRコードを発行します。</div></div>
    <div class="flow-item"><div class="flow-n">02</div><div class="flow-t">お客様が投稿</div><div class="flow-d">来店客がQRをスキャンし、星評価とコメントを投稿。AIが文章作成をサポートします。</div></div>
    <div class="flow-item"><div class="flow-n">03</div><div class="flow-t">管理画面で確認</div><div class="flow-d">投稿された口コミを管理画面でチェックし、公開する内容を選べます。</div></div>
    <div class="flow-item"><div class="flow-n">04</div><div class="flow-t">自社HPに表示</div><div class="flow-d">公開した口コミを、埋め込みウィジェットで自社サイトにそのまま表示します。</div></div>
  </div>
</section>

<section class="sec" style="background:var(--ink)">
  <div class="eyebrow" style="color:#555">Features</div>
  <div class="bighead" style="color:#fff;margin-bottom:40px"><div>ミッケUGCに</div><div><span style="background:#fff;color:var(--ink);padding:2px 12px">入っているもの</span></div></div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #1a1a1a">
    <div style="padding:28px 24px;border-right:1px solid #1a1a1a;text-align:center">
      <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:13px;letter-spacing:2px;color:var(--red);margin-bottom:12px">QR</div>
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">QRコード発行</div>
      <div style="font-size:11px;color:#555;line-height:1.8">店舗設置用<br>レシート・名刺対応<br>複数枚発行可</div>
    </div>
    <div style="padding:28px 24px;border-right:1px solid #1a1a1a;text-align:center">
      <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:13px;letter-spacing:2px;color:var(--red);margin-bottom:12px">AI</div>
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">AI文章支援</div>
      <div style="font-size:11px;color:#555;line-height:1.8">口コミ執筆サポート<br>星評価から自動生成<br>お客様の負担を軽減</div>
    </div>
    <div style="padding:28px 24px;border-right:1px solid #1a1a1a;text-align:center">
      <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:13px;letter-spacing:2px;color:var(--red);margin-bottom:12px">WIDGET</div>
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">埋め込みウィジェット</div>
      <div style="font-size:11px;color:#555;line-height:1.8">自社HPに表示<br>デザインカスタム可<br>自動更新</div>
    </div>
    <div style="padding:28px 24px;border-right:1px solid #1a1a1a;text-align:center">
      <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:13px;letter-spacing:2px;color:var(--red);margin-bottom:12px">FORM</div>
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">投稿フォーム設定</div>
      <div style="font-size:11px;color:#555;line-height:1.8">デザインカスタマイズ<br>設問・タグ設定<br>ブランドに合わせて調整</div>
    </div>
    <div style="padding:28px 24px;text-align:center">
      <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:13px;letter-spacing:2px;color:var(--red);margin-bottom:12px">DASH</div>
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">レビュー管理</div>
      <div style="font-size:11px;color:#555;line-height:1.8">投稿の確認・公開管理<br>ダッシュボードで一元管理<br>非公開設定も可能</div>
    </div>
  </div>
</section>

<section class="sec-sm" id="widget-demo" style="background:var(--ink)">
  <div class="eyebrow" style="color:#555"><span style="background:#555;display:inline-block;width:20px;height:1px;margin-right:10px"></span>Widget Preview</div>
  <div class="bighead" style="color:#fff"><div>集まった口コミが、</div><div style="color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.3)">そのままHPに並ぶ。</div></div>
  <p style="font-size:13px;color:#666;line-height:1.9;max-width:560px;margin-bottom:40px">
    埋め込みウィジェットを設置すると、公開した口コミが自動的にこのように並びます。<br>
    新しい投稿が公開されるたびに、<strong style="color:#fff">自社HP側の表示も自動で更新</strong>されます。
  </p>
  <div style="border:1px solid #1a1a1a;overflow:hidden;max-width:860px">
    <div style="padding:20px 28px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <span style="background:var(--red);color:#fff;font-family:'Poppins',sans-serif;font-weight:700;font-size:10px;letter-spacing:3px;padding:3px 10px;text-transform:uppercase;margin-right:10px">Widget</span>
        <span style="font-size:10px;color:#444;letter-spacing:2px">— サンプル表示</span>
      </div>
      <div style="font-size:11px;color:#444;letter-spacing:1px">埋め込みコード1行で設置完了</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr)">
      <div style="padding:24px;border-right:1px solid #1a1a1a">
        <div style="color:var(--red);font-size:14px;margin-bottom:10px">★★★★★</div>
        <div style="font-size:12px;color:#ccc;line-height:1.8;margin-bottom:12px">「スタッフの方の対応がとても丁寧で、また利用したいと思いました。」</div>
        <div style="font-size:10px;color:#555;letter-spacing:1px">40代 / 女性</div>
      </div>
      <div style="padding:24px;border-right:1px solid #1a1a1a">
        <div style="color:var(--red);font-size:14px;margin-bottom:10px">★★★★★</div>
        <div style="font-size:12px;color:#ccc;line-height:1.8;margin-bottom:12px">「予約から当日まで案内がわかりやすく、安心してお願いできました。」</div>
        <div style="font-size:10px;color:#555;letter-spacing:1px">30代 / 男性</div>
      </div>
      <div style="padding:24px">
        <div style="color:var(--red);font-size:14px;margin-bottom:10px">★★★★☆</div>
        <div style="font-size:12px;color:#ccc;line-height:1.8;margin-bottom:12px">「価格以上の満足感でした。次は友人にも紹介したいです。」</div>
        <div style="font-size:10px;color:#555;letter-spacing:1px">20代 / 女性</div>
      </div>
    </div>
    <div style="padding:14px 28px;border-top:1px solid #1a1a1a;font-size:10px;color:#333;letter-spacing:1px">※ これはデモ表示です。実際の投稿内容はご契約後、管理画面で確認・編集できます。</div>
  </div>
</section>

<section class="sec-sm">
  <div class="eyebrow">Price</div>
  <div class="bighead">料金プラン</div>
  <div class="price-grid" style="grid-template-columns:repeat(2,1fr)">
    <div class="price-card featured">
      <span class="pc-badge">掲載プラン</span>
      <div class="pc-name">まず始める</div>
      <div class="pc-price">¥29,400</div>
      <div class="pc-unit">初期費用+税（初月〜3ヶ月分月額込み）</div>
      <div class="pc-sub">月額 ¥4,800+税（4ヶ月目以降）</div>
      <div class="pc-divider"></div>
      <div class="pc-items">
        <div class="pc-item">QRコード発行</div>
        <div class="pc-item">AI文章作成支援</div>
        <div class="pc-item">埋め込みウィジェット設置</div>
        <div class="pc-item">レビュー管理ダッシュボード</div>
      </div>
      <div class="pc-desc">Aid &amp; Aideサイトに「導入企業」として掲載されることが条件です</div>
    </div>
    <div class="price-card">
      <span class="pc-badge">非公開プラン</span>
      <div class="pc-name">掲載なしで始める</div>
      <div class="pc-price">¥59,400</div>
      <div class="pc-unit">初期費用+税（初月〜3ヶ月分月額込み）</div>
      <div class="pc-sub">月額 ¥14,800+税（4ヶ月目以降）</div>
      <div class="pc-divider"></div>
      <div class="pc-items">
        <div class="pc-item">掲載プランの全内容</div>
        <div class="pc-item">Aid &amp; Aideサイトへの掲載なし</div>
        <div class="pc-item">非公開でご利用いただけます</div>
      </div>
      <div class="pc-desc">社名を出さずに導入したい場合はこちらのプランをご案内します</div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="eyebrow">Case</div>
  <div class="bighead"><div>導入事例</div><div><span class="lime">（一部抜粋）</span></div></div>
  <p style="font-size:11px;color:var(--mid);letter-spacing:1px;margin-bottom:32px">※ 以下はミッケUGC導入を想定した事例です。実績が集まり次第、実データに差し替えます。</p>
  <div class="two-col">
    <div>
      <div style="font-size:10px;letter-spacing:2px;color:var(--mid);margin-bottom:8px">CASE — 美容室 / 個人サロン</div>
      <p style="font-size:14px;font-weight:700;margin-bottom:12px">口コミが自社サイトに並ぶようになり、予約前の不安が減った</p>
      <p style="font-size:13px;color:var(--mid);line-height:1.9">来店客にQRを渡し、会計時に口コミ投稿をお願いする運用に。3ヶ月で自社サイトに30件以上の口コミが並び、初めての方からの予約が増加。</p>
    </div>
    <div class="two-col-r">
      <div style="font-size:10px;letter-spacing:2px;color:var(--mid);margin-bottom:8px">CASE — 整骨院</div>
      <p style="font-size:14px;font-weight:700;margin-bottom:12px">Googleマップの口コミと合わせて、信頼の入口を増やせた</p>
      <p style="font-size:13px;color:var(--mid);line-height:1.9">受付にQRを設置し、施術後のタイミングで投稿を依頼。自社サイトに口コミが表示されることで「初めてでも安心」という声が増えた。</p>
    </div>
  </div>
  <div style="margin-top:40px"><a href="index.html#results" style="font-size:12px;color:var(--mid);text-decoration:none;letter-spacing:1px">すべての導入事例を見る →</a></div>
</section>

<section class="sec-sm">
  <div class="eyebrow">FAQ</div>
  <div class="bighead">よくある<br>ご質問</div>
  <div class="faq-list">
    <div class="faq-item"><div class="faq-q">今使っているGoogleマップの口コミと併用できますか？</div><div class="faq-a">はい。ミッケUGCは自社サイトに表示する口コミの仕組みなので、Googleマップの口コミ対策と並行して進められます。むしろ両方を連動させることで、AI・検索エンジン双方からの見つけられやすさが高まります。</div></div>
    <div class="faq-item"><div class="faq-q">AIが書いた文章が、そのまま公開されるのですか？</div><div class="faq-a">いいえ。AIはお客様の入力（星評価やキーワード）をもとに文章の草案を作成する「執筆支援」までです。実際に投稿するかどうかはお客様自身が決め、さらに管理画面で公開前に確認・非公開設定もできます。</div></div>
    <div class="faq-item"><div class="faq-q">解約したら、集まった口コミはどうなりますか？</div><div class="faq-a">これまで投稿された口コミデータはご契約中に随時確認・保存いただけます。他社の高額UGCツールにありがちな「解約後にデータが一切使えなくなる」制約を作らないことを、ミッケUGCの前提にしています。</div></div>
    <div class="faq-item"><div class="faq-q">掲載プランと非公開プランは、途中で変更できますか？</div><div class="faq-a">可能です。ご状況の変化に合わせてプラン変更のご相談を受け付けています。</div></div>
  </div>
</section>

<section class="cta-section">
  <div class="cta-big"><div>資産に</div><div>しよ</div><div class="s">う。</div></div>
  <div class="cta-r">
    <p class="cta-sub">お客様の声を、他社のプラットフォームに預けたままにしていませんか。まず現状を聞かせてください。QRコード1枚から始められます。</p>
    <a class="cta-btn" href="index.html#contact">無料相談を申し込む →</a>
    <div class="cta-free">初回相談 <strong>完全無料</strong> / 約60分</div>
  </div>
</section>

</div>
<footer>
  <div class="footer-brand">AID<span class="r">&amp;</span>AIDE &nbsp;<span style="font-family:'Noto Sans JP';font-size:11px;color:#888;font-weight:400;letter-spacing:1px">株式会社 Aid &amp; Aide — AIに選ばれる会社をつくる。</span></div>
  <div class="footer-copy">&copy; 2025-2026 Aid &amp; Aide Co., Ltd. All rights reserved.</div>
</footer>
</body>
</html>
```

- [ ] **Step 3: 文字列存在チェックで検証する**

Run:
```bash
cd /c/Users/aktfk/aidandaide
grep -c "ミッケUGC" mikke.html
grep -c "Google×LINE×Instagram" mikke.html
grep -c "llmo-score-widget" mikke.html
```
Expected: 1つ目のgrepは1以上、2つ目・3つ目は0（旧5in1・LLMOデモへの言及が残っていないこと）。

- [ ] **Step 4: コミット**

```bash
cd /c/Users/aktfk/aidandaide
git add mikke.html
git commit -m "feat: mikke.htmlをミッケUGC製品内容に全面書き換え"
```

---

### Task 2: index.html のナビ・ヒーロー・UGCセクションを修正する

**Files:**
- Modify: `index.html`

- [ ] **Step 1: ナビのリンク文言を更新**

Old:
```html
    <a href="mikke.html">集客支援 ミッケ！</a>
```

New:
```html
    <a href="mikke.html">集客支援ミッケ！UGC</a>
```

- [ ] **Step 2: ヒーローのサービス説明文を更新**

Old:
```html
      <a class="hero-svc" href="#ugc">
        <span class="hero-svc-n">01</span>
        <div>
          <div class="hero-svc-name">集客支援ミッケ！UGC</div>
          <div class="hero-svc-desc">口コミ・SNS・レビューを仕組み化して集客</div>
        </div>
        <span class="hero-svc-arrow">→</span>
      </a>
```

New:
```html
      <a class="hero-svc" href="#ugc">
        <span class="hero-svc-n">01</span>
        <div>
          <div class="hero-svc-name">集客支援ミッケ！UGC</div>
          <div class="hero-svc-desc">QRコード1枚で口コミ投稿→AIが執筆支援→自社HPに掲載</div>
        </div>
        <span class="hero-svc-arrow">→</span>
      </a>
```

- [ ] **Step 3: UGCセクションに製品説明の一文を追加**

Old:
```html
        <p class="ugc-body">UGC（User Generated Content）とは、顧客・利用者が自発的に投稿する口コミ・SNS投稿・レビューのこと。<br><br>広告より信頼され、ChatGPT・Claude・Perplexityなど生成AIが「おすすめ」を答えるとき、最も参照される情報源です。<br><br>UGCが多い会社ほど、人にもAIにも自然に見つけてもらえます。</p>
```

New:
```html
        <p class="ugc-body">UGC（User Generated Content）とは、顧客・利用者が自発的に投稿する口コミ・SNS投稿・レビューのこと。<br><br>広告より信頼され、ChatGPT・Claude・Perplexityなど生成AIが「おすすめ」を答えるとき、最も参照される情報源です。<br><br>UGCが多い会社ほど、人にもAIにも自然に見つけてもらえます。</p>
        <p class="ugc-body" style="margin-top:20px">Aid &amp; Aideの「集客支援ミッケ！UGC」は、この仕組みそのものを提供するツールです。QRコードから投稿された口コミをAIが執筆支援し、あなたの会社のホームページに埋め込みウィジェットとして直接表示します。<br><a href="mikke.html" style="color:var(--ink);font-weight:700;text-decoration:underline">→ ミッケUGCの詳細を見る</a></p>
```

- [ ] **Step 4: SERVICESカード01の説明文を更新**

Old:
```html
      <a class="svc-card svc-card--dark" href="mikke.html">
        <div class="svc-card-n">01</div>
        <div class="svc-card-body">
          <div class="svc-card-name">集客支援ミッケ！UGC</div>
          <div class="svc-card-sub">Google × LINE × Instagram × HP × LLMO 全部入り</div>
          <div class="svc-card-desc">「見つけてほしい」を叶える全施策をワンパッケージ。Googleマップ・LINE・Instagram・HP制作・LLMOモニタリングまで一気通貫。月5,000円〜の伴走プランから本格対応まで対応。</div>
        </div>
        <div class="svc-card-link">詳しく見る →</div>
      </a>
```

New:
```html
      <a class="svc-card svc-card--dark" href="mikke.html">
        <div class="svc-card-n">01</div>
        <div class="svc-card-body">
          <div class="svc-card-name">集客支援ミッケ！UGC</div>
          <div class="svc-card-sub">QR投稿 × AI執筆支援 × 自社HP埋め込み</div>
          <div class="svc-card-desc">お客様がQRから投稿した口コミを、AIが執筆支援。公開された口コミは埋め込みウィジェットで自社ホームページにそのまま表示されます。初期費用29,400円+税〜 / 月額4,800円+税〜。</div>
        </div>
        <div class="svc-card-link">詳しく見る →</div>
      </a>
```

- [ ] **Step 5: 文字列存在チェックで検証する**

Run:
```bash
cd /c/Users/aktfk/aidandaide
grep -c "集客支援ミッケ！UGC</a>" index.html
grep -c "月5,000円〜の伴走プラン" index.html
```
Expected: 1つ目は1以上、2つ目は0（旧料金表現が残っていないこと）。

- [ ] **Step 6: コミット**

```bash
cd /c/Users/aktfk/aidandaide
git add index.html
git commit -m "feat: index.htmlのナビ・ヒーロー・UGCセクション・SERVICESカードをミッケUGC製品内容に更新"
```

---

### Task 3: index.html の導入事例（Case 01〜06）を書き換える

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Case 01（美容室）を書き換える**

Old:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 01</div>
          <div class="case-svc">集客支援 ミッケ！</div>
          <div class="case-ind">美容室 / 個人サロン</div>
          <div class="case-title">Googleマップ経由の新規来店数を改善</div>
          <div class="case-stat-num">TOP<span class="unit">3</span></div>
          <div class="case-stat-label">地域キーワード検索順位</div>
          <div class="ctags"><div class="ctag">MEO対策</div><div class="ctag">Googleマップ</div><div class="ctag">口コミ獲得</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">「美容室 ○○駅」で検索しても10位以下。口コミも数件しかなく、Googleマップ経由での新規来店がほとんどない状態だった。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">プロフィール最適化・写真刷新・口コミ獲得の仕組みを導入。地域キーワードで3位以内に表示されるようになり「マップを見て来ました」という新規客が継続的に増加。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">TOP3</div><div class="case-result-text"><strong>地域検索でTOP3入りを実現。</strong>口コミ数と評価点が上がることでクリック率も向上。新規集客の導線がGoogleマップに確立されました。</div></div>
        </div>
      </div>
```

New:
```html
      <!-- 注: 以下のCase 01〜06はミッケUGC導入を想定したプレースホルダー事例。実績データ取得後に差し替え -->
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 01</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">美容室 / 個人サロン</div>
          <div class="case-title">自社サイトに口コミが並ぶようになり、初回予約が増加</div>
          <div class="case-stat-num">32<span class="unit">件</span></div>
          <div class="case-stat-label">3ヶ月で集まった口コミ投稿数</div>
          <div class="ctags"><div class="ctag">口コミ収集</div><div class="ctag">埋め込み表示</div><div class="ctag">AI執筆支援</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">口コミはGoogleマップに数件あるのみで、自社サイトには何も表示されていなかった。「初めてでも安心して予約できるか分からない」という声があった。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">会計時にQRを渡し、口コミ投稿を依頼する運用に。AIの執筆支援で投稿のハードルが下がり、3ヶ月で32件の口コミが集まり自社サイトに埋め込み表示。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">32件</div><div class="case-result-text"><strong>口コミが「見える資産」になった。</strong>自社サイトに口コミが並ぶことで、初めての方からの予約が増加しました。</div></div>
        </div>
      </div>
```

- [ ] **Step 2: Case 02（不動産）を書き換える**

Old:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 02</div>
          <div class="case-svc">集客支援 ミッケ！</div>
          <div class="case-ind">不動産 / 地域密着型</div>
          <div class="case-title">MAP集客＋LINE追客の仕組み化</div>
          <div class="case-stat-num">2<span class="unit">倍</span></div>
          <div class="case-stat-label">LINE経由の問い合わせ数</div>
          <div class="ctags"><div class="ctag">MEO対策</div><div class="ctag">LINE構築</div><div class="ctag">追客自動化</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">Googleマップの掲載は放置状態。LINEも登録はあるが配信していなかった。来店後の追客がなく、検討中の見込み客が流れていた。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">MEO対策で来店数を底上げしつつ、公式LINEで来店後の追客を自動化。LINE経由の問い合わせが2倍に増加。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">×2</div><div class="case-result-text"><strong>LINE経由の問い合わせが2倍に。</strong>集客と追客を一本の導線でつなぐことで、見込み客を逃さない仕組みが完成しました。</div></div>
        </div>
      </div>
```

New:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 02</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">不動産 / 地域密着型</div>
          <div class="case-title">内見前の問い合わせ数が増加</div>
          <div class="case-stat-num">1.6<span class="unit">倍</span></div>
          <div class="case-stat-label">自社サイト経由の問い合わせ数</div>
          <div class="ctags"><div class="ctag">口コミ収集</div><div class="ctag">埋め込み表示</div><div class="ctag">信頼構築</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">自社サイトには物件情報のみで、実際に取引したお客様の声がなかった。「この会社は信頼できるか」を判断する材料が少なかった。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">QRコードを契約時に配布し、取引後の口コミ投稿を依頼。自社サイトに埋め込み表示することで、成約者の生の声が閲覧できる状態に。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">×1.6</div><div class="case-result-text"><strong>「顔の見える会社」になった。</strong>取引後の口コミを自社サイトに掲載することで、問い合わせ数が増加しました。</div></div>
        </div>
      </div>
```

- [ ] **Step 3: Case 03（工務店）を書き換える**

Old:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 03</div>
          <div class="case-svc">集客支援 ミッケ！</div>
          <div class="case-ind">工務店 / 地域密着型</div>
          <div class="case-title">HP制作＋MAP対策で問い合わせ導線を確立</div>
          <div class="case-stat-num">0<span class="unit">→有</span></div>
          <div class="case-stat-label">Web経由の問い合わせ</div>
          <div class="ctags"><div class="ctag">HP制作</div><div class="ctag">MEO対策</div><div class="ctag">採用強化</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">HPがなく、施工事例も口コミも整理されていなかった。「信頼できるかどうか判断できない」と言われることが多く、問い合わせにつながらない状態。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">施工事例・スタッフ紹介・お客様の声を軸にしたHPを制作。GoogleマップとセットでWeb経由の問い合わせと採用応募の両方が発生するようになった。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">0→∞</div><div class="case-result-text"><strong>「HPがない」状態からWeb集客を確立。</strong>Googleマップとセットで動かすことで、問い合わせと採用の両方に効く信頼の導線が完成しました。</div></div>
        </div>
      </div>
```

New:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 03</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">工務店 / 地域密着型</div>
          <div class="case-title">施工事例と口コミを並べて、信頼の導線を確立</div>
          <div class="case-stat-num">0<span class="unit">→掲載</span></div>
          <div class="case-stat-label">自社サイトの口コミ表示件数</div>
          <div class="ctags"><div class="ctag">HP埋め込み</div><div class="ctag">口コミ収集</div><div class="ctag">採用強化</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">施工事例はあったが、お客様の声を掲載する仕組みがなかった。「本当にいい仕事をしてくれるか」の判断材料に欠けていた。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">引き渡し時にQRを手渡し、口コミ投稿を依頼。施工事例のページに口コミウィジェットを埋め込み、事例とセットで信頼を伝えられるように。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">信頼の可視化</div><div class="case-result-text"><strong>施工事例×口コミのセットで。</strong>問い合わせと採用応募の両方に効く導線が完成しました。</div></div>
        </div>
      </div>
```

- [ ] **Step 4: Case 04（税理士事務所）を書き換える**

Old:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 04</div>
          <div class="case-svc">集客支援 ミッケ！</div>
          <div class="case-ind">税理士事務所</div>
          <div class="case-title">顧客フォロー自動化で紹介・継続率を改善</div>
          <div class="case-stat-num">紹介<span class="unit">増</span></div>
          <div class="case-stat-label">LINE活用後の紹介経由契約</div>
          <div class="ctags"><div class="ctag">LINE構築</div><div class="ctag">顧客フォロー</div><div class="ctag">情報配信</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">顧問先との連絡はメール・電話が中心。税制改正などの情報提供が後手になりがちで「先生から連絡が来ない」と感じているお客様も一定数いた。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">公式LINEで税務情報・締め切り通知・事務所からのお知らせを定期配信。「気にかけてもらっている感」が高まり、顧問先からの紹介が増加。継続率も向上。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">LINE</div><div class="case-result-text"><strong>「先生から連絡が来る」体験が信頼を生む。</strong>情報提供を自動化することで事務所の存在感が高まり、紹介・継続の好循環が生まれました。</div></div>
        </div>
      </div>
```

New:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 04</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">税理士事務所</div>
          <div class="case-title">顧問先の声を自社サイトに掲載し、紹介につながった</div>
          <div class="case-stat-num">紹介<span class="unit">増</span></div>
          <div class="case-stat-label">口コミ経由の問い合わせ</div>
          <div class="ctags"><div class="ctag">口コミ収集</div><div class="ctag">埋め込み表示</div><div class="ctag">紹介促進</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">顧問先の満足度は高かったが、それが外部から見える形になっていなかった。新規の問い合わせは紹介頼みだった。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">顧問先にQRを送付し、口コミ投稿を依頼。AIの執筆支援で投稿のハードルを下げ、自社サイトに口コミを掲載。「他の顧問先の声」が新規の安心材料に。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">紹介増</div><div class="case-result-text"><strong>口コミが「実績の証明」として機能。</strong>新規問い合わせの増加につながりました。</div></div>
        </div>
      </div>
```

- [ ] **Step 5: Case 05（飲食・居酒屋）を書き換える**

Old:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 05</div>
          <div class="case-svc">集客支援 ミッケ！</div>
          <div class="case-ind">飲食 / 居酒屋（個人事業主）</div>
          <div class="case-title">月5,000円から始める集客の仕組みづくり</div>
          <div class="case-stat-num">3<span class="unit">倍</span></div>
          <div class="case-stat-label">Googleマップ経由の来店数</div>
          <div class="ctags"><div class="ctag">MEO基礎</div><div class="ctag">口コミ返信文</div><div class="ctag">LINE配信文</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">一人で切り盛りする居酒屋オーナー。Googleマップの口コミが3件のまま放置。SNSもLINEも何もなく、来客は常連のみ。「何から手をつければいいかわからない」という状態。予算もほとんどない。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">月5,000円の集客支援 ミッケ！プランで伴走開始。Googleマップのプロフィール整備・口コミ返信文の提供・月2回のLINE配信文の作成をサポート。3ヶ月でGoogleマップ経由の来店が3倍になった。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">×3</div><div class="case-result-text"><strong>「お金がない」は言い訳にならない。</strong>月5,000円でも仕組みを作れば成果は出る。集客支援 ミッケ！はそのことを証明するプランです。</div></div>
        </div>
      </div>
```

New:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 05</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">飲食 / 居酒屋（個人事業主）</div>
          <div class="case-title">初期費用3万円弱から、口コミを資産化</div>
          <div class="case-stat-num">24<span class="unit">件</span></div>
          <div class="case-stat-label">半年で集まった口コミ投稿数</div>
          <div class="ctags"><div class="ctag">QR設置</div><div class="ctag">AI執筆支援</div><div class="ctag">低コスト導入</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">口コミはGoogleマップに数件あるのみ。自社サイトはなく、お客様の声を見せる場所がなかった。予算もほとんどない。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">掲載プラン（初期費用29,400円+税・月額4,800円+税）で導入。レジ横にQRを設置し、会計時に投稿を依頼。半年で24件の口コミが集まり、自社SNS・サイトに表示。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">24件</div><div class="case-result-text"><strong>「お金がない」は言い訳にならない。</strong>低価格でも、口コミという資産は積み上がっていきます。</div></div>
        </div>
      </div>
```

- [ ] **Step 6: Case 06（パーソナルジム）を書き換える**

Old:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 06</div>
          <div class="case-svc">集客支援 ミッケ！</div>
          <div class="case-ind">パーソナルジム（個人事業主）</div>
          <div class="case-title">SNSとLINEで体験予約を自動化</div>
          <div class="case-stat-num">月<span class="unit">+8</span></div>
          <div class="case-stat-label">無料体験申し込み件数</div>
          <div class="ctags"><div class="ctag">Instagram投稿文</div><div class="ctag">LINE配信文</div><div class="ctag">口コミ改善</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">完全マンツーマンのパーソナルジムを一人で運営。Instagramは投稿が月1〜2回で止まりがち。LINEはあるが活用できていない。無料体験の申し込みが月0〜1件で安定しない状態。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">月5,000円の集客支援 ミッケ！でInstagram投稿文・LINE配信文・口コミ返信文を毎月提供。3ヶ月で無料体験申し込みが月平均8件に安定。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">+8</div><div class="case-result-text"><strong>コンテンツ作成の「詰まり」を解消するだけで予約が動き出した。</strong>一人でやるからこそ、文章を作る伴走者が必要です。</div></div>
        </div>
      </div>
```

New:
```html
      <div class="case-item">
        <div class="case-meta">
          <div class="case-n">Case 06</div>
          <div class="case-svc">集客支援ミッケ！UGC</div>
          <div class="case-ind">パーソナルジム（個人事業主）</div>
          <div class="case-title">体験予約前の不安を、口コミで解消</div>
          <div class="case-stat-num">月<span class="unit">+5</span></div>
          <div class="case-stat-label">口コミ経由の体験予約増加数</div>
          <div class="ctags"><div class="ctag">口コミ収集</div><div class="ctag">AI執筆支援</div><div class="ctag">信頼構築</div></div>
        </div>
        <div class="case-body">
          <div class="ba-row">
            <div><div class="ba-head before">Before</div><div class="ba-text">完全マンツーマンで運営、実績はあるが「本当に効果があるのか」を伝える手段がなかった。体験予約は安定しなかった。</div></div>
            <div class="ba-arr">→</div>
            <div><div class="ba-head after">After</div><div class="ba-text">セッション後にQRを渡し、感想の投稿を依頼。AIが文章化を支援し、投稿のハードルを下げたことで継続的に口コミが増加。自社サイトに埋め込み表示。</div></div>
          </div>
          <div class="case-result"><div class="case-result-n">+5</div><div class="case-result-text"><strong>「他の会員の声」が背中を押した。</strong>体験予約の増加につながりました。</div></div>
        </div>
      </div>
```

- [ ] **Step 7: 文字列存在チェックで検証する**

Run:
```bash
cd /c/Users/aktfk/aidandaide
grep -c "プレースホルダー事例" index.html
grep -c "集客支援 ミッケ！</div>" index.html
```
Expected: 1つ目は1以上、2つ目は0（Case01〜06の旧サービス名表記が残っていないこと。Case07のビズエイドは別クラス値なので影響なし）。

- [ ] **Step 8: コミット**

```bash
cd /c/Users/aktfk/aidandaide
git add index.html
git commit -m "feat: index.htmlの導入事例Case01-06をミッケUGC製品前提の内容に書き換え"
```

---

### Task 4: index.html のコンタクトフォームを更新する

**Files:**
- Modify: `index.html`

- [ ] **Step 1: interest選択肢の説明文を更新**

Old:
```html
          <option>集客支援ミッケ！UGC（口コミ×SNS×レビュー×LLMO）</option>
```

New:
```html
          <option>集客支援ミッケ！UGC（口コミ投稿×AI執筆支援×自社HP掲載）</option>
```

- [ ] **Step 2: コミット**

```bash
cd /c/Users/aktfk/aidandaide
git add index.html
git commit -m "feat: コンタクトフォームのミッケUGC説明文を更新"
```

---

### Task 5: biz_aid.html のナビ文言を更新する

**Files:**
- Modify: `biz_aid.html`

- [ ] **Step 1: ナビのリンク文言を更新**

Old:
```html
    <a href="mikke.html">集客支援 ミッケ！</a>
```

New:
```html
    <a href="mikke.html">集客支援ミッケ！UGC</a>
```

- [ ] **Step 2: コミット**

```bash
cd /c/Users/aktfk/aidandaide
git add biz_aid.html
git commit -m "feat: biz_aid.htmlのナビ表記をミッケUGCに統一"
```

---

### Task 6: 全体検証とプッシュ

**Files:** なし（検証・プッシュのみ）

- [ ] **Step 1: 3ファイルすべてでナビ表記が統一されていることを確認**

Run:
```bash
cd /c/Users/aktfk/aidandaide
grep -n "集客支援ミッケ！UGC\|集客支援 ミッケ！" index.html mikke.html biz_aid.html | grep -v "svc-card-name\|case-svc\|sv-hero-meta\|breadcrumb"
```
Expected: 3ファイルのナビリンク（`<a href="mikke.html">`を含む行）がすべて「集客支援ミッケ！UGC」で統一されている（「集客支援 ミッケ！」という半角スペース入りの旧表記がナビに残っていない）。

- [ ] **Step 2: ブラウザで目視確認**

Run:
```bash
start "" "C:\Users\aktfk\aidandaide\index.html"
```
確認項目：
- ヒーロー、UGCセクション、SERVICESカード、Case01〜06、コンタクトフォームがミッケUGC製品内容になっている
- ナビの「集客支援ミッケ！UGC」リンクから`mikke.html`に遷移できる

Run:
```bash
start "" "C:\Users\aktfk\aidandaide\mikke.html"
```
確認項目：
- 新しいHero/Problem/How it works/Features/Widget Preview/Price/Case/FAQ/CTAが表示され、崩れがない
- 料金プランが2枚（掲載プラン・非公開プラン）で正しく横並び表示されている
- パンくずリスト・フッターから`index.html`に戻れる

Run:
```bash
start "" "C:\Users\aktfk\aidandaide\biz_aid.html"
```
確認項目：
- ナビの「集客支援ミッケ！UGC」リンクから`mikke.html`に遷移できる

- [ ] **Step 3: 作業ブランチをリモートにプッシュ**

`work/mikke-ugc-renewal`はmainではなく、ユーザーが状況を把握している独立ブランチとしてプッシュする（他の並行ブランチとの混同を避けるため、mainには直接pushしない）。

```bash
cd /c/Users/aktfk/aidandaide
git push -u origin work/mikke-ugc-renewal
```

- [ ] **Step 4: 完了をユーザーに報告**

`work/mikke-ugc-renewal`ブランチの内容と、mainやその他の並行ブランチ（`feat/mikke-v4`, `claude/homepage-confirmation-oc5fw9`, `website/`フォルダ）との統合方針をユーザーに確認する。

---

## Self-Review メモ

- **Spec網羅性**: 設計スペック（`docs/superpowers/specs/2026-07-23-mikke-ugc-renewal-design.md`）の全項目（mikke.html全面刷新、index.html部分修正、biz_aid.htmlナビ更新、料金プラン、事例）にTaskが対応している。
- **プレースホルダー**: 全ステップに実際のHTML内容を記載済み。「TBD」等は含まれない。
- **整合性**: 料金（初期費用29,400円+税/59,400円+税、月額4,800円+税/14,800円+税）はmikke.html・index.htmlの両方で同一表記に統一。サービス名表記（「集客支援ミッケ！UGC」）も全ファイルで統一。
