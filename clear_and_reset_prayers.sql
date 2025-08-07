-- ลบคำอธิฐานทั้งหมดและสร้างใหม่
-- ไฟล์นี้จะลบข้อมูลทั้งหมดในตารางที่เกี่ยวข้องกับคำอธิฐานและสร้างข้อมูลใหม่

-- 1. ลบข้อมูลทั้งหมดในตารางที่เกี่ยวข้องกับคำอธิฐาน
DELETE FROM public.prayer_responses;
DELETE FROM public.prayer_comments;
DELETE FROM public.prayer_likes;
DELETE FROM public.prayers;

-- 2. รีเซ็ต sequence (ถ้ามี)
-- ALTER SEQUENCE IF EXISTS prayers_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS prayer_responses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS prayer_comments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS prayer_likes_id_seq RESTART WITH 1;

-- 3. สร้างคำอธิฐานใหม่ (ตัวอย่าง)
-- หมายเหตุ: ต้องมี user_id ที่มีอยู่จริงในตาราง profiles

-- คำอธิฐานที่ 1: คำอธิฐานทั่วไป
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1), -- ใช้ user แรกที่มีในระบบ
  'คำอธิษฐานเพื่อครอบครัว',
  'ขอให้ครอบครัวของเรามีความสุขและความสามัคคี ขอให้ทุกคนในครอบครัวมีสุขภาพแข็งแรงและมีจิตใจที่สงบ',
  'ครอบครัว',
  false,
  false,
  false,
  'active',
  now() - interval '5 days',
  now() - interval '5 days'
);

-- คำอธิฐานที่ 2: คำอธิฐานเร่งด่วน
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อการรักษา',
  'ขอให้การรักษาโรคเป็นไปด้วยดี ขอให้แพทย์และพยาบาลมีความสามารถในการดูแลผู้ป่วย',
  'สุขภาพ',
  true,
  false,
  false,
  'active',
  now() - interval '3 days',
  now() - interval '3 days'
);

-- คำอธิฐานที่ 3: คำอธิฐานส่วนตัว
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานส่วนตัว',
  'ขอให้มีสติปัญญาในการตัดสินใจและมีกำลังใจในการทำงาน',
  'ส่วนตัว',
  false,
  true,
  false,
  'active',
  now() - interval '1 day',
  now() - interval '1 day'
);

-- คำอธิฐานที่ 4: คำอธิษฐานเพื่อการงาน
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อการงาน',
  'ขอให้การทำงานเป็นไปด้วยดี มีความก้าวหน้าและมีโอกาสที่ดีในการทำงาน',
  'การงาน',
  false,
  false,
  false,
  'active',
  now() - interval '2 days',
  now() - interval '2 days'
);

-- คำอธิฐานที่ 5: คำอธิษฐานเพื่อการศึกษา
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อการศึกษา',
  'ขอให้การเรียนเป็นไปด้วยดี มีความเข้าใจในบทเรียนและสอบได้คะแนนดี',
  'การศึกษา',
  false,
  false,
  false,
  'active',
  now() - interval '4 days',
  now() - interval '4 days'
);

-- คำอธิฐานที่ 6: คำอธิษฐานเพื่อการเงิน
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อการเงิน',
  'ขอให้มีรายได้ที่มั่นคงและสามารถจัดการการเงินได้อย่างมีประสิทธิภาพ',
  'การเงิน',
  false,
  false,
  false,
  'active',
  now() - interval '6 days',
  now() - interval '6 days'
);

-- คำอธิฐานที่ 7: คำอธิษฐานเพื่อความสัมพันธ์
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อความสัมพันธ์',
  'ขอให้ความสัมพันธ์กับคนรอบข้างเป็นไปด้วยดี มีความเข้าใจและให้อภัยกัน',
  'ความสัมพันธ์',
  false,
  false,
  false,
  'active',
  now() - interval '7 days',
  now() - interval '7 days'
);

-- คำอธิฐานที่ 8: คำอธิษฐานเพื่อจิตวิญญาณ
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อจิตวิญญาณ',
  'ขอให้มีจิตใจที่สงบและมีความเชื่อที่แข็งแกร่ง ขอให้สามารถช่วยเหลือผู้อื่นได้',
  'จิตวิญญาณ',
  false,
  false,
  false,
  'active',
  now() - interval '8 days',
  now() - interval '8 days'
);

-- คำอธิฐานที่ 9: คำอธิษฐานเพื่อสังคม
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อสังคม',
  'ขอให้สังคมมีความสงบสุข มีความยุติธรรมและทุกคนมีโอกาสที่เท่าเทียมกัน',
  'สังคม',
  false,
  false,
  false,
  'active',
  now() - interval '9 days',
  now() - interval '9 days'
);

-- คำอธิฐานที่ 10: คำอธิษฐานเพื่อโลก
INSERT INTO public.prayers (
  id,
  user_id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles LIMIT 1),
  'คำอธิษฐานเพื่อโลก',
  'ขอให้โลกมีความสงบสุข สิ่งแวดล้อมดีขึ้น และทุกคนมีชีวิตที่ดี',
  'โลก',
  false,
  false,
  false,
  'active',
  now() - interval '10 days',
  now() - interval '10 days'
);

-- 4. เพิ่มคำตอบและความคิดเห็นให้กับคำอธิฐานบางส่วน

-- เพิ่มคำตอบให้กับคำอธิฐานที่ 1
INSERT INTO public.prayer_responses (
  id,
  prayer_id,
  user_id,
  response_type,
  content,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อครอบครัว' LIMIT 1),
  (SELECT id FROM public.profiles LIMIT 1),
  'prayer',
  'ขออธิษฐานร่วมด้วย ให้ครอบครัวของคุณมีความสุขและความสามัคคี',
  now() - interval '4 days'
);

-- เพิ่มความคิดเห็นให้กับคำอธิฐานที่ 2
INSERT INTO public.prayer_responses (
  id,
  prayer_id,
  user_id,
  response_type,
  content,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อการรักษา' LIMIT 1),
  (SELECT id FROM public.profiles LIMIT 1),
  'comment',
  'ขอให้การรักษาเป็นไปด้วยดี และมีสุขภาพแข็งแรง',
  now() - interval '2 days'
);

-- เพิ่มการกดไลค์ให้กับคำอธิฐานที่ 1
INSERT INTO public.prayer_likes (
  id,
  prayer_id,
  user_id,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อครอบครัว' LIMIT 1),
  (SELECT id FROM public.profiles LIMIT 1),
  now() - interval '3 days'
);

-- 5. แสดงผลลัพธ์
SELECT 'Prayers cleared and reset successfully!' as message;
SELECT COUNT(*) as total_prayers FROM public.prayers;
SELECT COUNT(*) as total_responses FROM public.prayer_responses;
SELECT COUNT(*) as total_likes FROM public.prayer_likes;
