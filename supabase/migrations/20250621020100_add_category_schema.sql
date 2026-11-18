--#398　カテゴリマスタテーブルを追加

create table public.mission_category (
  id UUID PRIMARY KEY, -- UUID自動生成
  category_title text,                   -- カテゴリ名称（表示用）
  sort_no integer not null default 0,            -- 表示順
  category_kbn varchar(20) not null default 'DEFAULT', -- 区分（将来の拡張用）
  del_flg boolean not null default false,        -- 削除フラグ
  created_at timestamptz not null default now(), -- 作成日時
  updated_at timestamptz not null default now()  -- 更新日時
);

--RLS設定
alter table mission_category enable row level security;

--SELECTは許可
create policy select_all_categories
  on mission_category
  for select
  using (true);

--ミッションカテゴリ紐付マスタテーブルを追加

create table public.mission_category_link (
  mission_id uuid not null references missions(id) on delete cascade,
  category_id uuid not null references mission_category(id) on delete cascade,
  sort_no integer not null default 0,             -- カテゴリ内のミッション表示順
  del_flg boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (mission_id, category_id)
);

alter table mission_category_link enable row level security;

create policy select_all_links
  on mission_category_link
  for select
  using (true);

-- カテゴリテーブルへのデータ投入
-- insert into mission_category (id, category_title, sort_no, category_kbn)
-- values
--   ('e9b4504d-3281-8337-22d4-9c9f2faab54c', 'フォロー・登録する', 1, 'DEFAULT'),
--   ('7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', '発信・拡散する', 2, 'DEFAULT'),
--   ('a1e44661-c95a-8541-8fc4-55b942cce3a3', 'コミュニティ・イベントに参加する', 3, 'DEFAULT'),
--   ('089285df-f73d-55e6-e426-6e623095cf26', 'リアルで参加する', 4, 'DEFAULT'),
--   ('fdfe421f-9145-e73f-7000-53ab53d23f49', ' 作って参加する', 5, 'DEFAULT');
