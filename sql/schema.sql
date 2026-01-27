-- 创建日记表
create table diaries (
  id uuid default gen_random_uuid() primary key,
  title text default '',
  content text not null,
  mood text check (mood in ('happy', 'sad', 'neutral', 'calm', 'angry')),
  weather jsonb,
  location text default '',
  tags text[] default '{}',
  images text[] default '{}',
  is_encrypted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 设置行级安全策略 (RLS)
-- 注意：为了快速开发，这里允许所有用户读写。生产环境建议开启 Auth 并限制只能访问自己的数据。
alter table diaries enable row level security;

create policy "允许匿名读写"
on diaries
for all
to anon
using (true)
with check (true);
