-- 既存ミッションデータのupsertおよび新しいミッションの追加（ogp_image_url、artifact_label含む）

-- missionsテーブルにartifact_labelカラムを追加
ALTER TABLE missions
ADD COLUMN artifact_label VARCHAR(100);

COMMENT ON COLUMN missions.artifact_label IS '成果物の入力欄のラベル表示用テキスト';
