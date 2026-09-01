-- Studio staff (admin / publisher) and R2 object keys on media.
create table if not exists studio_staff (
  id          text primary key,
  user_id     text,
  email       text,
  role        text not null default 'publisher',
  created_at  timestamptz not null default now(),
  claimed_at  timestamptz
);

create unique index if not exists studio_staff_user_id_idx on studio_staff (user_id);
create unique index if not exists studio_staff_email_idx on studio_staff (email);

alter table media add column if not exists storage text not null default 'url';
alter table media add column if not exists object_key text;
