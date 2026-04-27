insert into public.subjects (key, name)
values
  ('math', 'Math'),
  ('reading', 'Reading'),
  ('spelling', 'Spelling'),
  ('financial-literacy', 'Financial Literacy'),
  ('ai-literacy', 'AI Literacy')
on conflict (key) do update set name = excluded.name;

with math_subject as (
  select id from public.subjects where key = 'math'
), reading_subject as (
  select id from public.subjects where key = 'reading'
)
insert into public.skills (subject_id, key, name, grade_band, standard_code)
select id, 'math-addition-1', 'Single-digit addition', 'K-2', null from math_subject
union all
select id, 'reading-sight-words-1', 'Sight words basics', 'K-2', null from reading_subject
on conflict (key) do update
set
  name = excluded.name,
  grade_band = excluded.grade_band,
  standard_code = excluded.standard_code;

-- Household-scoped starter lessons are inserted by app onboarding flow when household exists.
