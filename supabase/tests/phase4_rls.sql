begin;

create extension if not exists pgtap with schema extensions;
select plan(14);

-- Disposable identities used only inside this rolled-back database test.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'phase4-a@example.invalid', '',
   '{"provider":"email","providers":["email"]}', '{"display_name":"Student A"}', now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'phase4-b@example.invalid', '',
   '{"provider":"email","providers":["email"]}', '{"display_name":"Student B"}', now(), now());

select ok(
  (select relrowsecurity from pg_class where oid = 'public.course_enrollments'::regclass),
  'course enrollments have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.lesson_progress'::regclass),
  'lesson progress has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.practice_sessions'::regclass),
  'practice sessions have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.question_attempts'::regclass),
  'question attempts have RLS enabled'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

select lives_ok(
  $$insert into public.course_enrollments (user_id, course_id)
    values ('11111111-1111-4111-8111-111111111111', 'ap-calculus-bc')$$,
  'user A can create their own enrollment'
);
select lives_ok(
  $$insert into public.resource_bookmarks (user_id, resource_id)
    values ('11111111-1111-4111-8111-111111111111', 'math-3b1b-calculus-essence')$$,
  'user A can create their own bookmark'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select is(
  (select count(*)::integer from public.course_enrollments
    where user_id = '11111111-1111-4111-8111-111111111111'),
  0,
  'user B cannot read user A enrollment'
);
select is(
  (select count(*)::integer from public.resource_bookmarks
    where user_id = '11111111-1111-4111-8111-111111111111'),
  0,
  'user B cannot read user A bookmark'
);
select throws_ok(
  $$insert into public.course_enrollments (user_id, course_id)
    values ('11111111-1111-4111-8111-111111111111', 'ap-statistics')$$,
  '42501',
  null,
  'user B cannot write a row owned by user A'
);
select throws_ok(
  $$insert into public.question_attempts
    (user_id, session_id, submission_id, question_id, submitted_answer, is_correct)
    values (
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'calc-limits-001', '"a"'::jsonb, true
    )$$,
  '42501',
  null,
  'authenticated users cannot directly insert authoritative attempts'
);

select lives_ok(
  $$select * from public.record_practice_attempt(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'ap-calculus-bc',
    array['calc-limits-001'],
    'calc-limits-001',
    '"b"'::jsonb
  )$$,
  'trusted grading RPC accepts a valid owned submission'
);
select is(
  (select is_correct from public.question_attempts
    where submission_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  false,
  'RPC derives incorrectness from the private grading rule'
);
select lives_ok(
  $$select * from public.record_practice_attempt(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'ap-calculus-bc',
    array['calc-limits-001'],
    'calc-limits-001',
    '"b"'::jsonb
  )$$,
  'repeating the same submission is idempotent'
);
select is(
  (select count(*)::integer from public.question_attempts
    where submission_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  1,
  'idempotent retry creates one attempt only'
);

reset role;
select * from finish();
rollback;
