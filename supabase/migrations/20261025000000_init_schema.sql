-- Esquema inicial: migra las colecciones de Firestore (users, guides) a tablas
-- relacionales y añade estado + historial de entregas.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

-- Al crear una guía ya queda confirmada (equivale al antiguo POST /confirmGuides).
-- Transiciones válidas: ver public.guides_validate_status().
create type public.delivery_status as enum (
  'confirmada',
  'en_transito',
  'entregada',
  'devuelta',
  'cancelada'
);

-- ---------------------------------------------------------------------------
-- profiles: reemplaza la colección `users`. La contraseña la gestiona Supabase Auth.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique check (char_length(username) >= 3),
  created_at timestamptz not null default now()
);

-- Crea el perfil al registrarse. El frontend envía `username` en options.data del signUp;
-- si falta, se usa el email (único en auth.users).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- guides: reemplaza la colección `guides`. Las reglas de Joi pasan a constraints.
-- ---------------------------------------------------------------------------

create table public.guides (
  id                   uuid primary key default gen_random_uuid(),
  guia                 text not null unique check (char_length(guia) between 5 and 10),
  ubicacion            text not null check (ubicacion <> ''),
  ciudad_destino       text not null check (ciudad_destino <> ''),
  departamento_destino text not null check (departamento_destino <> ''),
  codigo_postal        text not null check (codigo_postal ~ '^[0-9]{6}$'),
  telefono_contacto    text not null check (telefono_contacto ~ '^[0-9]{10}$'),
  valor_productos      numeric(12, 2) not null check (valor_productos > 0),
  costo_envio          numeric(12, 2) not null check (costo_envio > 0),
  -- text y no number: los ceros a la izquierda importan
  id_proveedor         text not null check (id_proveedor ~ '^[0-9]+$'),
  numero_cuenta        text not null check (numero_cuenta ~ '^[0-9]+$'),
  observaciones        text check (char_length(observaciones) <= 100),
  linea_contacto       text check (char_length(linea_contacto) <= 50),
  status               public.delivery_status not null default 'confirmada',
  created_by           uuid not null default auth.uid() references public.profiles (id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index guides_status_idx on public.guides (status);
create index guides_created_at_idx on public.guides (created_at desc);

-- ---------------------------------------------------------------------------
-- guide_status_history: lo escriben solo los triggers, nunca la API.
-- ---------------------------------------------------------------------------

create table public.guide_status_history (
  id          bigint generated always as identity primary key,
  guide_id    uuid not null references public.guides (id) on delete cascade,
  from_status public.delivery_status,
  to_status   public.delivery_status not null,
  changed_by  uuid references public.profiles (id),
  changed_at  timestamptz not null default now()
);

create index guide_status_history_guide_idx on public.guide_status_history (guide_id, changed_at);

-- ---------------------------------------------------------------------------
-- Triggers de guides
-- ---------------------------------------------------------------------------

-- Valida la transición de estado y mantiene updated_at.
-- Lanza check_violation (23514) para que la API lo traduzca a 400.
create function public.guides_validate_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and not (
       (old.status = 'confirmada'  and new.status in ('en_transito', 'cancelada'))
    or (old.status = 'en_transito' and new.status in ('entregada', 'devuelta'))
  ) then
    raise exception 'Transición de estado no permitida: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger guides_before_update
  before update on public.guides
  for each row execute function public.guides_validate_status();

-- Registra cada cambio de estado (incluida la creación) en el historial.
-- security definer: los usuarios no tienen permiso de escritura sobre el historial.
create function public.guides_log_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.guide_status_history (guide_id, from_status, to_status, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.status end,
      new.status,
      auth.uid()
    );
  end if;
  return null;
end;
$$;

create trigger guides_after_write
  after insert or update of status on public.guides
  for each row execute function public.guides_log_status();

-- ---------------------------------------------------------------------------
-- Seguridad: RLS + privilegios por columna.
-- La anon key es pública (va en el frontend), así que la DB debe protegerse sola
-- aunque alguien llame a PostgREST directamente sin pasar por la API.
-- ---------------------------------------------------------------------------

alter table public.profiles             enable row level security;
alter table public.guides               enable row level security;
alter table public.guide_status_history enable row level security;

revoke all on public.profiles, public.guides, public.guide_status_history from anon, authenticated;

grant select on public.profiles, public.guides, public.guide_status_history to authenticated;
grant update (username) on public.profiles to authenticated;
-- Sin id, status, created_by ni fechas: los fijan los defaults y triggers.
grant insert (
  guia, ubicacion, ciudad_destino, departamento_destino, codigo_postal, telefono_contacto,
  valor_productos, costo_envio, id_proveedor, numero_cuenta, observaciones, linea_contacto
) on public.guides to authenticated;
grant update (status) on public.guides to authenticated;

-- Igual que el legacy: cualquier usuario autenticado ve y gestiona todas las guías.
create policy "profiles: lectura autenticados" on public.profiles
  for select to authenticated using (true);
create policy "profiles: editar el propio" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "guides: lectura autenticados" on public.guides
  for select to authenticated using (true);
create policy "guides: crear como uno mismo" on public.guides
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "guides: cambiar estado autenticados" on public.guides
  for update to authenticated using (true) with check (true);

create policy "historial: lectura autenticados" on public.guide_status_history
  for select to authenticated using (true);
