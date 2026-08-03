# 学習コーチONE サンプルサイト デプロイ手順

## 構成(6ページ・静的HTMLのみ)

```
coachone-site/
├── index.html        … トップページ
├── concept.html      … 理念
├── course.html       … 料金・コース詳細
├── performance.html  … 実績
├── report.html       … 分析レポートとは
├── recruit.html      … 採用情報
└── README.md         … このファイル
```

- ビルド不要。フレームワーク不要。このフォルダをそのまま静的ホスティングに置けば動きます。
- ロゴとメイン写真はHTML内に埋め込み済み(画像ファイルの別途アップロード不要)。
- 一部の写真(コーチングセクション・塾長写真)は現サイト/ぺライチのURLから直接読み込んでいます。

## デプロイ(Vercel・推奨)

Claude Codeへの指示例:

```
~/coachone-site をVercelにデプロイして。プロジェクト名は coachone-sample。
静的サイトなのでビルド設定は不要。デプロイ後のURLを教えて。
```

手動の場合:

```bash
cd coachone-site
vercel deploy --prod --name coachone-sample
```

または https://vercel.com/new でフォルダをドラッグ&ドロップでも可。
GitHub Pagesの場合はリポジトリにpushして Settings > Pages で公開。

## 今西さんへの共有

デプロイ後に発行されるURL(例: https://coachone-sample.vercel.app)をそのまま共有。
スマホで開いてもらうのがおすすめ(現サイトとの差が一番伝わるため)。

## 本採用が決まったら(本番公開前チェックリスト)

1. **noindexの削除**: 全HTMLの `<meta name="robots" content="noindex">` を削除
   (サンプルが検索結果に出ないように入れてあります。消し忘れると本番も検索に出ません)
2. **canonical/構造化データのURL**: 現在 gakusyucoach-one.com 向け。
   本番ドメインが変わる場合は全ページのURLを差し替え
3. **仮コンテンツの確定**:
   - キャンペーン3種の実施期間・適用条件・併用可否(景品表示法対応で期限明記必須)
   - 「保護者・塾生の声」の仮テキストを本物の声に差し替え
   - 季節講習・振替のFAQ回答が実運用と合っているか確認
4. **事実確認**: 実績・料金・営業時間(木曜休校/金曜休校の情報が混在)・
   MARCHの表現(中央大学の実績有無)を今西さんに最終確認
5. **画像**: 外部URL参照の写真(塾長写真など)を自サーバーにコピーして参照先を変更
6. **写真の掲載許可**: 生徒が写っている写真は本人・保護者の許諾を確認
