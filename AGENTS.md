# Regional Poster Map 開発ルール

## プロジェクト概要

このリポジトリは、ポスター掲示板の位置データを地図で閲覧・更新する独立したWebアプリケーションです。
元プロジェクトから派生していますが、組織固有の機能、名称、画像、外部リンクは含めません。

## ライセンスと帰属

- このプロジェクトは GNU Affero General Public License v3.0（AGPL-3.0）で配布します。
- 元ソースコードは https://github.com/bakumon1107/action-board にあります。
- 派生元の上流リポジトリは https://github.com/team-mirai/action-board です。
- `LICENSE` を削除・置換しないでください。
- 公開した派生版は、利用者が対応するソースコードを入手できる手段を提供してください。
- このフォークは新しいコントリビューターライセンス契約を要求しません。
- 元リポジトリへの戻しPRでは、元リポジトリの貢献ルールに従ってください。

## Worktree

コード変更は、通常は専用ブランチのgit worktreeで行います。メインworktreeを直接変更しません。

## アーキテクチャ

- Next.js App Routerを使用します。
- Supabase認証には `src/lib/supabase/client.ts` を使用します。
- 認証操作とStorage操作は `createClient()` または `getAuth()` / `getStorage()` を使用します。
- DB操作は原則 `createAdminClient()` を使用します。
- UIコンポーネントからSupabaseへ直接アクセスしません。
- クライアントからの読み取りは `loaders/`、更新は `actions/`、データ操作は `services/` を経由します。
- `userId` はクライアントから受け取らず、サーバーサイドのセッションから取得します。

## ポスターデータ

- CSVの管理・読み込みは `poster_data/` に集約します。
- 地域固有の組織名や選挙名をアプリケーションにハードコードしません。
- `poster_boards` と `poster_data/data/` を地図表示のデータソースとして扱います。

## 開発コマンド

```bash
pnpm run dev
pnpm run biome:check:write
pnpm run typecheck
pnpm run test:unit
pnpm run build
pnpm run poster:load-csv
```

## 変更ルール

- 不要な機能を削除する場合は、参照箇所を型チェックとビルドで確認してください。
- チーム固有名、組織固有URL、組織固有画像、選挙固有導線を再導入しないでください。
- コミット前にフォーマット、型チェック、対象テストを実行してください。
- 秘密情報、ローカル環境ファイル、ビルド成果物をコミットしないでください。
