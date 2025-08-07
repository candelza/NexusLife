-- ลบข้อมูล mockup ทั้งหมดและสร้างใหม่
-- รวมคำอธิฐานและกลุ่มดูแล

-- 1. ลบข้อมูลทั้งหมด
DELETE FROM public.prayer_responses;
DELETE FROM public.prayer_comments;
DELETE FROM public.prayer_likes;
DELETE FROM public.prayers;
DELETE FROM public.group_members;
DELETE FROM public.care_groups;

-- 2. ตรวจสอบและสร้าง user ตัวอย่างถ้าไม่มี
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
            'ผู้ดูแล',
            'ระบบ',
            'ผู้ดูแลระบบ',
            'admin'
        );
    END IF;
    
    -- หา user แรก
    SELECT id INTO first_user_id FROM public.profiles LIMIT 1;
    
    -- สร้างกลุ่มดูแลใหม่
    INSERT INTO public.care_groups (id, name, description, leader_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'กลุ่มคนหนุ่มสาว', 'กลุ่มสำหรับคนหนุ่มสาววัย 18-30 ปี มาสร้างความสัมพันธ์และเติบโตในความเชื่อร่วมกัน', first_user_id, now() - interval '30 days', now() - interval '30 days'),
    (gen_random_uuid(), 'กลุ่มครอบครัว', 'กลุ่มสำหรับครอบครัวที่มีลูก เรียนรู้การเลี้ยงลูกตามหลักคริสเตียน', first_user_id, now() - interval '25 days', now() - interval '25 days'),
    (gen_random_uuid(), 'กลุ่มผู้ทำงาน', 'กลุ่มสำหรับคนทำงานวัยกลางคน แบ่งปันประสบการณ์และสนับสนุนกัน', first_user_id, now() - interval '20 days', now() - interval '20 days'),
    (gen_random_uuid(), 'กลุ่มผู้สูงอายุ', 'กลุ่มสำหรับผู้สูงอายุ 60+ ใช้ชีวิตอย่างมีคุณค่าและมีเป้าหมาย', first_user_id, now() - interval '15 days', now() - interval '15 days'),
    (gen_random_uuid(), 'กลุ่มนักเรียน', 'กลุ่มสำหรับนักเรียน นักศึกษา เรียนรู้และเติบโตในความเชื่อ', first_user_id, now() - interval '10 days', now() - interval '10 days'),
    (gen_random_uuid(), 'กลุ่มสมาชิกใหม่', 'กลุ่มต้อนรับสมาชิกใหม่ เรียนรู้และปรับตัวเข้ากับชุมชน', first_user_id, now() - interval '5 days', now() - interval '5 days'),
    (gen_random_uuid(), 'กลุ่มผู้ชาย', 'กลุ่มสำหรับผู้ชายเท่านั้น แบ่งปันและสนับสนุนกันในฐานะผู้ชายคริสเตียน', first_user_id, now() - interval '12 days', now() - interval '12 days'),
    (gen_random_uuid(), 'กลุ่มผู้หญิง', 'กลุ่มสำหรับผู้หญิงเท่านั้น สร้างความสัมพันธ์และสนับสนุนกันในฐานะผู้หญิงคริสเตียน', first_user_id, now() - interval '8 days', now() - interval '8 days'),
    (gen_random_uuid(), 'กลุ่มอธิษฐาน', 'กลุ่มที่เน้นการอธิษฐานและแสวงหาพระเจ้า', first_user_id, now() - interval '18 days', now() - interval '18 days'),
    (gen_random_uuid(), 'กลุ่มศึกษาพระคัมภีร์', 'กลุ่มที่เน้นการศึกษาพระคัมภีร์และเรียนรู้หลักคำสอน', first_user_id, now() - interval '22 days', now() - interval '22 days');
    
    -- เพิ่มสมาชิกในกลุ่มต่างๆ
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มคนหนุ่มสาว' LIMIT 1), first_user_id, 'leader', now() - interval '30 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มครอบครัว' LIMIT 1), first_user_id, 'leader', now() - interval '25 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้ทำงาน' LIMIT 1), first_user_id, 'leader', now() - interval '20 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้สูงอายุ' LIMIT 1), first_user_id, 'leader', now() - interval '15 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มนักเรียน' LIMIT 1), first_user_id, 'leader', now() - interval '10 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มสมาชิกใหม่' LIMIT 1), first_user_id, 'leader', now() - interval '5 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้ชาย' LIMIT 1), first_user_id, 'leader', now() - interval '12 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้หญิง' LIMIT 1), first_user_id, 'leader', now() - interval '8 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มอธิษฐาน' LIMIT 1), first_user_id, 'leader', now() - interval '18 days'),
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มศึกษาพระคัมภีร์' LIMIT 1), first_user_id, 'leader', now() - interval '22 days');
    
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
    
    RAISE NOTICE 'All mockup data cleared and reset successfully!';
END $$;

-- แสดงผลลัพธ์
SELECT 'All mockup data cleared and reset successfully!' as message;
SELECT COUNT(*) as total_prayers FROM public.prayers;
SELECT COUNT(*) as total_care_groups FROM public.care_groups;
SELECT COUNT(*) as total_group_members FROM public.group_members;
SELECT COUNT(*) as total_responses FROM public.prayer_responses;
SELECT COUNT(*) as total_likes FROM public.prayer_likes;

-- แสดงรายละเอียดกลุ่มดูแล
SELECT 
    cg.name as group_name,
    cg.description,
    p.display_name as leader_name,
    COUNT(gm.id) as member_count
FROM public.care_groups cg
LEFT JOIN public.profiles p ON cg.leader_id = p.id
LEFT JOIN public.group_members gm ON cg.id = gm.group_id
GROUP BY cg.id, cg.name, cg.description, p.display_name
ORDER BY cg.name;
