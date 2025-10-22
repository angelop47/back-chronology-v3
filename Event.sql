create table if not exists public.events (
  id uuid primary key,
  title text not null,
  date date not null
);
