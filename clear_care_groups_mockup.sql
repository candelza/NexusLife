-- ลบข้อมูลกลุ่มดูแล mockup ทั้งหมดและสร้างใหม่
-- วิธีที่ปลอดภัยและเชื่อมต่อกับ Supabase data

-- 1. ลบข้อมูล mockup ทั้งหมด
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
    
    -- สร้างกลุ่มดูแลใหม่ที่เชื่อมต่อกับ Supabase
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
    
    -- เพิ่มสมาชิกตัวอย่างในกลุ่มต่างๆ
    -- กลุ่มคนหนุ่มสาว
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มคนหนุ่มสาว' LIMIT 1), first_user_id, 'leader', now() - interval '30 days');
    
    -- กลุ่มครอบครัว
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มครอบครัว' LIMIT 1), first_user_id, 'leader', now() - interval '25 days');
    
    -- กลุ่มผู้ทำงาน
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้ทำงาน' LIMIT 1), first_user_id, 'leader', now() - interval '20 days');
    
    -- กลุ่มผู้สูงอายุ
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้สูงอายุ' LIMIT 1), first_user_id, 'leader', now() - interval '15 days');
    
    -- กลุ่มนักเรียน
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มนักเรียน' LIMIT 1), first_user_id, 'leader', now() - interval '10 days');
    
    -- กลุ่มสมาชิกใหม่
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มสมาชิกใหม่' LIMIT 1), first_user_id, 'leader', now() - interval '5 days');
    
    -- กลุ่มผู้ชาย
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้ชาย' LIMIT 1), first_user_id, 'leader', now() - interval '12 days');
    
    -- กลุ่มผู้หญิง
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มผู้หญิง' LIMIT 1), first_user_id, 'leader', now() - interval '8 days');
    
    -- กลุ่มอธิษฐาน
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มอธิษฐาน' LIMIT 1), first_user_id, 'leader', now() - interval '18 days');
    
    -- กลุ่มศึกษาพระคัมภีร์
    INSERT INTO public.group_members (id, group_id, user_id, role, joined_at) VALUES
    (gen_random_uuid(), (SELECT id FROM public.care_groups WHERE name = 'กลุ่มศึกษาพระคัมภีร์' LIMIT 1), first_user_id, 'leader', now() - interval '22 days');
    
    RAISE NOTICE 'Care groups cleared and reset successfully!';
END $$;

-- แสดงผลลัพธ์
SELECT 'Care groups cleared and reset successfully!' as message;
SELECT COUNT(*) as total_care_groups FROM public.care_groups;
SELECT COUNT(*) as total_group_members FROM public.group_members;

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
