-- DATNGO CMS schema
create table if not exists posts (
  id               text primary key,
  user_id          text not null,
  slug             text not null unique,
  title            text not null default '',
  excerpt          text not null default '',
  html             text not null default '',
  json             text not null default '{}',
  cover_url        text,
  cover_alt        text,
  status           text not null default 'draft',
  featured         boolean not null default false,
  published_at     timestamptz,
  scheduled_at     timestamptz,
  meta_title       text,
  meta_description text,
  canonical_url    text,
  og_image_url     text,
  focus_keyword    text,
  seo_score        integer,
  seo_report       text,
  ai_score         integer,
  ai_report        text,
  reading_minutes  integer not null default 1,
  word_count       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists posts_user_id_idx on posts (user_id);
create index if not exists posts_status_published_idx on posts (status, published_at desc);

create table if not exists tags (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists post_tags (
  post_id text not null references posts(id) on delete cascade,
  tag_id  text not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists media (
  id         text primary key,
  user_id    text not null,
  url        text not null,
  alt        text not null default '',
  caption    text not null default '',
  credit     text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists media_user_id_idx on media (user_id);

create table if not exists subscribers (
  id         text primary key,
  email      text not null unique,
  source     text not null default 'site',
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id                  integer primary key default 1,
  site_name           text not null default 'Dat Ngo',
  tagline             text not null default 'Ghi chú kỹ thuật. Hệ thống. Thẩm mỹ.',
  bio                 text not null default '',
  about_html          text not null default '',
  avatar_url          text,
  x_handle            text not null default 'datngotien',
  github_url          text,
  location            text not null default 'Hà Nội',
  beehiiv_embed_url   text,
  beehiiv_publication text,
  footer_note         text not null default '',
  updated_at          timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

create table if not exists projects (
  id         text primary key,
  user_id    text not null,
  title      text not null,
  summary    text not null default '',
  url        text,
  year       text,
  tags       text not null default '',
  sort_order integer not null default 0
);

insert into settings (id) values (1) on conflict (id) do nothing;
