-- ลบคำอธิฐานทั้งหมดและสร้างใหม่
-- วิธีที่ปลอดภัยและง่ายที่สุด

-- 1. ลบข้อมูลทั้งหมด
DELETE FROM public.prayer_responses;
DELETE FROM public.prayer_comments;
DELETE FROM public.prayer_likes;
DELETE FROM public.prayers;

-- 2. ตรวจสอบว่ามี user ในระบบหรือไม่
DO $$
DECLARE
    user_count INTEGER;
    first_user_id UUID;
BEGIN
    -- นับจำนวน user
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    -- ถ้าไม่มี user ให้สร้าง user ตัวอย่าง
    IF user_count = 0 THEN
        INSERT INTO public.profiles (id, first_name, last_name, display_name, member_level)
        VALUES (
            gen_random_uuid(),
            'ผู้ใช้',
            'ตัวอย่าง',
            'ผู้ใช้ตัวอย่าง',
            'member'
        );
    END IF;
    
    -- หา user แรก
    SELECT id INTO first_user_id FROM public.profiles LIMIT 1;
    
    -- สร้างคำอธิฐานใหม่
    INSERT INTO public.prayers (id, user_id, title, description, category, is_urgent, is_private, is_anonymous, status, created_at, updated_at) VALUES
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อครอบครัว', 'ขอให้ครอบครัวของเรามีความสุขและความสามัคคี ขอให้ทุกคนในครอบครัวมีสุขภาพแข็งแรงและมีจิตใจที่สงบ', 'ครอบครัว', false, false, false, 'active', now() - interval '5 days', now() - interval '5 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อการรักษา', 'ขอให้การรักษาโรคเป็นไปด้วยดี ขอให้แพทย์และพยาบาลมีความสามารถในการดูแลผู้ป่วย', 'สุขภาพ', true, false, false, 'active', now() - interval '3 days', now() - interval '3 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานส่วนตัว', 'ขอให้มีสติปัญญาในการตัดสินใจและมีกำลังใจในการทำงาน', 'ส่วนตัว', false, true, false, 'active', now() - interval '1 day', now() - interval '1 day'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อการงาน', 'ขอให้การทำงานเป็นไปด้วยดี มีความก้าวหน้าและมีโอกาสที่ดีในการทำงาน', 'การงาน', false, false, false, 'active', now() - interval '2 days', now() - interval '2 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อการศึกษา', 'ขอให้การเรียนเป็นไปด้วยดี มีความเข้าใจในบทเรียนและสอบได้คะแนนดี', 'การศึกษา', false, false, false, 'active', now() - interval '4 days', now() - interval '4 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อการเงิน', 'ขอให้มีรายได้ที่มั่นคงและสามารถจัดการการเงินได้อย่างมีประสิทธิภาพ', 'การเงิน', false, false, false, 'active', now() - interval '6 days', now() - interval '6 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อความสัมพันธ์', 'ขอให้ความสัมพันธ์กับคนรอบข้างเป็นไปด้วยดี มีความเข้าใจและให้อภัยกัน', 'ความสัมพันธ์', false, false, false, 'active', now() - interval '7 days', now() - interval '7 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อจิตวิญญาณ', 'ขอให้มีจิตใจที่สงบและมีความเชื่อที่แข็งแกร่ง ขอให้สามารถช่วยเหลือผู้อื่นได้', 'จิตวิญญาณ', false, false, false, 'active', now() - interval '8 days', now() - interval '8 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อสังคม', 'ขอให้สังคมมีความสงบสุข มีความยุติธรรมและทุกคนมีโอกาสที่เท่าเทียมกัน', 'สังคม', false, false, false, 'active', now() - interval '9 days', now() - interval '9 days'),
    (gen_random_uuid(), first_user_id, 'คำอธิษฐานเพื่อโลก', 'ขอให้โลกมีความสงบสุข สิ่งแวดล้อมดีขึ้น และทุกคนมีชีวิตที่ดี', 'โลก', false, false, false, 'active', now() - interval '10 days', now() - interval '10 days');
    
    -- เพิ่มคำตอบและไลค์
    INSERT INTO public.prayer_responses (id, prayer_id, user_id, response_type, content, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อครอบครัว' LIMIT 1), first_user_id, 'prayer', 'ขออธิษฐานร่วมด้วย ให้ครอบครัวของคุณมีความสุขและความสามัคคี', now() - interval '4 days');
    
    INSERT INTO public.prayer_likes (id, prayer_id, user_id, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.prayers WHERE title = 'คำอธิษฐานเพื่อครอบครัว' LIMIT 1), first_user_id, now() - interval '3 days');
    
    RAISE NOTICE 'Prayers cleared and reset successfully!';
END $$;

-- แสดงผลลัพธ์
SELECT 'Prayers cleared and reset successfully!' as message;
SELECT COUNT(*) as total_prayers FROM public.prayers;
SELECT COUNT(*) as total_responses FROM public.prayer_responses;
SELECT COUNT(*) as total_likes FROM public.prayer_likes;
