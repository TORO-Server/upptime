# TORO Status

[![Monitor](https://github.com/TORO-Server/upptime/actions/workflows/monitor.yml/badge.svg)](https://github.com/TORO-Server/upptime/actions/workflows/monitor.yml)

TORO サーバーの稼働状況ページです。**https://status.torosaba.net**

90年代の Web 1.0 / GeoCities 風デザインに、three.js による 3D データセンター
可視化を組み合わせた、独自実装のステータスページです。全コードを **TypeScript**
で管理しています。

## 構成

| レイヤ | 技術 | 役割 |
| --- | --- | --- |
| 監視 | `scripts/check.ts` (TypeScript, 依存ゼロ) | Minecraft Server List Ping / HTTP チェック、履歴集計 |
| データ | `frontend/public/data/*.json` | チェッカーが生成し、フロントが読むだけ |
| 表示 | Vue 3 + TypeScript | ステータスカード・可視化 |
| 3D | three.js (`src/three/serverRoom.ts`) | 各サービスをラックの LED として可視化 (稼働=緑 / 低下=黄 / 停止=赤) |
| 自動化 | GitHub Actions (`.github/workflows/monitor.yml`) | 10分毎に チェック → コミット → ビルド → Pages へデプロイ |

監視対象は [`config/sites.json`](config/sites.json) で定義します。

## ローカル開発

```bash
# 監視チェッカー (データを生成)
npm install
npm run check        # = tsx scripts/check.ts
npm run typecheck

# フロントエンド
cd frontend
npm install
npm run dev          # 開発サーバ
npm run build        # 本番ビルド (dist/)
npm run typecheck    # vue-tsc
```

## ライセンス

[MIT](LICENSE)
