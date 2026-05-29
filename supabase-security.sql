-- LeadMap Pro - estrutura inicial de segurança para Supabase.
-- Execute no SQL Editor do Supabase antes de usar mensagens reais.
-- Observação: a service_role key sempre consegue bypassar RLS. Nunca coloque essa chave no frontend.

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
