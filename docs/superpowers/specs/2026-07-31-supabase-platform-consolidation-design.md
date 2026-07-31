# AI支援ツール群のSupabase基盤統合 設計

## 背景・目的

Aid & Aideが提供する複数のAI支援ツール（efshiumai＝笑福シウマイ様向けシフト管理、mikke-ugc＝自社UGC収集SaaS、今後追加予定のツール）と自社サイトaidandaide.comは、それぞれ別々にSupabaseを利用・検討している状態だった。これらを1つのSupabaseプロジェクトに統合し、管理面（ダッシュボード、課金、監視）を一本化しつつ、ツールごとのデータ設計の違いを壊さない基盤を作る。

これは[[project_aidandaide_mikke_ugc_renewal]]と同じ事業ファネル文脈（AI支援ツールを入口にビズエイド伴走支援へつなげる）の一部であり、今後増えるAIツール全般を乗せられる共通基盤として設計する。

**きっかけ:** ユーザーが別ターミナルでsupabase CLIのログイン/リンク作業中にエラーに遭遇したことから相談が始まったが、そのエラー自体は本設計の完了時点で解決済み・無関係と確認済み。

## 対象プロジェクトの現状

| プロジェクト | 技術構成 | 認証方式 | データ設計 | 状態 |
|---|---|---|---|---|
| **efshiumai**<br>`C:\Users\aktfk\efshiumai` | Next.js 16 + Supabase | Supabase Auth**未使用**。PINログイン＋サーバー側service_roleキーのみ | テナント列なし（単一クライアント専用） | 本番稼働中・実データあり<br>Supabaseプロジェクト: `wtmkihghahtcqicaassu` |
| **mikke-ugc**<br>`C:\Users\aktfk\Documents\mikke-ugc` | Next.js + Supabase | Supabase Auth使用。`auth.users` + `owner_id`でRLS制御する本格マルチテナント | マルチテナント | 本番稼働中・実ユーザーあり |
| **aidandaide.com**<br>`C:\Users\aktfk\aidandaide` | 静的HTML、GitHub Pages配信 | なし | 現状Formspreeで問い合わせ受付、Supabase未使用 | 本番稼働中 |

## スコープ外

- **既存本番データ（efshiumai・mikke-ugc）の実移行**は本設計の対象外。ダウンタイム・データ整合性リスクがあるため、別途移行計画として詳細に詰める
- efshiumaiのSupabase Authへの移行（PINログインからの切り替え）は行わない。現行のPINログイン方式を維持する
- Aid & Aideスタッフ向けの横断管理画面（問い合わせ一覧の閲覧など）の具体的な実装は対象外。土台となるテーブル設計のみ本設計に含める

## 設計方針

### 1. インフラ構成：1プロジェクト・スキーマ分離

1つのSupabase Organization / 1つのSupabase Projectを、efshiumai・mikke-ugc・aidandaide.com・将来ツール全てで共有する。

`public`スキーマは共有せず、ツールごとに専用スキーマを切る：

- `efshiumai` — efshiumaiのシフト管理データ
- `mikke_ugc` — mikke-ugcのUGCデータ
- `site` — aidandaide.comの問い合わせデータ等
- `public` — 真に横断する共通データのみ（Aid & Aideスタッフの管理者アカウント台帳など）

**理由:** efshiumaiとmikke-ugcは認証モデル・テナント設計が全く異なり、テーブル名衝突（`settings`, `events`等）のリスクもある。スキーマ単位で分けることで、各ツールのマイグレーション・スキーマ変更が他ツールに影響しない。

### 2. 認証境界

- `auth.users`はプロジェクト共通1テーブル。mikke-ugcのオーナー、将来ツール利用者、Aid & Aide管理者が同居するため`user_metadata`で所属ツール/ロールを区別する
- efshiumaiは**Supabase Authへ移行しない**。既存のPINログイン＋サーバー側service_roleキーのみの方式を維持し、クライアント側からは一切Supabaseと直接通信しない
- mikke-ugcは現状のAuth＋RLS運用（`auth.uid() = owner_id`）をそのまま維持
- Aid & Aideスタッフ（複数ツールの管理画面にまたがってアクセスする社内メンバー）用に`public.staff_accounts`テーブル（`user_id` → `auth.users.id`, `role`, 有効ツール一覧）を新設し、社内管理者ログイン共通化の土台とする。具体的な管理画面実装は別スコープ
- aidandaide.comは当面認証不要。問い合わせフォームは「認証なしのINSERTのみ許可」のRLSポリシーで`site`スキーマに書き込む

### 3. スキーマ隔離の強度：規約ベース

スキーマ分離は「名前衝突回避・整理」のためであり、Postgresロールレベルでの強制隔離（GRANT/REVOKEによる物理的なアクセス権剥奪）までは行わない。

**判断理由:** efshiumaiとmikke-ugcは別クライアントの情報だが、両方ともAid & Aide自身が運用するコードであり、service_roleキーは各アプリのサーバー側にしか置かれない。悪意ある第三者の混入を想定する必要はなく、リスクは「コードバグで他スキーマを誤って参照してしまう」程度に限定される。ロール管理・JWTクレーム設計のコストと比較し、現状は規約ベース（各アプリが自分のスキーマを固定して初期化する）で十分と判断した。

```javascript
// efshiumaiアプリ側
const supabase = createClient(url, serviceKey, { db: { schema: 'efshiumai' } })

// mikke-ugcアプリ側
const supabase = createClient(url, serviceKey, { db: { schema: 'mikke_ugc' } })
```

将来、ツール間のデータ独立性の要求が高まった場合（例：クライアントとの契約上の要件）は、Postgresロールベースの強制隔離への移行を再検討する。

### 4. 環境変数運用

**共通変数（3アプリ共通）:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（サーバー側のみ、Vercel環境変数に設定。クライアントバンドルに含めない）

**アプリ固有:**
- 使用するスキーマ名（`efshiumai` / `mikke_ugc` / `site`）は環境変数化せず、各アプリのSupabaseクライアント初期化コードにハードコードする。環境ごとに変わる値ではなく、コードの一部であるため

**Supabase側の設定:**
- API設定の「Exposed schemas」に`public`, `efshiumai`, `mikke_ugc`, `site`を全て追加する（PostgRESTでスキーマ指定アクセスするために必須）
- mikke-ugcのanonキー経由アクセス（RLS前提）は実質`mikke_ugc`スキーマのみ使う想定だが、キー自体は他スキーマにも技術的にはアクセス可能（3.の規約ベース隔離の帰結）

**開発環境:**
- ローカル開発は本番と同じSupabaseプロジェクトを直接参照する現行運用を維持（Supabase CLIでのローカルDB切り替えは本設計のスコープ外）
- 各リポジトリの`.env.local`は既存の変数名を維持しつつ、値のみ統合後のプロジェクトのものに差し替える

**新規追加:**
- aidandaide.com（現状Supabase未使用）に上記3変数を新規追加する

### 5. データフロー

**efshiumai:**
```
ブラウザ（PINログイン、Supabase非依存）
  → Next.js APIルート / Server Action
    → Supabaseクライアント（service_role, schema: efshiumai）
      → Postgres
```
クライアント側は一切Supabaseと直接通信しない。既存構成を完全維持。

**mikke-ugc:**
```
ブラウザ（Supabase Auth JWTセッション）
  → Supabaseクライアント（anon key, schema: mikke_ugc）── RLS: auth.uid() = owner_id
      → Postgres
（管理系・Webhook等はNext.js API経由でservice_roleを使用）
```
既存構成を維持。

**aidandaide.com（新規・siteスキーマ）:**
```
ブラウザ（静的HTML、GitHub Pages配信）
  → Supabaseクライアント（anon key, schema: site）── RLS: INSERTのみ許可、SELECT/UPDATE/DELETE不可
      → Postgres（site.inquiries）
```
RLSで「匿名ユーザーはINSERTのみ可・他操作は全て不可」に絞ることで、**バックエンドを新設せずGitHub Pagesのままブラウザから直接Supabaseに書き込める**。Formspreeの置き換えを最小構成で実現する。

## 将来のスコープ（本設計に含めない）

- 問い合わせ内容やツール横断データをAid & Aideスタッフが閲覧する管理画面（`staff_accounts`を使った認証が必要）
- efshiumai・mikke-ugcの既存本番データの実移行計画
- efshiumaiのSupabase Auth移行（必要になった場合）
- スキーマ隔離のPostgresロールベース強制隔離への移行（必要になった場合）
