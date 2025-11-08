-- Tabla principal de eventos
create table if not exists public.events (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  date date NOT NULL,
  description text,
  createdAt timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  image_url text[]
);

-- Tabla de categorías
CREATE TABLE categories (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  createdAt timestamptz DEFAULT now()
);

-- Tabla intermedia (relación muchos a muchos)
CREATE TABLE event_categories (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, category_id)
);



create extension if not exists "uuid-ossp";

create table public.clerk_users (
  id uuid primary key default uuid_generate_v4(), -- ID interno UUID
  clerk_id text unique not null,                  -- ID del usuario en Clerk (user_xxx)
  email text,                                     -- correo principal
  first_name text,
  last_name text,
  image_url text,
  last_event text,                                -- último evento recibido (user.created, etc)
  updated_at timestamptz default now()            -- fecha del último sync
);
