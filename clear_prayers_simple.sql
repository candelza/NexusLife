-- ลบคำอธิฐานทั้งหมด
DELETE FROM public.prayer_responses;
DELETE FROM public.prayer_comments;
DELETE FROM public.prayer_likes;
DELETE FROM public.prayers;

-- สร้างคำอธิฐานใหม่ 10 ข้อ
INSERT INTO public.prayers (id, user_id, title, description, category, is_urgent, is_private, is_anonymous, status, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อครอบครัว', 'ขอให้ครอบครัวของเรามีความสุขและความสามัคคี', 'ครอบครัว', false, false, false, 'active', now() - interval '5 days', now() - interval '5 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อการรักษา', 'ขอให้การรักษาโรคเป็นไปด้วยดี', 'สุขภาพ', true, false, false, 'active', now() - interval '3 days', now() - interval '3 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานส่วนตัว', 'ขอให้มีสติปัญญาในการตัดสินใจ', 'ส่วนตัว', false, true, false, 'active', now() - interval '1 day', now() - interval '1 day'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อการงาน', 'ขอให้การทำงานเป็นไปด้วยดี', 'การงาน', false, false, false, 'active', now() - interval '2 days', now() - interval '2 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อการศึกษา', 'ขอให้การเรียนเป็นไปด้วยดี', 'การศึกษา', false, false, false, 'active', now() - interval '4 days', now() - interval '4 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อการเงิน', 'ขอให้มีรายได้ที่มั่นคง', 'การเงิน', false, false, false, 'active', now() - interval '6 days', now() - interval '6 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อความสัมพันธ์', 'ขอให้ความสัมพันธ์เป็นไปด้วยดี', 'ความสัมพันธ์', false, false, false, 'active', now() - interval '7 days', now() - interval '7 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อจิตวิญญาณ', 'ขอให้มีจิตใจที่สงบ', 'จิตวิญญาณ', false, false, false, 'active', now() - interval '8 days', now() - interval '8 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อสังคม', 'ขอให้สังคมมีความสงบสุข', 'สังคม', false, false, false, 'active', now() - interval '9 days', now() - interval '9 days'),
(gen_random_uuid(), (SELECT id FROM public.profiles LIMIT 1), 'คำอธิษฐานเพื่อโลก', 'ขอให้โลกมีความสงบสุข', 'โลก', false, false, false, 'active', now() - interval '10 days', now() - interval '10 days');

-- เพิ่มคำตอบและไลค์
INSERT INTO public.prayer_responses (id, prayer_id, user_id, response_type, content, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อครอบครัว' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1), 'prayer', 'ขออธิษฐานร่วมด้วย', now() - interval '4 days');

INSERT INTO public.prayer_likes (id, prayer_id, user_id, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อครอบครัว' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1), now() - interval '3 days');

-- แสดงผลลัพธ์
SELECT 'Prayers cleared and reset successfully!' as message;
SELECT COUNT(*) as total_prayers FROM public.prayers;
