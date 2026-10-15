-- ============================================================================
-- Zamora Wallet · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecuta este archivo en el SQL Editor de Supabase.
--
-- Principio de privacidad: los datos sensibles (notas) se guardan aquí, y en
-- la blockchain solo se ancla el HASH. La economía vive en los contratos; aquí
-- se reflejan saldos y el ledger de premios para consultas rápidas.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMs
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('student', 'professor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pending', 'submitted', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type award_source as enum ('task', 'attendance', 'credits', 'forum', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type collectible_kind as enum ('pass', 'badge', 'certificate');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reward_category as enum ('conferencia', 'merch', 'beca', 'cafeteria', 'servicio');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- PROFILES (espejo de auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  wallet          text unique,
  email           text not null,
  name            text not null,
  role            user_role not null default 'student',
  avatar          text,
  student_code    text unique,
  career          text,
  zamora          numeric(20,2) not null default 0,
  attendance_rate integer not null default 0,
  level           integer not null default 1,
  tier            text not null default 'Bronce',
  referral_code   text unique,
  referred_by     uuid references public.profiles(id),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SUBJECTS (materias)
-- ---------------------------------------------------------------------------
create table if not exists public.subjects (
  id             uuid primary key default gen_random_uuid(),
  onchain_id     integer,
  code           text not null unique,
  name           text not null,
  credits        integer not null default 3,
  professor_id   uuid not null references public.profiles(id),
  color          text default '#FF6A00',
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (subject_id, student_id)
);

-- ---------------------------------------------------------------------------
-- TAREAS
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  onchain_id    integer,
  subject_id    uuid not null references public.subjects(id) on delete cascade,
  title         text not null,
  description   text,
  reward        integer not null default 0,
  due_date      timestamptz,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);

create table if not exists public.task_submissions (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  student_id   uuid not null references public.profiles(id) on delete cascade,
  status       task_status not null default 'submitted',
  proof_hash   text,
  proof_url    text,
  feedback     text,
  reviewed_by  uuid references public.profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  unique (task_id, student_id)
);

-- ---------------------------------------------------------------------------
-- ASISTENCIA
-- ---------------------------------------------------------------------------
create table if not exists public.attendance_sessions (
  id            uuid primary key default gen_random_uuid(),
  subject_id    uuid not null references public.subjects(id) on delete cascade,
  code          text not null,
  opened_by     uuid not null references public.profiles(id),
  opened_at     timestamptz not null default now(),
  closes_at     timestamptz not null,
  closed        boolean not null default false
);

create table if not exists public.attendance_records (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.attendance_sessions(id) on delete cascade,
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  present     boolean not null default true,
  marked_at   timestamptz not null default now(),
  unique (session_id, student_id)
);

-- ---------------------------------------------------------------------------
-- NOTAS / CRÉDITOS
-- ---------------------------------------------------------------------------
create table if not exists public.grades (
  id              uuid primary key default gen_random_uuid(),
  subject_id      uuid not null references public.subjects(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  score           numeric(4,2) not null,
  credits_earned  integer not null default 0,
  passed          boolean not null default false,
  grade_hash      text,
  recorded_by     uuid references public.profiles(id),
  recorded_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CURSOS / CERTIFICADOS
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  onchain_id     integer,
  title          text not null,
  description    text,
  price          integer not null default 0,
  instructor_id  uuid not null references public.profiles(id),
  seats          integer not null default 0,
  category       text default 'General',
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.course_enrollments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  progress    integer not null default 0,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (course_id, student_id)
);

create table if not exists public.certificates (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete set null,
  course_title  text not null,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  token_id      integer,
  tx_hash       text,
  soulbound     boolean not null default true,
  issued_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COLECCIONABLES (badges / pases / certificados on-chain)
-- ---------------------------------------------------------------------------
create table if not exists public.collectibles (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  kind         collectible_kind not null,
  name         text not null,
  uri          text,
  token_id     integer,
  soulbound    boolean not null default true,
  acquired_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RECOMPENSAS / CANJES
-- ---------------------------------------------------------------------------
create table if not exists public.rewards (
  id          uuid primary key default gen_random_uuid(),
  onchain_id  integer,
  name        text not null,
  description text,
  cost        integer not null,
  stock       integer not null default 0,
  category    reward_category not null default 'servicio',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.redemptions (
  id          uuid primary key default gen_random_uuid(),
  reward_id   uuid not null references public.rewards(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  cost        integer not null,
  tx_hash     text,
  redeemed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FORO
-- ---------------------------------------------------------------------------
create table if not exists public.forum_posts (
  id           uuid primary key default gen_random_uuid(),
  onchain_id   integer,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  subject_id   uuid references public.subjects(id) on delete set null,
  content      text not null,
  post_hash    text not null,
  anchor_tx    text,
  upvotes      integer not null default 0,
  downvotes    integer not null default 0,
  refundable   boolean not null default false,
  pinned       boolean not null default false,
  removed      boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.forum_votes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.forum_posts(id) on delete cascade,
  voter_id   uuid not null references public.profiles(id) on delete cascade,
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (post_id, voter_id)
);

-- ---------------------------------------------------------------------------
-- LEDGER DE PREMIOS (espejo de los eventos on-chain)
-- ---------------------------------------------------------------------------
create table if not exists public.awards (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null,
  reason      text not null,
  source      award_source not null,
  tx_hash     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CONFIGURACIÓN DEL SISTEMA
-- ---------------------------------------------------------------------------
create table if not exists public.system_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- FUNCIONES AUXILIARES (para RLS)
-- ============================================================================
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_professor()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role in ('professor','admin') from public.profiles where id = auth.uid()), false);
$$;

-- Trigger: crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: reflejar votos en el contador del post
create or replace function public.sync_forum_votes()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.forum_posts p
  set upvotes = (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = 1),
      downvotes = (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = -1),
      refundable = (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = 1) >= 5
  where p.id = coalesce(new.post_id, old.post_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_forum_votes on public.forum_votes;
create trigger trg_forum_votes
  after insert or update or delete on public.forum_votes
  for each row execute function public.sync_forum_votes();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.subjects            enable row level security;
alter table public.enrollments         enable row level security;
alter table public.tasks               enable row level security;
alter table public.task_submissions    enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records  enable row level security;
alter table public.grades              enable row level security;
alter table public.courses             enable row level security;
alter table public.course_enrollments  enable row level security;
alter table public.certificates        enable row level security;
alter table public.collectibles        enable row level security;
alter table public.rewards             enable row level security;
alter table public.redemptions         enable row level security;
alter table public.forum_posts         enable row level security;
alter table public.forum_votes         enable row level security;
alter table public.awards              enable row level security;
alter table public.system_config       enable row level security;

-- PROFILES ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_professor());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
  with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- SUBJECTS ------------------------------------------------------------------
drop policy if exists subjects_select on public.subjects;
create policy subjects_select on public.subjects for select
  using (true);

drop policy if exists subjects_write on public.subjects;
create policy subjects_write on public.subjects for all
  using (public.is_admin() or professor_id = auth.uid())
  with check (public.is_admin() or professor_id = auth.uid());

-- ENROLLMENTS ---------------------------------------------------------------
drop policy if exists enrollments_select on public.enrollments;
create policy enrollments_select on public.enrollments for select
  using (
    student_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.subjects s where s.id = subject_id and s.professor_id = auth.uid())
  );

drop policy if exists enrollments_write on public.enrollments;
create policy enrollments_write on public.enrollments for all
  using (public.is_admin())
  with check (public.is_admin());

-- TASKS ---------------------------------------------------------------------
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select using (true);

drop policy if exists tasks_write on public.tasks;
create policy tasks_write on public.tasks for all
  using (
    public.is_admin()
    or exists (select 1 from public.subjects s where s.id = subject_id and s.professor_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.subjects s where s.id = subject_id and s.professor_id = auth.uid())
  );

-- TASK SUBMISSIONS ----------------------------------------------------------
drop policy if exists submissions_select on public.task_submissions;
create policy submissions_select on public.task_submissions for select
  using (
    student_id = auth.uid()
    or public.is_professor()
  );

drop policy if exists submissions_insert on public.task_submissions;
create policy submissions_insert on public.task_submissions for insert
  with check (student_id = auth.uid());

drop policy if exists submissions_review on public.task_submissions;
create policy submissions_review on public.task_submissions for update
  using (public.is_professor())
  with check (public.is_professor());

-- ATTENDANCE ----------------------------------------------------------------
drop policy if exists att_sessions_select on public.attendance_sessions;
create policy att_sessions_select on public.attendance_sessions for select using (true);

drop policy if exists att_sessions_write on public.attendance_sessions;
create policy att_sessions_write on public.attendance_sessions for all
  using (public.is_professor())
  with check (public.is_professor());

drop policy if exists att_records_select on public.attendance_records;
create policy att_records_select on public.attendance_records for select
  using (student_id = auth.uid() or public.is_professor());

drop policy if exists att_records_insert on public.attendance_records;
create policy att_records_insert on public.attendance_records for insert
  with check (student_id = auth.uid() or public.is_professor());

-- GRADES --------------------------------------------------------------------
drop policy if exists grades_select on public.grades;
create policy grades_select on public.grades for select
  using (student_id = auth.uid() or public.is_professor());

drop policy if exists grades_write on public.grades;
create policy grades_write on public.grades for all
  using (
    public.is_admin()
    or exists (select 1 from public.subjects s where s.id = subject_id and s.professor_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.subjects s where s.id = subject_id and s.professor_id = auth.uid())
  );

-- COURSES -------------------------------------------------------------------
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select using (true);

drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses for all
  using (instructor_id = auth.uid() or public.is_admin())
  with check (instructor_id = auth.uid() or public.is_admin());

drop policy if exists course_enroll_select on public.course_enrollments;
create policy course_enroll_select on public.course_enrollments for select
  using (student_id = auth.uid() or public.is_professor());

drop policy if exists course_enroll_write on public.course_enrollments;
create policy course_enroll_write on public.course_enrollments for all
  using (student_id = auth.uid() or public.is_professor())
  with check (student_id = auth.uid() or public.is_professor());

-- CERTIFICATES --------------------------------------------------------------
drop policy if exists cert_select on public.certificates;
create policy cert_select on public.certificates for select using (true);

drop policy if exists cert_write on public.certificates;
create policy cert_write on public.certificates for all
  using (public.is_professor())
  with check (public.is_professor());

-- COLLECTIBLES --------------------------------------------------------------
drop policy if exists coll_select on public.collectibles;
create policy coll_select on public.collectibles for select using (true);

drop policy if exists coll_write on public.collectibles;
create policy coll_write on public.collectibles for all
  using (profile_id = auth.uid() or public.is_professor())
  with check (profile_id = auth.uid() or public.is_professor());

-- REWARDS -------------------------------------------------------------------
drop policy if exists rewards_select on public.rewards;
create policy rewards_select on public.rewards for select using (true);

drop policy if exists rewards_write on public.rewards;
create policy rewards_write on public.rewards for all
  using (public.is_admin() or public.is_professor())
  with check (public.is_admin() or public.is_professor());

drop policy if exists redemptions_select on public.redemptions;
create policy redemptions_select on public.redemptions for select
  using (student_id = auth.uid() or public.is_professor());

drop policy if exists redemptions_insert on public.redemptions;
create policy redemptions_insert on public.redemptions for insert
  with check (student_id = auth.uid());

-- FORUM ---------------------------------------------------------------------
drop policy if exists forum_select on public.forum_posts;
create policy forum_select on public.forum_posts for select
  using (not removed or author_id = auth.uid() or public.is_professor());

drop policy if exists forum_insert on public.forum_posts;
create policy forum_insert on public.forum_posts for insert
  with check (author_id = auth.uid());

drop policy if exists forum_update on public.forum_posts;
create policy forum_update on public.forum_posts for update
  using (author_id = auth.uid() or public.is_professor())
  with check (author_id = auth.uid() or public.is_professor());

drop policy if exists votes_select on public.forum_votes;
create policy votes_select on public.forum_votes for select using (true);

drop policy if exists votes_write on public.forum_votes;
create policy votes_write on public.forum_votes for all
  using (voter_id = auth.uid())
  with check (voter_id = auth.uid());

-- AWARDS --------------------------------------------------------------------
drop policy if exists awards_select on public.awards;
create policy awards_select on public.awards for select
  using (student_id = auth.uid() or public.is_professor());

drop policy if exists awards_write on public.awards;
create policy awards_write on public.awards for all
  using (public.is_professor())
  with check (public.is_professor());

-- SYSTEM CONFIG -------------------------------------------------------------
drop policy if exists config_select on public.system_config;
create policy config_select on public.system_config for select using (true);

drop policy if exists config_write on public.system_config;
create policy config_write on public.system_config for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- ÍNDICES
-- ============================================================================
create index if not exists idx_profiles_role        on public.profiles(role);
create index if not exists idx_enrollments_student  on public.enrollments(student_id);
create index if not exists idx_tasks_subject        on public.tasks(subject_id);
create index if not exists idx_submissions_student  on public.task_submissions(student_id);
create index if not exists idx_attendance_student   on public.attendance_records(student_id);
create index if not exists idx_grades_student       on public.grades(student_id);
create index if not exists idx_forum_author         on public.forum_posts(author_id);
create index if not exists idx_awards_student       on public.awards(student_id);

-- ============================================================================
-- SEED de configuración
-- ============================================================================
insert into public.system_config (key, value) values
  ('economy', '{"creditMultiplier":100,"attendance":10,"taskReward":25,"forumToll":5,"forumRefundUpvotes":5,"courseInstructorShare":80,"courseBurnShare":20}'::jsonb),
  ('chain', '{"chainId":84532,"name":"Base Sepolia","tokenSymbol":"ZAM"}'::jsonb)
on conflict (key) do nothing;
