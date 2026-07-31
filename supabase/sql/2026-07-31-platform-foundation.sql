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
