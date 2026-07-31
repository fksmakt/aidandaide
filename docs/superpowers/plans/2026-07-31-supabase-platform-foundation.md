# Supabase基盤統合（site スキーマのみ）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aid & Aideの複数AIツール共有基盤となる新規Supabaseプロジェクトを作成し、`site`スキーマ（aidandaide.com用）と`public.staff_accounts`（将来のスタッフ管理画面用の土台）を構築する。aidandaide.comの問い合わせフォームをSupabaseに接続し、既存Formspreeと並列でデータを保存する。

**Architecture:** 新規Supabaseプロジェクトに`site`・`public`・`efshiumai`（空プレースホルダー）・`mikke_ugc`（空プレースホルダー）の4スキーマを作成する。`site.inquiries`テーブルはRLSで「anonロールはINSERTのみ許可、SELECT/UPDATE/DELETE不可」に絞り、aidandaide.com（GitHub Pages配信の静的HTML、ビルドステップなし）からブラウザで直接PostgREST APIにfetchでPOSTする。npmパッケージやCDNライブラリは追加せず、Node組み込みのfetchのみで完結させる。SQLはリポジトリに保存しつつ、実行はSupabase Studio SQL Editorへの手動貼り付けで行う（CLIログイン依存を避けるため）。

**Tech Stack:** Postgres (Supabase)、PostgREST REST API、素のJavaScript（fetch）、Node.js（検証スクリプト用、v24で動作確認済み）

**参照spec:** `docs/superpowers/specs/2026-07-31-supabase-platform-consolidation-design.md`

---

## 前提知識（エンジニア向け）

- `index.html`は`C:\Users\aktfk\aidandaide`直下の単一ファイル。GitHub Pagesでそのまま配信される（ビルドステップなし）。ロゴ等のbase64画像が埋め込まれているため、Readツールで全文を読むとトークン上限に達する。問い合わせフォーム周辺（807〜911行目）はこのplanのEdit stepに十分なコンテキストを含めているので、そのままEditできる。
- このリポジトリに`package.json`は存在しない（完全な静的サイト）。今回もnpm依存は追加しない。
- リポジトリ運用：mainブランチに直接コミット・push（ユーザーの明示的な希望、`[[feedback_push_always]]`）。各タスクごとにコミット・pushする。
- **Task 1はSupabase管理画面でのアカウント操作（新規プロジェクト作成）を含むため、ユーザー本人が実施する。** エージェントが自動実行する部分ではない。Task 1で得られる3つの値（Project URL、anon key、Project Ref）はTask 3以降で使うので、必ず控えること。
- 今回のスコープ：`site`スキーマと`public.staff_accounts`（土台のみ、ポリシー未設定）を作る。`efshiumai`・`mikke_ugc`スキーマは名前だけ確保する空のプレースホルダーとして作成し、テーブル追加・Exposed schemas登録・アプリからの接続は行わない（既存本番データの移行は別プランのスコープ）。

---

### Task 1: 新規Supabaseプロジェクトの作成（ユーザー作業）

**Files:** なし（Supabase管理画面での操作のみ）

- [ ] **Step 1: プロジェクトを作成する**

ユーザーが https://supabase.com/dashboard でログインし、「New project」から新規プロジェクトを作成する。

- Organization: 既存のAid & Aide用Organizationを使う（なければ新規作成）
- Project name: `aidandaide-platform`
- Database Password: 強力なパスワードを生成・保管（後続タスクでは使わないが、緊急時のpsql直接接続用に1Passwordなど安全な場所に保存しておく）
- Region: `Northeast Asia (Tokyo)`

- [ ] **Step 2: 接続情報を控える**

作成後、Project Settings → Data API から以下を控える：

- Project URL（例: `https://xxxxxxxxxxxxxxxx.supabase.co`）
- `anon` `public` key（Project Settings → API Keys）

これらは公開してよい値（anon keyはRLSで保護される前提の公開キー）。この2つの値をこのタスクの実行者がメモしておき、Task 3・Task 6で使用する。

- [ ] **Step 3: ユーザーに実施完了と値の共有を依頼する**

エージェントが実行する場合は、ここでユーザーに「Project URLとanon keyを教えてください」と確認を取ってから次のタスクに進むこと。

---

### Task 2: SQLマイグレーションファイルを作成する

**Files:**
- Create: `supabase/sql/2026-07-31-platform-foundation.sql`

- [ ] **Step 1: ディレクトリを作成しSQLファイルを書く**

```bash
mkdir -p supabase/sql
```

`supabase/sql/2026-07-31-platform-foundation.sql`:

```sql
-- Aid & Aide Supabase基盤: スキーマ分離の初期セットアップ
-- 実行方法: Supabase Studio の SQL Editor に全文を貼り付けて実行する。

-- 1. ツールごとのスキーマを作成
create schema if not exists site;
create schema if not exists efshiumai;   -- 今回は空のプレースホルダー（将来の移行用に名前のみ確保）
create schema if not exists mikke_ugc;   -- 今回は空のプレースホルダー（将来の移行用に名前のみ確保）

-- 2. site.inquiries: aidandaide.com の問い合わせフォーム保存先
create table site.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  tel text,
  industry text,
  interest text,
  message text,
  created_at timestamptz not null default now()
);

alter table site.inquiries enable row level security;
alter table site.inquiries force row level security;

-- anonロールはこのテーブルにのみ、INSERTのみ許可（SELECT/UPDATE/DELETEは一切許可しない）
grant usage on schema site to anon;
grant insert on site.inquiries to anon;

create policy inquiries_anon_insert on site.inquiries
  for insert
  to anon
  with check (true);

-- 3. public.staff_accounts: Aid & Aideスタッフの横断アカウント台帳（土台のみ）
create table public.staff_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff',
  tools text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.staff_accounts enable row level security;
alter table public.staff_accounts force row level security;
-- ポリシーは意図的に未定義。anon/authenticatedロールへのGRANTも行わないため、
-- 現時点ではservice_roleキー経由（RLSをバイパスする）以外からはアクセスできない。
-- 将来スタッフ管理画面を作る際に、authenticatedロール向けのSELECTポリシーを追加する。
```

- [ ] **Step 2: コミット**

```bash
git add supabase/sql/2026-07-31-platform-foundation.sql
git commit -m "$(cat <<'EOF'
feat: Supabase基盤統合の初期スキーマSQLを追加

site/efshiumai/mikke_ugc スキーマ作成、site.inquiries（anon INSERT限定RLS）、
public.staff_accounts（土台のみ）。実行はSupabase Studio SQL Editorで手動。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

---

### Task 3: SQLを実行し、Exposed schemasを設定する（ユーザー作業）

**Files:** なし（Supabase管理画面での操作のみ）

- [ ] **Step 1: SQLを実行する**

ユーザーがSupabase Studio → SQL Editorを開き、`supabase/sql/2026-07-31-platform-foundation.sql`の内容を貼り付けて実行する。

Expected: `Success. No rows returned` が表示される。エラーが出た場合はその場でエラーメッセージを報告し、原因を切り分ける（例えば`gen_random_uuid()`が使えない場合はPostgresバージョンを確認する）。

- [ ] **Step 2: Exposed schemasに`site`を追加する**

Project Settings → Data API → Exposed schemas に `site` を追加して保存する（`public`はデフォルトで既に含まれている）。`efshiumai`・`mikke_ugc`は今回のスコープ外のため追加しない。

- [ ] **Step 3: テーブルが見えることを確認する**

Table Editorで`site`スキーマを選択し、`inquiries`テーブルが表示されることを確認する。同様に`public`スキーマで`staff_accounts`テーブルが表示されることを確認する。

---

### Task 4: RLSの動作を検証するスクリプトを作成・実行する

**Files:**
- Create: `supabase/sql/verify-inquiries-rls.mjs`

- [ ] **Step 1: 検証スクリプトを書く**

`supabase/sql/verify-inquiries-rls.mjs`:

```javascript
// site.inquiries の RLS が意図通り（anonはINSERTのみ可、SELECT不可）か検証する。
// 実行: SUPABASE_URL と SUPABASE_ANON_KEY を環境変数で渡して `node supabase/sql/verify-inquiries-rls.mjs`

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('SUPABASE_URL と SUPABASE_ANON_KEY を環境変数で指定してください');
  process.exit(1);
}

async function main() {
  // 1. INSERTは成功するはず
  // 注意: Prefer は return=minimal を使う。return=representation にすると
  // PostgRESTはRETURNING句でid/created_at（クライアントが指定していないサーバー生成値）を
  // 読み戻そうとし、それにはSELECT権限が必要になる。今回anonにはSELECTを付与していないため、
  // return=representationだと正しい設定でも権限エラーになってしまう。
  const insertRes = await fetch(`${url}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'site',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: 'RLS検証テスト',
      email: 'rls-test@example.com',
      message: 'このレコードは検証用です。確認後Studioから削除してください。',
    }),
  });
  console.log('INSERT status:', insertRes.status);
  if (insertRes.status !== 201) {
    console.error('期待値: 201。INSERTが失敗しています。RLSポリシーかGRANTを確認してください。');
    process.exit(1);
  }

  // 2. SELECTは拒否されるはず（0件 or 権限エラー）
  const selectRes = await fetch(`${url}/rest/v1/inquiries?select=*`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Accept-Profile': 'site',
    },
  });
  const selectBody = await selectRes.json();
  console.log('SELECT status:', selectRes.status, 'body:', selectBody);
  if (selectRes.status === 200 && Array.isArray(selectBody) && selectBody.length > 0) {
    console.error('期待値: SELECTで既存データが返らないこと。anonにSELECT権限が付与されていないか確認してください。');
    process.exit(1);
  }

  console.log('OK: anonはINSERTのみ可能、SELECTは拒否されることを確認しました。');
}

main();
```

- [ ] **Step 2: 実行する**

Run:
```bash
SUPABASE_URL="<Task1で控えたProject URL>" SUPABASE_ANON_KEY="<Task1で控えたanon key>" node supabase/sql/verify-inquiries-rls.mjs
```

Expected:
```
INSERT status: 201
SELECT status: 200 body: []
OK: anonはINSERTのみ可能、SELECTは拒否されることを確認しました。
```

失敗した場合はTask 3のSQL実行内容・Exposed schemas設定を見直す。

- [ ] **Step 3: 検証用レコードを削除する**

Supabase Studio → Table Editor → `site.inquiries` から、Step 2で作成した`rls-test@example.com`のレコードを手動で削除する（service_roleでのTable Editor操作はRLSをバイパスするため削除可能）。

- [ ] **Step 4: コミット**

```bash
git add supabase/sql/verify-inquiries-rls.mjs
git commit -m "$(cat <<'EOF'
test: site.inquiries のRLS動作検証スクリプトを追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

---

### Task 5: 問い合わせフォームをSupabaseに接続する（Formspreeと並列送信）

**Files:**
- Modify: `index.html:875-911`

- [ ] **Step 1: フォーム送信ハンドラを書き換える**

`index.html`の現在の内容（807〜911行目、フォームおよび送信スクリプト）のうち、`<script>`ブロック（875〜911行目）を以下に置き換える。`<SUPABASE_URL>`と`<SUPABASE_ANON_KEY>`はTask 1で控えた実際の値に置き換えること。

Edit対象（`old_string`）:
```html
<script>
const form = document.getElementById('contact-form');
if(form){
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = form.querySelector('.form-btn');
    const formId = form.action.includes('YOUR_FORM_ID');
    if(formId){
      btn.textContent = '送信しました ✓（Formspree設定後に実際に届きます）';
      btn.style.background = '#1a6b3c';
      btn.disabled = true;
      setTimeout(()=>{btn.textContent='送信する →';btn.style.background='';btn.disabled=false;form.reset();},4000);
      return;
    }
    btn.textContent = '送信中...';
    btn.disabled = true;
    try{
      const res = await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      if(res.ok){
        btn.textContent = '送信しました ✓';
        btn.style.background = '#1a6b3c';
        form.reset();
        const thanks = document.getElementById('thanks-msg');
        if(thanks) thanks.style.display = 'block';
        setTimeout(()=>{btn.textContent='送信する →';btn.style.background='';btn.disabled=false;},4000);
      } else {
        btn.textContent = 'エラーが発生しました。再度お試しください。';
        btn.style.background = 'var(--blue)';
        btn.disabled = false;
      }
    } catch(err){
      btn.textContent = 'エラーが発生しました。';
      btn.disabled = false;
    }
  });
}
</script>
```

置き換え後（`new_string`）:
```html
<script>
const SUPABASE_URL = '<SUPABASE_URL>';
const SUPABASE_ANON_KEY = '<SUPABASE_ANON_KEY>';

function sendInquiryToSupabase(formData){
  const payload = {
    name: formData.get('name'),
    company: formData.get('company') || null,
    email: formData.get('email'),
    tel: formData.get('tel') || null,
    industry: formData.get('industry') || null,
    interest: formData.get('interest') || null,
    message: formData.get('message') || null,
  };
  fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'site',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  }).catch(err => console.error('Supabaseへの問い合わせ保存に失敗しました（Formspree送信には影響しません）', err));
}

const form = document.getElementById('contact-form');
if(form){
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = form.querySelector('.form-btn');
    const formId = form.action.includes('YOUR_FORM_ID');
    if(formId){
      btn.textContent = '送信しました ✓（Formspree設定後に実際に届きます）';
      btn.style.background = '#1a6b3c';
      btn.disabled = true;
      setTimeout(()=>{btn.textContent='送信する →';btn.style.background='';btn.disabled=false;form.reset();},4000);
      return;
    }
    btn.textContent = '送信中...';
    btn.disabled = true;
    const formData = new FormData(form);
    sendInquiryToSupabase(formData);
    try{
      const res = await fetch(form.action,{method:'POST',body:formData,headers:{Accept:'application/json'}});
      if(res.ok){
        btn.textContent = '送信しました ✓';
        btn.style.background = '#1a6b3c';
        form.reset();
        const thanks = document.getElementById('thanks-msg');
        if(thanks) thanks.style.display = 'block';
        setTimeout(()=>{btn.textContent='送信する →';btn.style.background='';btn.disabled=false;},4000);
      } else {
        btn.textContent = 'エラーが発生しました。再度お試しください。';
        btn.style.background = 'var(--blue)';
        btn.disabled = false;
      }
    } catch(err){
      btn.textContent = 'エラーが発生しました。';
      btn.disabled = false;
    }
  });
}
</script>
```

**設計上のポイント:** `sendInquiryToSupabase`は`await`せず、結果を待たずに投げっぱなしにする。Supabase書き込みが失敗してもFormspree送信・ユーザーへの成功表示には一切影響させない（Formspreeが引き続き主のメール通知経路のため）。

- [ ] **Step 2: 変更箇所をgrepで確認する**

Run: `grep -n "SUPABASE_URL\|sendInquiryToSupabase" index.html`
Expected: 追加した2箇所（定数定義と呼び出し）がヒットする。

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: 問い合わせフォームをSupabase(site.inquiries)に接続

Formspreeと並列でSupabaseにも保存する。Supabase側の書き込み失敗は
ユーザー体験・Formspree送信に影響しない設計。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

---

### Task 6: ブラウザで動作確認する

**Files:** なし（動作確認のみ）

- [ ] **Step 1: ローカルでindex.htmlを開く**

Run: `start index.html`（Windows）または任意のローカルサーバーで配信して開く。

- [ ] **Step 2: 問い合わせフォームに入力し送信する**

「お名前」「メールアドレス」に適当な値（テストと分かる値、例: `動作確認テスト` / `test@example.com`）を入力し、送信する。

Expected:
- ボタンが「送信しました ✓」に変わる
- ブラウザのDevTools → Networkタブで、`formspree.io`へのリクエストと`<SUPABASE_URL>/rest/v1/inquiries`へのリクエストの両方が発生し、どちらも成功ステータス（200番台）であること

- [ ] **Step 3: Supabase Studioでレコードを確認する**

Supabase Studio → Table Editor → `site.inquiries`を開き、Step 2で送信したテストレコードが保存されていることを確認する。

- [ ] **Step 4: テストレコードを削除する**

Table Editorから、Step 2で作成したテストレコードを削除する。

- [ ] **Step 5: ユーザーに完了報告する**

Formspreeのメール（`fukushima@aidandaide.com`宛）にもテスト送信が届いているか、ユーザーに確認を依頼する。

---

## 将来のタスク（本プランのスコープ外）

- efshiumai・mikke-ugcの既存本番データをこの新規プロジェクトへ移行する計画（別途プラン作成）
- `public.staff_accounts`を使ったスタッフ向け管理画面（問い合わせ一覧閲覧など）の実装
- `efshiumai`・`mikke_ugc`スキーマへのテーブル追加とExposed schemas登録
