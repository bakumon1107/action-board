# 地域ポスターマップ

ポスター掲示板の位置データを地図上で閲覧・更新できる独立したWebアプリケーションです。

## ライセンス

このプロジェクトは GNU Affero General Public License v3.0（AGPL-3.0）です。
元のソースコード: https://github.com/bakumon1107/action-board

ネットワーク越しに変更版を提供する場合は、利用者が対応するソースコードを入手できるようにしてください。
ライセンス全文は [LICENSE](./LICENSE) を参照してください。

このフォークは新たなコントリビューターライセンス契約（CLA）を要求しません。
ただし、元リポジトリへ変更を戻す場合は、元リポジトリのCLAポリシーに従う必要があります。

## セットアップ

```bash
pnpm install
cp .env.example .env
supabase start
supabase db reset
pnpm run dev
```

## ポスターデータ

CSVの配置と読み込み手順は [poster_data/README.md](./poster_data/README.md) を参照してください。
