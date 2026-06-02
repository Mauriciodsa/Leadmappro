-- LeadMap Pro - base de seguranca e esquema para Supabase.
-- Execute no SQL Editor do Supabase antes de comercializar o sistema.
-- Nunca coloque a service_role key no frontend ou na Vercel como variavel VITE_*.

create extension if not exists pgcrypto;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.empresa_membros (
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'operador')),
  created_at timestamptz not null default now(),
  primary key (empresa_id, user_id)
);

create table if not exists public.empresa (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade default auth.uid(),
  nome text default '',
  email text default '',
  telefone text default '',
  endereco text default '',
  cnpj text default '',
  logo_url text default '',
  sales_url text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.clientes (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade default auth.uid(),
  nome text not null,
  email text default '',
  telefone text not null,
  documento text default '',
  empresa text default '',
  endereco text default '',
  numero text default '',
  complemento text default '',
  bairro text default '',
  cidade text default '',
  estado text default '',
  cep text default '',
  latitude text default '',
  longitude text default '',
  origem text default '',
  status text default 'Lead',
  equipamentos text default '',
  "nossoCliente" boolean default false,
  "lembreteSetor" text default '',
  "lembreteTexto" text default '',
  "lembreteData" text default '',
  observacoes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clientes add column if not exists numero text default '';
alter table public.clientes add column if not exists complemento text default '';
alter table public.clientes add column if not exists bairro text default '';

create table if not exists public.produtos (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  code text default '',
  category text default '',
  price numeric(12,2) default 0,
  description text default '',
  "siteUrl" text default '',
  "imageUrls" jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  setor_id text,
  remetente_id uuid references auth.users(id) on delete set null,
  conteudo text not null,
  created_at timestamptz not null default now()
);

alter table public.empresas enable row level security;
alter table public.empresa_membros enable row level security;
alter table public.empresa enable row level security;
alter table public.clientes enable row level security;
alter table public.produtos enable row level security;
alter table public.mensagens enable row level security;

create or replace function public.is_empresa_admin(target_empresa_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.empresa_membros
    where empresa_id = target_empresa_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "Membros veem sua empresa" on public.empresas;
create policy "Membros veem sua empresa"
on public.empresas
for select
using (
  exists (
    select 1 from public.empresa_membros
    where empresa_id = id and user_id = auth.uid()
  )
);

drop policy if exists "Admins gerenciam membros" on public.empresa_membros;
create policy "Admins gerenciam membros"
on public.empresa_membros
for all
using (public.is_empresa_admin(empresa_id))
with check (public.is_empresa_admin(empresa_id));

drop policy if exists "Usuario gerencia perfil da empresa" on public.empresa;
create policy "Usuario gerencia perfil da empresa"
on public.empresa
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Usuario gerencia seus clientes" on public.clientes;
create policy "Usuario gerencia seus clientes"
on public.clientes
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Usuario gerencia seus produtos" on public.produtos;
create policy "Usuario gerencia seus produtos"
on public.produtos
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Admins leem mensagens" on public.mensagens;
create policy "Admins leem mensagens"
on public.mensagens
for select
using (public.is_empresa_admin(empresa_id));

drop policy if exists "Membros inserem mensagens da empresa" on public.mensagens;
create policy "Membros inserem mensagens da empresa"
on public.mensagens
for insert
with check (
  exists (
    select 1 from public.empresa_membros
    where empresa_id = mensagens.empresa_id
      and user_id = auth.uid()
  )
);
