# TORO Status

[![Monitor](https://github.com/TORO-Server/upptime/actions/workflows/monitor.yml/badge.svg)](https://github.com/TORO-Server/upptime/actions/workflows/monitor.yml)

TORO サーバーの稼働状況ページです。**https://status.torosaba.net**

Upptime をやめ、**Vue.js フロントエンド + GitHub Actions の独自実装**に置き換えました。
監視・データ生成・ビルド・デプロイをすべて 1 本のワークフローで完結させているため、
以前あった複数ワークフロー同時 push による競合（`! [rejected] fetch first`）は構造的に発生しません。

## 仕組み

```
GitHub Actions (cron, 10分毎)
  └─ scripts/check.mjs   … Minecraft は Server List Ping(死活/応答時間/人数)、HTTP は fetch
       └─ frontend/public/data/*.json に履歴を追記・集計
            └─ git commit (データ永続化)
                 └─ Vue.js (Vite) ビルド
                      └─ GitHub Pages へデプロイ (status.torosaba.net)
```

| 役割 | 場所 |
| --- | --- |
| 監視対象・ブランディング設定 | [`config/sites.json`](config/sites.json) |
| 監視スクリプト（依存ゼロ・Node） | [`scripts/check.mjs`](scripts/check.mjs) |
| フロントエンド（Vue 3 + Vite） | [`frontend/`](frontend/) |
| 生成データ（コミットされる） | `frontend/public/data/` |
| ワークフロー | [`.github/workflows/monitor.yml`](.github/workflows/monitor.yml) |

## 監視対象

- Minecraft サーバー 5 台（`*.torosaba.net:27248` / Server List Ping）
- HTTP サービス 4 つ（Dynmap / Pass API / Sound / Status Page）

サイトの追加・削除は [`config/sites.json`](config/sites.json) の `sites` を編集するだけです。

## ローカル開発

```bash
# 監視を 1 回実行してデータを生成
node scripts/check.mjs

# フロントエンドを起動
cd frontend
npm install
npm run dev      # 開発サーバー
npm run build    # 本番ビルド（dist/ に data/ も同梱される）
```

## 設定

- 監視間隔は [`.github/workflows/monitor.yml`](.github/workflows/monitor.yml) の cron（既定 `*/10 * * * *`）で変更できます。
