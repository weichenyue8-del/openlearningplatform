-- OpenAP Phase 4: private student data, RLS, and authoritative practice grading.
--
-- The application catalog remains source-controlled TypeScript. Its stable text
-- identifiers are intentionally not foreign keys to duplicate database tables.
-- Practice grading keys are the one exception: they live in a private schema so
-- authenticated clients can submit answers without being trusted to submit scores.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create or replace function private.text_array_is_unique(values_to_check text[])
returns boolean
language sql
immutable
strict
set search_path = ''
as $function$
  select
    pg_catalog.array_position(values_to_check, null) is null
    and pg_catalog.cardinality(values_to_check) = (
      select pg_catalog.count(distinct item)
      from pg_catalog.unnest(values_to_check) as items(item)
    );
$function$;

create or replace function private.normalize_short_answer(answer text)
returns text
language sql
immutable
strict
set search_path = ''
as $function$
  select pg_catalog.lower(
    pg_catalog.regexp_replace(
      pg_catalog.btrim(answer),
      '[[:space:]]+',
      ' ',
      'g'
    )
  );
$function$;

create table private.practice_question_keys (
  question_id text primary key,
  course_id text not null,
  grading_kind text not null,
  option_ids text[],
  correct_option_ids text[],
  numeric_value double precision,
  numeric_tolerance double precision,
  accepted_answers text[],
  constraint practice_question_keys_question_id_check
    check (question_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint practice_question_keys_course_id_check
    check (course_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint practice_question_keys_kind_check
    check (grading_kind in ('multiple-choice', 'multiple-select', 'numerical', 'short-answer')),
  constraint practice_question_keys_rule_shape_check check (
    case grading_kind
      when 'multiple-choice' then
        option_ids is not null
        and pg_catalog.cardinality(option_ids) between 2 and 12
        and private.text_array_is_unique(option_ids)
        and correct_option_ids is not null
        and pg_catalog.cardinality(correct_option_ids) = 1
        and correct_option_ids <@ option_ids
        and numeric_value is null
        and numeric_tolerance is null
        and accepted_answers is null
      when 'multiple-select' then
        option_ids is not null
        and pg_catalog.cardinality(option_ids) between 2 and 12
        and private.text_array_is_unique(option_ids)
        and correct_option_ids is not null
        and pg_catalog.cardinality(correct_option_ids) between 1 and 12
        and private.text_array_is_unique(correct_option_ids)
        and correct_option_ids <@ option_ids
        and numeric_value is null
        and numeric_tolerance is null
        and accepted_answers is null
      when 'numerical' then
        option_ids is null
        and correct_option_ids is null
        and numeric_value is not null
        and numeric_tolerance is not null
        and numeric_tolerance >= 0
        and accepted_answers is null
      when 'short-answer' then
        option_ids is null
        and correct_option_ids is null
        and numeric_value is null
        and numeric_tolerance is null
        and accepted_answers is not null
        and pg_catalog.cardinality(accepted_answers) between 1 and 24
        and pg_catalog.array_position(accepted_answers, null) is null
      else false
    end
  )
);

comment on table private.practice_question_keys is
  'Authoritative grading rules. No client role receives schema or table access.';

revoke all on table private.practice_question_keys from public;
revoke all on table private.practice_question_keys from anon, authenticated;

insert into private.practice_question_keys (
  question_id,
  course_id,
  grading_kind,
  option_ids,
  correct_option_ids,
  numeric_value,
  numeric_tolerance,
  accepted_answers
)
values
  ('calc-limits-001', 'ap-calculus-bc', 'multiple-choice', array['a','b','c','d'], array['a'], null, null, null),
  ('calc-derivatives-002', 'ap-calculus-bc', 'numerical', null, null, 19, 0, null),
  ('calc-applications-003', 'ap-calculus-bc', 'multiple-select', array['a','b','c','d'], array['b','d'], null, null, null),
  ('calc-integrals-004', 'ap-calculus-bc', 'numerical', null, null, 8, 0, null),
  ('calc-ftc-005', 'ap-calculus-bc', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('calc-techniques-006', 'ap-calculus-bc', 'short-answer', null, null, null, null, array['u=x^2','u = x^2','u=x²','u = x²']),
  ('calc-diffeq-007', 'ap-calculus-bc', 'numerical', null, null, 16, 1e-9, null),
  ('calc-series-008', 'ap-calculus-bc', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('calc-series-009', 'ap-calculus-bc', 'multiple-select', array['a','b','c','d'], array['a','b'], null, null, null),
  ('calc-techniques-010', 'ap-calculus-bc', 'numerical', null, null, 1, 1e-9, null),

  ('csa-variables-001', 'ap-computer-science-a', 'multiple-choice', array['a','b','c','d'], array['c'], null, null, null),
  ('csa-types-002', 'ap-computer-science-a', 'short-answer', null, null, null, null, array['boolean']),
  ('csa-booleans-003', 'ap-computer-science-a', 'multiple-select', array['a','b','c','d'], array['a','b','c'], null, null, null),
  ('csa-conditionals-004', 'ap-computer-science-a', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('csa-loops-005', 'ap-computer-science-a', 'numerical', null, null, 10, 0, null),
  ('csa-arrays-006', 'ap-computer-science-a', 'multiple-choice', array['a','b','c','d'], array['c'], null, null, null),
  ('csa-arraylists-007', 'ap-computer-science-a', 'multiple-select', array['a','b','c','d'], array['a','b','d'], null, null, null),
  ('csa-methods-008', 'ap-computer-science-a', 'numerical', null, null, 14, 0, null),
  ('csa-classes-009', 'ap-computer-science-a', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('csa-oop-010', 'ap-computer-science-a', 'short-answer', null, null, null, null, array['method overloading','overloading']),

  ('macro-gdp-001', 'ap-macroeconomics', 'numerical', null, null, 750, 0, null),
  ('macro-gdp-002', 'ap-macroeconomics', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('macro-inflation-003', 'ap-macroeconomics', 'numerical', null, null, 5, 0.01, null),
  ('macro-inflation-004', 'ap-macroeconomics', 'short-answer', null, null, null, null, array['deflation','price deflation']),
  ('macro-unemployment-005', 'ap-macroeconomics', 'multiple-select', array['a','b','c','d'], array['a','b','c'], null, null, null),
  ('macro-ad-006', 'ap-macroeconomics', 'multiple-choice', array['a','b','c','d'], array['a'], null, null, null),
  ('macro-as-007', 'ap-macroeconomics', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('macro-fiscal-008', 'ap-macroeconomics', 'multiple-select', array['a','b','c','d'], array['a','b'], null, null, null),
  ('macro-monetary-009', 'ap-macroeconomics', 'numerical', null, null, 5, 0, null),
  ('macro-monetary-010', 'ap-macroeconomics', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),

  ('micro-demand-001', 'ap-microeconomics', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('micro-equilibrium-002', 'ap-microeconomics', 'numerical', null, null, 20, 0, null),
  ('micro-elasticity-003', 'ap-microeconomics', 'numerical', null, null, 2, 0.01, null),
  ('micro-elasticity-004', 'ap-microeconomics', 'multiple-select', array['a','b','c','d'], array['a','b','c'], null, null, null),
  ('micro-cs-005', 'ap-microeconomics', 'numerical', null, null, 15, 0, null),
  ('micro-ps-006', 'ap-microeconomics', 'numerical', null, null, 12, 0, null),
  ('micro-structures-007', 'ap-microeconomics', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('micro-structures-008', 'ap-microeconomics', 'short-answer', null, null, null, null, array['monopoly','pure monopoly']),
  ('micro-externalities-009', 'ap-microeconomics', 'multiple-choice', array['a','b','c','d'], array['b'], null, null, null),
  ('micro-externalities-010', 'ap-microeconomics', 'multiple-select', array['a','b','c','d'], array['a','b','c'], null, null, null);

do $block$
begin
  if (select pg_catalog.count(*) from private.practice_question_keys) <> 40 then
    raise exception 'Expected exactly 40 seeded OpenAP practice grading rules.';
  end if;
end;
$block$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint profiles_display_name_check check (
    display_name = pg_catalog.btrim(display_name)
    and pg_catalog.char_length(display_name) between 1 and 80
  ),
  constraint profiles_avatar_url_check check (
    avatar_url is null
    or pg_catalog.char_length(avatar_url) between 1 and 2048
  )
);

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  enrolled_at timestamptz not null default pg_catalog.now(),
  last_accessed_at timestamptz not null default pg_catalog.now(),
  constraint course_enrollments_course_id_check
    check (course_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint course_enrollments_user_course_key unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  lesson_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default pg_catalog.now(),
  constraint lesson_progress_course_id_check
    check (course_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint lesson_progress_lesson_id_check
    check (lesson_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint lesson_progress_completion_check check (
    (completed and completed_at is not null)
    or (not completed and completed_at is null)
  ),
  constraint lesson_progress_user_lesson_key unique (user_id, course_id, lesson_id)
);

create table public.practice_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  question_ids text[] not null,
  started_at timestamptz not null default pg_catalog.now(),
  completed_at timestamptz,
  total_questions smallint not null default 0,
  correct_answers smallint not null default 0,
  constraint practice_sessions_course_id_check
    check (course_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint practice_sessions_question_count_check
    check (pg_catalog.cardinality(question_ids) between 1 and 20),
  constraint practice_sessions_question_ids_check
    check (private.text_array_is_unique(question_ids)),
  constraint practice_sessions_totals_check check (
    total_questions between 0 and pg_catalog.cardinality(question_ids)
    and correct_answers between 0 and total_questions
  ),
  constraint practice_sessions_completed_at_check check (
    completed_at is null or completed_at >= started_at
  ),
  constraint practice_sessions_id_user_key unique (id, user_id)
);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  submission_id uuid not null,
  question_id text not null,
  submitted_answer jsonb not null,
  is_correct boolean not null,
  created_at timestamptz not null default pg_catalog.now(),
  constraint question_attempts_question_id_check
    check (question_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint question_attempts_answer_shape_check check (
    pg_catalog.jsonb_typeof(submitted_answer) in ('string', 'array')
    and pg_catalog.pg_column_size(submitted_answer) <= 4096
  ),
  constraint question_attempts_session_user_fkey
    foreign key (session_id, user_id)
    references public.practice_sessions(id, user_id)
    on delete cascade,
  constraint question_attempts_user_submission_key unique (user_id, submission_id),
  constraint question_attempts_session_question_key unique (session_id, question_id)
);

create table public.resource_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id text not null,
  created_at timestamptz not null default pg_catalog.now(),
  constraint resource_bookmarks_resource_id_check
    check (resource_id ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  constraint resource_bookmarks_user_resource_key unique (user_id, resource_id)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system',
  preferred_subjects text[] not null default '{}',
  updated_at timestamptz not null default pg_catalog.now(),
  constraint user_preferences_theme_check check (theme in ('light', 'dark', 'system')),
  constraint user_preferences_subjects_check check (
    pg_catalog.cardinality(preferred_subjects) <= 12
    and pg_catalog.array_position(preferred_subjects, null) is null
  )
);

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  completed_at timestamptz,
  constraint account_deletion_requests_status_check
    check (status in ('pending', 'cancelled', 'completed')),
  constraint account_deletion_requests_completed_at_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

comment on table public.profiles is 'Private profile data. Profiles are not publicly discoverable.';
comment on table public.course_enrollments is 'A user enrollment references a source-controlled course slug.';
comment on table public.lesson_progress is 'Per-user progress keyed by source-controlled course and lesson slugs.';
comment on table public.practice_sessions is 'A frozen ordered question list and server-derived aggregate scores.';
comment on table public.question_attempts is 'Immutable answers and correctness derived only by record_practice_attempt.';
comment on table public.resource_bookmarks is 'Per-user bookmarks keyed by source-controlled resource IDs.';
comment on table public.account_deletion_requests is 'Requests only. Completion must not be recorded until Auth deletion succeeds.';

create unique index account_deletion_requests_one_pending_idx
  on public.account_deletion_requests (user_id)
  where status = 'pending';

create index course_enrollments_recent_idx
  on public.course_enrollments (user_id, last_accessed_at desc);

create index lesson_progress_completed_idx
  on public.lesson_progress (user_id, completed_at desc)
  where completed;

create index practice_sessions_recent_idx
  on public.practice_sessions (user_id, started_at desc);

create index practice_sessions_course_idx
  on public.practice_sessions (user_id, course_id, started_at desc);

create index question_attempts_history_idx
  on public.question_attempts (user_id, question_id, created_at desc);

create index question_attempts_mistakes_idx
  on public.question_attempts (user_id, created_at desc)
  where not is_correct;

create index resource_bookmarks_recent_idx
  on public.resource_bookmarks (user_id, created_at desc);

create index account_deletion_requests_user_idx
  on public.account_deletion_requests (user_id, requested_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create or replace function public.set_lesson_progress_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();

  if new.completed then
    if tg_op = 'INSERT' or old.completed is distinct from true then
      new.completed_at := pg_catalog.now();
    else
      new.completed_at := old.completed_at;
    end if;
  else
    new.completed_at := null;
  end if;

  return new;
end;
$function$;

create or replace function public.set_enrollment_last_accessed_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.user_id := old.user_id;
  new.course_id := old.course_id;
  new.enrolled_at := old.enrolled_at;
  new.last_accessed_at := pg_catalog.now();
  return new;
end;
$function$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger lesson_progress_set_timestamps
before insert or update on public.lesson_progress
for each row execute function public.set_lesson_progress_timestamps();

create trigger course_enrollments_set_last_accessed_at
before update on public.course_enrollments
for each row execute function public.set_enrollment_last_accessed_at();

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create trigger account_deletion_requests_set_updated_at
before update on public.account_deletion_requests
for each row execute function public.set_updated_at();

create or replace function public.bootstrap_openap_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  safe_display_name text;
begin
  safe_display_name := pg_catalog.left(
    coalesce(
      nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      'Student'
    ),
    80
  );

  insert into public.profiles (id, display_name, created_at, updated_at)
  values (new.id, safe_display_name, new.created_at, pg_catalog.now())
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.bootstrap_openap_user() from public;
revoke all on function public.bootstrap_openap_user() from anon, authenticated;

drop trigger if exists openap_auth_user_created on auth.users;
create trigger openap_auth_user_created
after insert on auth.users
for each row execute function public.bootstrap_openap_user();

insert into public.profiles (id, display_name, created_at, updated_at)
select
  users.id,
  pg_catalog.left(
    coalesce(
      nullif(pg_catalog.btrim(users.raw_user_meta_data ->> 'display_name'), ''),
      'Student'
    ),
    80
  ),
  users.created_at,
  pg_catalog.now()
from auth.users as users
on conflict (id) do nothing;

insert into public.user_preferences (user_id)
select users.id
from auth.users as users
on conflict (user_id) do nothing;

create or replace function private.grade_practice_answer(
  requested_question_id text,
  submitted_answer jsonb
)
returns boolean
language plpgsql
stable
set search_path = ''
as $function$
declare
  grading_rule private.practice_question_keys%rowtype;
  answer_text text;
  answer_number double precision;
  submitted_options text[];
  expected_options text[];
  normalized_answer text;
  short_answer_matches boolean;
begin
  if submitted_answer is null or pg_catalog.pg_column_size(submitted_answer) > 4096 then
    raise exception 'The submitted answer is not valid.' using errcode = '22023';
  end if;

  select rules.*
  into grading_rule
  from private.practice_question_keys as rules
  where rules.question_id = requested_question_id;

  if not found then
    raise exception 'That practice question could not be found.' using errcode = '22023';
  end if;

  case grading_rule.grading_kind
    when 'multiple-choice' then
      if pg_catalog.jsonb_typeof(submitted_answer) <> 'string' then
        raise exception 'Choose one of the available answers.' using errcode = '22023';
      end if;

      answer_text := submitted_answer #>> '{}';
      if pg_catalog.char_length(answer_text) not between 1 and 40
        or not (answer_text = any(grading_rule.option_ids)) then
        raise exception 'Choose one of the available answers.' using errcode = '22023';
      end if;

      return answer_text = grading_rule.correct_option_ids[1];

    when 'multiple-select' then
      if pg_catalog.jsonb_typeof(submitted_answer) <> 'array'
        or pg_catalog.jsonb_array_length(submitted_answer) not between 1 and 12
        or exists (
          select 1
          from pg_catalog.jsonb_array_elements(submitted_answer) as choices(choice)
          where pg_catalog.jsonb_typeof(choices.choice) <> 'string'
            or pg_catalog.char_length(choices.choice #>> '{}') not between 1 and 40
            or not ((choices.choice #>> '{}') = any(grading_rule.option_ids))
        ) then
        raise exception 'Select one or more of the available answers.' using errcode = '22023';
      end if;

      select pg_catalog.array_agg(distinct choices.option_id order by choices.option_id)
      into submitted_options
      from pg_catalog.jsonb_array_elements_text(submitted_answer) as choices(option_id);

      select pg_catalog.array_agg(distinct expected.option_id order by expected.option_id)
      into expected_options
      from pg_catalog.unnest(grading_rule.correct_option_ids) as expected(option_id);

      return submitted_options = expected_options;

    when 'numerical' then
      if pg_catalog.jsonb_typeof(submitted_answer) <> 'string' then
        raise exception 'Enter a valid finite number.' using errcode = '22023';
      end if;

      answer_text := pg_catalog.btrim(submitted_answer #>> '{}');
      if pg_catalog.char_length(answer_text) not between 1 and 300
        or answer_text !~ '^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+-]?[0-9]+)?$' then
        raise exception 'Enter a valid finite number.' using errcode = '22023';
      end if;

      begin
        answer_number := answer_text::double precision;
      exception
        when invalid_text_representation or numeric_value_out_of_range then
          raise exception 'Enter a valid finite number.' using errcode = '22023';
      end;

      return pg_catalog.abs(answer_number - grading_rule.numeric_value)
        <= grading_rule.numeric_tolerance
          + 2.220446049250313e-16
            * greatest(
              1::double precision,
              pg_catalog.abs(answer_number),
              pg_catalog.abs(grading_rule.numeric_value)
            )
            * 4;

    when 'short-answer' then
      if pg_catalog.jsonb_typeof(submitted_answer) <> 'string' then
        raise exception 'Enter a short answer before submitting.' using errcode = '22023';
      end if;

      answer_text := submitted_answer #>> '{}';
      if pg_catalog.char_length(answer_text) > 300 or pg_catalog.btrim(answer_text) = '' then
        raise exception 'Enter a short answer before submitting.' using errcode = '22023';
      end if;

      normalized_answer := private.normalize_short_answer(answer_text);
      select exists(
        select 1
        from pg_catalog.unnest(grading_rule.accepted_answers) as accepted(answer)
        where private.normalize_short_answer(accepted.answer) = normalized_answer
      )
      into short_answer_matches;

      return short_answer_matches;
  end case;

  raise exception 'Unsupported grading rule.' using errcode = '22023';
end;
$function$;

revoke all on function private.text_array_is_unique(text[]) from public;
revoke all on function private.normalize_short_answer(text) from public;
revoke all on function private.grade_practice_answer(text, jsonb) from public;
revoke all on function private.text_array_is_unique(text[]) from anon, authenticated;
revoke all on function private.normalize_short_answer(text) from anon, authenticated;
revoke all on function private.grade_practice_answer(text, jsonb) from anon, authenticated;

create or replace function public.record_practice_attempt(
  p_session_id uuid,
  p_submission_id uuid,
  p_course_id text,
  p_question_ids text[],
  p_question_id text,
  p_submitted_answer jsonb
)
returns table (
  attempt_id uuid,
  is_correct boolean,
  total_questions integer,
  correct_answers integer,
  completed_at timestamptz,
  created boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller_id uuid;
  current_session public.practice_sessions%rowtype;
  existing_attempt public.question_attempts%rowtype;
  graded_correct boolean;
  new_attempt_id uuid;
  new_total smallint;
  new_correct smallint;
  new_completed_at timestamptz;
begin
  caller_id := auth.uid();

  if caller_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if p_session_id is null or p_submission_id is null then
    raise exception 'Session and submission identifiers are required.' using errcode = '22023';
  end if;

  if p_course_id is null
    or p_course_id !~ '^[a-z0-9][a-z0-9-]{0,79}$'
    or p_question_id is null
    or p_question_id !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'The submitted catalog identifiers are not valid.' using errcode = '22023';
  end if;

  if p_question_ids is null
    or pg_catalog.cardinality(p_question_ids) not between 1 and 20
    or not private.text_array_is_unique(p_question_ids)
    or not (p_question_id = any(p_question_ids)) then
    raise exception 'The practice question list is not valid.' using errcode = '22023';
  end if;

  if (
    select pg_catalog.count(*)
    from private.practice_question_keys as rules
    where rules.question_id = any(p_question_ids)
      and rules.course_id = p_course_id
  ) <> pg_catalog.cardinality(p_question_ids) then
    raise exception 'The practice questions do not belong to the requested course.' using errcode = '22023';
  end if;

  insert into public.practice_sessions (
    id,
    user_id,
    course_id,
    question_ids
  )
  values (
    p_session_id,
    caller_id,
    p_course_id,
    p_question_ids
  )
  on conflict (id) do nothing;

  select sessions.*
  into current_session
  from public.practice_sessions as sessions
  where sessions.id = p_session_id
  for update;

  if not found
    or current_session.user_id <> caller_id
    or current_session.course_id <> p_course_id
    or current_session.question_ids is distinct from p_question_ids then
    raise exception 'Practice session is not available.' using errcode = '42501';
  end if;

  select attempts.*
  into existing_attempt
  from public.question_attempts as attempts
  where attempts.user_id = caller_id
    and attempts.submission_id = p_submission_id;

  if found then
    if existing_attempt.session_id <> p_session_id
      or existing_attempt.question_id <> p_question_id
      or existing_attempt.submitted_answer is distinct from p_submitted_answer then
      raise exception 'That submission identifier has already been used.' using errcode = '23505';
    end if;

    return query
    select
      existing_attempt.id,
      existing_attempt.is_correct,
      current_session.total_questions::integer,
      current_session.correct_answers::integer,
      current_session.completed_at,
      false;
    return;
  end if;

  if exists (
    select 1
    from public.question_attempts as attempts
    where attempts.session_id = p_session_id
      and attempts.question_id = p_question_id
  ) then
    raise exception 'That question has already been answered in this session.' using errcode = '23505';
  end if;

  graded_correct := private.grade_practice_answer(p_question_id, p_submitted_answer);

  insert into public.question_attempts (
    user_id,
    session_id,
    submission_id,
    question_id,
    submitted_answer,
    is_correct
  )
  values (
    caller_id,
    p_session_id,
    p_submission_id,
    p_question_id,
    p_submitted_answer,
    graded_correct
  )
  returning id into new_attempt_id;

  update public.practice_sessions as sessions
  set
    total_questions = sessions.total_questions + 1,
    correct_answers = sessions.correct_answers + case when graded_correct then 1 else 0 end,
    completed_at = case
      when sessions.total_questions + 1 = pg_catalog.cardinality(sessions.question_ids)
        then coalesce(sessions.completed_at, pg_catalog.now())
      else null
    end
  where sessions.id = p_session_id
    and sessions.user_id = caller_id
  returning
    sessions.total_questions,
    sessions.correct_answers,
    sessions.completed_at
  into new_total, new_correct, new_completed_at;

  return query
  select
    new_attempt_id,
    graded_correct,
    new_total::integer,
    new_correct::integer,
    new_completed_at,
    true;
end;
$function$;

comment on function public.record_practice_attempt(uuid, uuid, text, text[], text, jsonb) is
  'Authenticated, atomic practice persistence. The caller cannot submit correctness or scores.';

revoke all on function public.record_practice_attempt(uuid, uuid, text, text[], text, jsonb) from public;
revoke all on function public.record_practice_attempt(uuid, uuid, text, text[], text, jsonb) from anon;
grant execute on function public.record_practice_attempt(uuid, uuid, text, text[], text, jsonb) to authenticated;

-- Trigger helpers are implementation details, not client-callable APIs.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.set_lesson_progress_timestamps() from public, anon, authenticated;
revoke all on function public.set_enrollment_last_accessed_at() from public, anon, authenticated;

-- Every user-owned relation is protected even if a future API exposes it.
alter table public.profiles enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.resource_bookmarks enable row level security;
alter table public.user_preferences enable row level security;
alter table public.account_deletion_requests enable row level security;

revoke all on table
  public.profiles,
  public.course_enrollments,
  public.lesson_progress,
  public.practice_sessions,
  public.question_attempts,
  public.resource_bookmarks,
  public.user_preferences,
  public.account_deletion_requests
from anon, authenticated;

-- Signed-out visitors use source-controlled public content and receive no
-- database privileges. Signed-in users receive only the operations the app
-- actually exposes. Score-bearing practice tables are deliberately read-only.
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

grant select, insert, update, delete on table public.course_enrollments to authenticated;
grant select, insert, update on table public.lesson_progress to authenticated;
grant select on table public.practice_sessions to authenticated;
grant select on table public.question_attempts to authenticated;
grant select, insert, delete on table public.resource_bookmarks to authenticated;
grant select, insert, update on table public.user_preferences to authenticated;
grant select on table public.account_deletion_requests to authenticated;
grant insert (user_id) on table public.account_deletion_requests to authenticated;

create policy profiles_select_own
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy course_enrollments_select_own
on public.course_enrollments for select to authenticated
using ((select auth.uid()) = user_id);

create policy course_enrollments_insert_own
on public.course_enrollments for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy course_enrollments_update_own
on public.course_enrollments for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy course_enrollments_delete_own
on public.course_enrollments for delete to authenticated
using ((select auth.uid()) = user_id);

create policy lesson_progress_select_own
on public.lesson_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy lesson_progress_insert_own
on public.lesson_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy lesson_progress_update_own
on public.lesson_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy practice_sessions_select_own
on public.practice_sessions for select to authenticated
using ((select auth.uid()) = user_id);

create policy question_attempts_select_own
on public.question_attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy resource_bookmarks_select_own
on public.resource_bookmarks for select to authenticated
using ((select auth.uid()) = user_id);

create policy resource_bookmarks_insert_own
on public.resource_bookmarks for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy resource_bookmarks_delete_own
on public.resource_bookmarks for delete to authenticated
using ((select auth.uid()) = user_id);

create policy user_preferences_select_own
on public.user_preferences for select to authenticated
using ((select auth.uid()) = user_id);

create policy user_preferences_insert_own
on public.user_preferences for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy user_preferences_update_own
on public.user_preferences for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy account_deletion_requests_select_own
on public.account_deletion_requests for select to authenticated
using ((select auth.uid()) = user_id);

create policy account_deletion_requests_insert_own_pending
on public.account_deletion_requests for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and completed_at is null
);
