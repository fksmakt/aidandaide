# Supabase基盤統合（efshiumai・mikke-ugc・site 全体）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aid & Aideの複数AIツール共有基盤となる新規Supabaseプロジェクトを作成し、`efshiumai`（シフト管理）・`mikke_ugc`（UGC収集SaaS）・`site`（aidandaide.com問い合わせ）の3スキーマと`public.staff_accounts`（将来のスタッフ管理画面用の土台）を構築する。efshiumai・mikke-ugcの2アプリの接続先を新プロジェクトに切り替え、aidandaide.comの問い合わせフォームをSupabaseに接続する。

**Architecture:** 新規Supabaseプロジェクトに`efshiumai`・`mikke_ugc`・`site`・`public`の4スキーマを作成する。efshiumai・mikke-ugcはいずれも本番データを持たないデモ/開発段階（2026-07-31にユーザー確認済み）のため、既存の4件・5件のマイグレーションSQLを内容そのまま新スキーマ配下に再作成し（データ移行ではなくスキーマの再構築）、各アプリのSupabaseクライアント初期化コードに`db: { schema: 'xxx' }`を追加して向き先を切り替える。`site.inquiries`はRLSで「anonロールはINSERTのみ許可」に絞り、aidandaide.com（静的HTML）からブラウザで直接PostgREST APIにfetchでPOSTする。カスタムスキーマはSupabaseのデフォルトブートストラップ対象外（`public`のみ自動で権限が設定される）のため、**全カスタムスキーマで`service_role`への明示的なGRANTが必須**（後述）。SQLはリポジトリに保存しつつ、実行はSupabase Studio SQL Editorへの手動貼り付けで行う（CLIログイン依存を避けるため）。

**Tech Stack:** Postgres (Supabase)、PostgREST REST API、Next.js（efshiumai・mikke-ugc）、素のJavaScript（aidandaide.com、fetch）、Node.js（検証スクリプト用）

**参照spec:** `docs/superpowers/specs/2026-07-31-supabase-platform-consolidation-design.md`

---

## 前提知識（エンジニア向け）

- **重要: カスタムスキーマのservice_role権限。** Supabaseは`public`スキーマにのみ、プロジェクト作成時に`anon`/`authenticated`/`service_role`への既定GRANTを自動設定する。今回作る`efshiumai`・`mikke_ugc`・`site`スキーマは対象外なので、**`service_role`であってもGRANTなしではテーブルにアクセスできない**（RLSをバイパスする権限と、テーブルへの基本アクセス権限は別物）。各スキーマのSQLに`grant ... to service_role`を必ず含めること。（参考: [Using Custom Schemas | Supabase Docs](https://supabase.com/docs/guides/api/using-custom-schemas)）
- **efshiumai** (`C:\Users\aktfk\efshiumai`)・**mikke-ugc** (`C:\Users\aktfk\Documents\mikke-ugc`) はいずれも2026-07-31時点で本番データなし（デモ/開発段階）。既存Supabaseプロジェクトの中身は両方とも「消えても再現できるデータ」のみ：efshiumaiは`npm run seed`で再生成、mikke-ugcはアプリのUIから再作成する。
- リポジトリ運用：3リポジトリとも、mainブランチに直接コミット・push（aidandaideは`[[feedback_push_always]]`の希望どおり。efshiumai・mikke-ugcも同様の運用と仮定し、各タスクごとにコミット・push、pushできない場合はその場でユーザーに確認する）。
- **Task 1・Task 3・Task 5はSupabase管理画面／Studioでの操作を含み、SQL実行やプロジェクト作成はユーザー本人が行う。** エージェントが自動実行できない部分は明記している。
- 旧Supabaseプロジェクト（efshiumai: `wtmkihghahtcqicaassu`、mikke-ugc: 各自の`.env.local`のURLで確認）は、Task 9で新プロジェクトでの動作確認が取れてからPause（一時停止）する。削除はしない。

---

### Task 1: 新規Supabaseプロジェクトの作成（ユーザー作業）

**Files:** なし（Supabase管理画面での操作のみ）

- [ ] **Step 1: プロジェクトを作成する**

ユーザーが https://supabase.com/dashboard でログインし、「New project」から新規プロジェクトを作成する。

- Organization: 既存のAid & Aide用Organizationを使う（なければ新規作成。Free plan枠が既存プロジェクトで埋まっている場合は新規Organizationを作るか、Pro planへのアップグレードを検討する）
- Project name: `aidandaide-platform`
- Database Password: 強力なパスワードを生成・保管
- Region: `Northeast Asia (Tokyo)`

- [ ] **Step 2: 接続情報を控える**

作成後、Project Settings → Data API から以下を控える：

- Project URL（例: `https://xxxxxxxxxxxxxxxx.supabase.co`）
- `anon` `public` key
- `service_role` `secret` key（Project Settings → API Keys。取り扱い注意、Gitに絶対コミットしない）

- [ ] **Step 3: ユーザーに実施完了と値の共有を依頼する**

エージェントが実行する場合は、ここでユーザーに「Project URL・anon key・service_role keyを教えてください」と確認を取ってから次のタスクに進むこと。

---

### Task 2: 基盤SQL（スキーマ作成・site・staff_accounts）を作成・実行する

**Files:**
- Create: `supabase/sql/2026-07-31-platform-foundation.sql`（aidandaideリポジトリ内）

- [ ] **Step 1: SQLファイルを書く**

```bash
mkdir -p supabase/sql
```

`supabase/sql/2026-07-31-platform-foundation.sql`:

```sql
-- Aid & Aide Supabase基盤: スキーマ作成 + site + staff_accounts の初期セットアップ
-- 実行方法: Supabase Studio の SQL Editor に全文を貼り付けて実行する。

-- 1. ツールごとのスキーマを作成
create schema if not exists site;
create schema if not exists efshiumai;
create schema if not exists mikke_ugc;

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

-- service_role（将来のスタッフ管理画面用）はカスタムスキーマなので明示GRANTが必須
grant usage on schema site to service_role;
grant all on all tables in schema site to service_role;
alter default privileges in schema site grant all on tables to service_role;

-- 3. public.staff_accounts: Aid & Aideスタッフの横断アカウント台帳（土台のみ）
-- publicスキーマはSupabaseのデフォルトブートストラップでanon/authenticated/service_roleに
-- 既定GRANTが設定済みのため、ここでは明示GRANTは不要。RLSのみで制御する。
create table public.staff_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff',
  tools text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.staff_accounts enable row level security;
alter table public.staff_accounts force row level security;
-- ポリシーは意図的に未定義。anon/authenticatedロールはRLSで拒否される。
-- service_role（RLSをバイパスする）以外からはアクセスできない。
-- 将来スタッフ管理画面を作る際に、authenticatedロール向けのSELECTポリシーを追加する。
```

- [ ] **Step 2: コミット**

```bash
git add supabase/sql/2026-07-31-platform-foundation.sql
git commit -m "$(cat <<'EOF'
feat: Supabase基盤統合の初期スキーマSQLを追加

site/efshiumai/mikke_ugc スキーマ作成、site.inquiries（anon INSERT限定RLS
+ service_role明示GRANT）、public.staff_accounts（土台のみ）。
実行はSupabase Studio SQL Editorで手動。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

- [ ] **Step 3: SQLを実行する（ユーザー作業）**

ユーザーがSupabase Studio → SQL Editorを開き、上記SQLの内容を貼り付けて実行する。

Expected: `Success. No rows returned` が表示される。

- [ ] **Step 4: Exposed schemasを設定する（ユーザー作業）**

Project Settings → Data API → Exposed schemas に `site`, `efshiumai`, `mikke_ugc` を追加して保存する（`public`はデフォルトで既に含まれている）。

- [ ] **Step 5: テーブルが見えることを確認する**

Table Editorで`site`スキーマを選択し、`inquiries`テーブルが表示されることを確認する。`public`スキーマで`staff_accounts`テーブルが表示されることを確認する。

---

### Task 3: efshiumaiスキーマのテーブルをSQLで作成する

**Files:**
- Create: `supabase/sql/2026-07-31-migrate-to-platform-schema.sql`（efshiumaiリポジトリ内）

既存の`supabase/migrations/0001〜0004`の内容を、`efshiumai`スキーマ配下にまとめて再作成する（マイグレーション履歴の再生ではなく、最終形を1つのSQLとして書き下ろす）。

- [ ] **Step 1: SQLファイルを書く**

```bash
cd "C:\Users\aktfk\efshiumai"
mkdir -p supabase/sql
```

`supabase/sql/2026-07-31-migrate-to-platform-schema.sql`:

```sql
-- efshiumai: 新Supabaseプロジェクトの efshiumai スキーマにテーブルを作成する
-- 実行方法: Supabase Studio の SQL Editor に全文を貼り付けて実行する。
-- 既存 supabase/migrations/0001〜0004 の最終形を1つにまとめたもの（データ移行ではなくスキーマ再構築）。

create table efshiumai.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site_type text not null check (site_type in ('store', 'factory')),
  is_active boolean not null default true
);

create table efshiumai.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  venue text not null,
  start_date date not null,
  end_date date not null,
  time_slots jsonb not null default '[]',
  apply_deadline timestamptz not null,
  status text not null default 'recruiting' check (status in ('recruiting', 'closed', 'confirmed'))
);

create table efshiumai.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin_hash text not null,
  home_site_id uuid references efshiumai.sites(id),
  employment_type text not null,
  max_hours_per_month int,
  max_days_per_week int,
  skills text[] not null default '{}',
  hourly_wage int,
  is_active boolean not null default true,
  is_admin boolean not null default false
);

create table efshiumai.staff_sites (
  staff_id uuid not null references efshiumai.staff(id) on delete cascade,
  site_id uuid not null references efshiumai.sites(id) on delete cascade,
  can_join_events boolean not null default false,
  primary key (staff_id, site_id)
);

create table efshiumai.submission_periods (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references efshiumai.sites(id),
  target_month date not null,
  open_at timestamptz not null,
  close_at timestamptz not null
);

create table efshiumai.shift_requests (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references efshiumai.staff(id),
  site_id uuid not null references efshiumai.sites(id),
  target_date date not null,
  time_slot text not null,
  note text,
  submitted_at timestamptz not null default now()
);

create table efshiumai.event_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references efshiumai.events(id),
  staff_id uuid not null references efshiumai.staff(id),
  available_dates date[] not null,
  note text,
  applied_at timestamptz not null default now()
);

create table efshiumai.shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references efshiumai.staff(id),
  site_id uuid references efshiumai.sites(id),
  event_id uuid references efshiumai.events(id),
  work_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  break_start time,
  break_end time,
  check (
    (site_id is not null and event_id is null) or
    (site_id is null and event_id is not null)
  )
);

create table efshiumai.settings (
  site_id uuid primary key references efshiumai.sites(id),
  time_slots jsonb not null default '[]',
  required_staff jsonb not null default '{}'
);

create table efshiumai.company_settings (
  id int primary key default 1 check (id = 1),
  rounding_policy text not null default 'per_minute' check (rounding_policy in ('per_minute', 'monthly_rounding'))
);

create table efshiumai.staff_weekday_patterns (
  staff_id uuid not null references efshiumai.staff(id) on delete cascade,
  site_id uuid not null references efshiumai.sites(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  time_slot text,
  primary key (staff_id, site_id, weekday)
);

-- RLSを全テーブルで有効化。ポリシーは追加しない = anon/authenticatedロールからは既定で拒否。
alter table efshiumai.sites enable row level security;
alter table efshiumai.events enable row level security;
alter table efshiumai.staff enable row level security;
alter table efshiumai.staff_sites enable row level security;
alter table efshiumai.submission_periods enable row level security;
alter table efshiumai.shift_requests enable row level security;
alter table efshiumai.event_applications enable row level security;
alter table efshiumai.shifts enable row level security;
alter table efshiumai.settings enable row level security;
alter table efshiumai.company_settings enable row level security;
alter table efshiumai.staff_weekday_patterns enable row level security;

-- service_role（Next.jsサーバー側のみが保持するキー）専用スキーマ。
-- カスタムスキーマはSupabaseの既定GRANT対象外のため、明示GRANTが必須。
-- anon/authenticatedには一切GRANTしない（アプリはクライアント側からSupabaseに直接アクセスしないため）。
grant usage on schema efshiumai to service_role;
grant all on all tables in schema efshiumai to service_role;
alter default privileges in schema efshiumai grant all on tables to service_role;
```

- [ ] **Step 2: コミット**

```bash
git add supabase/sql/2026-07-31-migrate-to-platform-schema.sql
git commit -m "$(cat <<'EOF'
feat: 新Supabaseプロジェクトのefshiumaiスキーマ用SQLを追加

既存4マイグレーションの最終形をefshiumaiスキーマ配下にまとめ、
service_roleへの明示GRANTを追加。実行はSupabase Studio SQL Editorで手動。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

- [ ] **Step 3: SQLを実行する（ユーザー作業）**

ユーザーがSupabase Studio → SQL Editorで上記SQLを実行する。

Expected: `Success. No rows returned`。Table EditorでSchemaを`efshiumai`に切り替え、11テーブルが表示されることを確認する。

---

### Task 4: efshiumaiアプリを新プロジェクトに接続し直す

**Files:**
- Modify: `lib/supabase/server.ts`
- Modify: `scripts/seed.ts`
- Modify: `.env.local`（ユーザーのローカル環境、Gitには含まれない）

- [ ] **Step 1: サービスロールクライアントにスキーマ指定を追加する**

`lib/supabase/server.ts`の現在の内容:

```typescript
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars are not set')

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
```

これを以下に置き換える:

```typescript
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars are not set')

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'efshiumai' },
  })
}
```

- [ ] **Step 2: シードスクリプトにもスキーマ指定を追加する**

`scripts/seed.ts`の13行目、現在の内容:

```typescript
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
```

これを以下に置き換える:

```typescript
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'efshiumai' },
})
```

- [ ] **Step 3: 変更をgrepで確認する**

Run: `grep -rn "db: { schema: 'efshiumai' }" lib/supabase/server.ts scripts/seed.ts`
Expected: 2ファイルともヒットする。

- [ ] **Step 4: コミット**

```bash
git add lib/supabase/server.ts scripts/seed.ts
git commit -m "$(cat <<'EOF'
feat: Supabaseクライアントをefshiumaiスキーマに向ける

Aid & Aide共有Supabaseプロジェクトへの移行に伴い、
db.schemaオプションでefshiumaiスキーマを固定する。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

- [ ] **Step 5: ローカルの`.env.local`を新プロジェクトの値に差し替える（ユーザー作業）**

`.env.local`の`NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`・`SUPABASE_SERVICE_ROLE_KEY`を、Task 1で控えた新プロジェクトの値に書き換える。`ADMIN_SEED_EMAIL`・`ADMIN_SEED_PASSWORD`・`STAFF_SESSION_SECRET`は既存の値のままでよい。

- [ ] **Step 6: シードを実行する**

Run: `npm run seed`
Expected: `Seed complete.` と表示され、エラーが出ないこと。エラーが出た場合、`permission denied for schema efshiumai`のようなメッセージが出ていればTask 3のGRANT文を再確認する。

- [ ] **Step 7: ローカルで動作確認する**

Run: `npm run dev`

ブラウザで `http://localhost:3000` を開き、スタッフPIN `1234` でログインし、シフト希望提出画面が表示されることを確認する。管理者ログイン（`.env.local`の`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`）でダッシュボードが表示されることを確認する。

- [ ] **Step 8: Vercelの環境変数を更新する（ユーザー作業）**

Vercelダッシュボード → efshiumaiプロジェクト → Settings → Environment Variablesで、`NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`・`SUPABASE_SERVICE_ROLE_KEY`を新プロジェクトの値に更新し、再デプロイする。

---

### Task 5: mikke_ugcスキーマのテーブルをSQLで作成する

**Files:**
- Create: `supabase/sql/2026-07-31-migrate-to-platform-schema.sql`（mikke-ugcリポジトリ内）

- [ ] **Step 1: SQLファイルを書く**

```bash
cd "C:\Users\aktfk\Documents\mikke-ugc"
mkdir -p supabase/sql
```

`supabase/sql/2026-07-31-migrate-to-platform-schema.sql`:

```sql
-- mikke-ugc: 新Supabaseプロジェクトの mikke_ugc スキーマにテーブルを作成する
-- 実行方法: Supabase Studio の SQL Editor に全文を貼り付けて実行する。
-- 既存 supabase/migrations/001〜005 の最終形を1つにまとめたもの（データ移行ではなくスキーマ再構築）。

create table mikke_ugc.shops (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users not null,
  name           text not null,
  slug           text unique not null,
  plan           text not null default 'basic' check (plan in ('basic', 'business', 'premium')),
  external_links jsonb not null default '{}',
  widget_config  jsonb not null default '{}',
  created_at     timestamptz not null default now()
);

alter table mikke_ugc.shops enable row level security;

create policy "owners can manage their shop"
  on mikke_ugc.shops for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "public can read shops for widget"
  on mikke_ugc.shops for select
  using (true);

create table mikke_ugc.keyword_tags (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid references mikke_ugc.shops(id) on delete cascade not null,
  label      text not null,
  category   text,
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table mikke_ugc.keyword_tags enable row level security;

create policy "owners can manage their tags"
  on mikke_ugc.keyword_tags for all
  using (shop_id in (select id from mikke_ugc.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from mikke_ugc.shops where owner_id = auth.uid()));

create policy "public can read active tags"
  on mikke_ugc.keyword_tags for select
  using (is_active = true);

create table mikke_ugc.reviews (
  id                  uuid primary key default gen_random_uuid(),
  shop_id             uuid references mikke_ugc.shops(id) on delete cascade not null,
  rating              int not null check (rating between 1 and 5),
  selected_tags       jsonb not null default '[]',
  raw_comment         text,
  generated_text      text,
  final_text          text,
  reviewer_name       text,
  display_order       int not null default 0,
  is_visible          boolean not null default true,
  is_approved         boolean not null default false,
  posted_to           jsonb not null default '{}',
  title               text,
  category_ratings    jsonb not null default '{}',
  photos              jsonb not null default '[]',
  email               text,
  purchase_city       text,
  purchase_prefecture text,
  created_at          timestamptz not null default now()
);

alter table mikke_ugc.reviews enable row level security;

create policy "public can insert reviews"
  on mikke_ugc.reviews for insert
  with check (true);

create policy "public can read approved reviews"
  on mikke_ugc.reviews for select
  using (is_visible = true and is_approved = true);

create policy "owners can manage their reviews"
  on mikke_ugc.reviews for all
  using (shop_id in (select id from mikke_ugc.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from mikke_ugc.shops where owner_id = auth.uid()));

create index idx_reviews_purchase_prefecture on mikke_ugc.reviews(purchase_prefecture) where purchase_prefecture is not null;
create index idx_reviews_purchase_city on mikke_ugc.reviews(purchase_city) where purchase_city is not null;

create table mikke_ugc.rating_categories (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid references mikke_ugc.shops(id) on delete cascade not null,
  label      text not null,
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table mikke_ugc.rating_categories enable row level security;

create policy "owners can manage rating categories"
  on mikke_ugc.rating_categories for all
  using (shop_id in (select id from mikke_ugc.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from mikke_ugc.shops where owner_id = auth.uid()));

create policy "public can read active rating categories"
  on mikke_ugc.rating_categories for select
  using (is_active = true);

-- anon/authenticated/service_roleへの権限。カスタムスキーマは既定GRANT対象外のため全ロール明示指定が必須。
-- 行レベルの実際の制御は上記RLSポリシーで行う（既存プロジェクトのpublicスキーマと同じパターン）。
grant usage on schema mikke_ugc to anon, authenticated, service_role;
grant all on all tables in schema mikke_ugc to anon, authenticated, service_role;
grant all on all sequences in schema mikke_ugc to anon, authenticated, service_role;
alter default privileges in schema mikke_ugc grant all on tables to anon, authenticated, service_role;
alter default privileges in schema mikke_ugc grant all on sequences to anon, authenticated, service_role;

-- Supabase Storage（review-photosバケット）: プロジェクト共通のグローバルリソース。スキーマの概念とは独立。
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

create policy "Anyone can upload review photos"
  on storage.objects for insert
  with check (bucket_id = 'review-photos');

create policy "Public can read review photos"
  on storage.objects for select
  using (bucket_id = 'review-photos');
```

- [ ] **Step 2: コミット**

```bash
git add supabase/sql/2026-07-31-migrate-to-platform-schema.sql
git commit -m "$(cat <<'EOF'
feat: 新Supabaseプロジェクトのmikke_ugcスキーマ用SQLを追加

既存5マイグレーションの最終形をmikke_ugcスキーマ配下にまとめ、
anon/authenticated/service_roleへの明示GRANTとStorageバケット設定を追加。
実行はSupabase Studio SQL Editorで手動。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

- [ ] **Step 3: SQLを実行する（ユーザー作業）**

ユーザーがSupabase Studio → SQL Editorで上記SQLを実行する。

Expected: `Success. No rows returned`。Table EditorでSchemaを`mikke_ugc`に切り替え、4テーブル（shops, keyword_tags, reviews, rating_categories）が表示されることを確認する。Storage → Bucketsで`review-photos`バケットが表示されることを確認する。

---

### Task 6: mikke-ugcアプリを新プロジェクトに接続し直す

**Files:**
- Modify: `lib/supabase/admin.ts`
- Modify: `lib/supabase/server.ts`
- Modify: `lib/supabase/client.ts`
- Modify: `.env.local`（ユーザーのローカル環境、Gitには含まれない）

- [ ] **Step 1: 管理者クライアントにスキーマ指定を追加する**

`lib/supabase/admin.ts`の現在の内容:

```typescript
import { createClient } from '@supabase/supabase-js'

// service_role キーを使う管理者クライアント（RLSをバイパス。サーバー側専用）
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

これを以下に置き換える:

```typescript
import { createClient } from '@supabase/supabase-js'

// service_role キーを使う管理者クライアント（RLSをバイパス。サーバー側専用）
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'mikke_ugc' },
    }
  )
}
```

- [ ] **Step 2: サーバークライアント（Cookieベース）にスキーマ指定を追加する**

`lib/supabase/server.ts`の現在の内容:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

これを以下に置き換える:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'mikke_ugc' },
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: ブラウザクライアントにスキーマ指定を追加する**

`lib/supabase/client.ts`の現在の内容:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

これを以下に置き換える:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'mikke_ugc' } }
  )
}
```

- [ ] **Step 4: 変更をgrepで確認する**

Run: `grep -rn "db: { schema: 'mikke_ugc' }" lib/supabase/`
Expected: 3ファイルともヒットする。

- [ ] **Step 5: コミット**

```bash
git add lib/supabase/admin.ts lib/supabase/server.ts lib/supabase/client.ts
git commit -m "$(cat <<'EOF'
feat: Supabaseクライアントをmikke_ugcスキーマに向ける

Aid & Aide共有Supabaseプロジェクトへの移行に伴い、
db.schemaオプションでmikke_ugcスキーマを固定する。

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RymW2jzumNbNjfS6zvv2zW
EOF
)"
git push origin main
```

- [ ] **Step 6: ローカルの`.env.local`を新プロジェクトの値に差し替える（ユーザー作業）**

`.env.local`の`NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`を新プロジェクトの値に書き換え、`SUPABASE_SERVICE_ROLE_KEY`（`admin.ts`が要求するが`.env.local.example`には記載がなかった変数）と`MASTER_EMAILS`（マスター管理者として扱うメールアドレス、カンマ区切り）を追加する。

- [ ] **Step 7: マスターアカウントを作成する（ユーザー作業）**

Supabase Studio → Authentication → Users → Add user で、`MASTER_EMAILS`に設定したメールアドレスのユーザーを作成する（Auto Confirm Userを有効にする）。

- [ ] **Step 8: ローカルで動作確認する**

Run: `npm run dev`

ブラウザで `http://localhost:3000/login` を開き、Step 7で作成したマスターアカウントでログインする。ログイン後、店舗の新規作成・オーナーアカウントの発行ができることを確認する（`/api/master/owner`を叩く画面から）。作成した店舗のスラッグで `http://localhost:3000/api/widget/<slug>` にアクセスし、JSONレスポンスが返ることを確認する。

エラーが出た場合、`permission denied for schema mikke_ugc`のようなメッセージであればTask 5のGRANT文を再確認する。

- [ ] **Step 9: Vercelの環境変数を更新する（ユーザー作業）**

Vercelダッシュボード → mikke-ugcプロジェクト → Settings → Environment Variablesで、Step 6・7の値を反映し、再デプロイする。

---

### Task 7: site.inquiriesのRLS動作を検証するスクリプトを作成・実行する

**Files:**
- Create: `supabase/sql/verify-inquiries-rls.mjs`（aidandaideリポジトリ内）

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

- [ ] **Step 3: 検証用レコードを削除する**

Supabase Studio → Table Editor → `site.inquiries` から、Step 2で作成した`rls-test@example.com`のレコードを手動で削除する。

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

### Task 8: 問い合わせフォームをSupabaseに接続する（Formspreeと並列送信）

**Files:**
- Modify: `index.html:875-911`（aidandaideリポジトリ内）

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

- [ ] **Step 4: ブラウザで動作確認する**

Run: `start index.html`（Windows）

問い合わせフォームに「お名前」「メールアドレス」を入力して送信し、ボタンが「送信しました ✓」に変わることを確認する。DevTools → Networkタブで`formspree.io`と`<SUPABASE_URL>/rest/v1/inquiries`の両方が200/201系で成功していることを確認する。Supabase Studio → Table Editor → `site.inquiries`にレコードが保存されていることを確認したら、そのテストレコードを削除する。

---

### Task 9: 全体の動作確認と旧プロジェクトの一時停止

**Files:** なし（動作確認・Supabase管理画面での操作のみ）

- [ ] **Step 1: efshiumaiの本番デプロイを確認する**

Task 4 Step 8でVercelを再デプロイした後、`https://efshiumai.vercel.app`にアクセスし、PINログイン・管理者ログインが新プロジェクトに対して動作することを確認する。

- [ ] **Step 2: mikke-ugcの本番デプロイを確認する**

Task 6 Step 9でVercelを再デプロイした後、mikke-ugcの本番URLでマスターログイン・店舗表示が新プロジェクトに対して動作することを確認する。

- [ ] **Step 3: aidandaide.comの問い合わせフォームを本番で確認する（ユーザー作業）**

GitHub Pagesへのpush後、https://aidandaide.com の問い合わせフォームから実際に送信し、Formspreeのメールが届くこと・Supabase Studioにレコードが保存されることを確認する。テストレコードは削除する。

- [ ] **Step 4: 旧Supabaseプロジェクトを一時停止する（ユーザー作業）**

Step 1〜3がすべて確認できたら、efshiumaiの旧プロジェクト（`wtmkihghahtcqicaassu`）とmikke-ugcの旧プロジェクトをそれぞれのSupabaseダッシュボードからPauseする。削除はしない（しばらく様子を見てから、ユーザーの判断で別途削除する）。

---

## 将来のタスク（本プランのスコープ外）

- `public.staff_accounts`を使ったスタッフ向け管理画面（問い合わせ一覧閲覧、店舗横断ダッシュボードなど）の実装
- efshiumaiのSupabase Auth移行（必要になった場合）
- 旧Supabaseプロジェクトの削除判断
