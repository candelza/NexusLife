-- Insert mockup prayers data
-- Database password: :hNOV8LYxzsAm8uKN

-- First, let's check if we have any existing users to reference
-- If not, we'll create a test user first

-- Insert test user if not exists
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'test.user@faithnexus.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User", "avatar_url": null}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert test profile
INSERT INTO public.profiles (
  id,
  display_name,
  first_name,
  last_name,
  avatar_url,
  bio,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'ผู้ทดสอบระบบ',
  'ผู้ทดสอบ',
  'ระบบ',
  null,
  'ผู้ใช้ทดสอบระบบ Faith Nexus Hub',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert mockup prayers
INSERT INTO public.prayers (
  id,
  title,
  description,
  category,
  is_urgent,
  is_private,
  is_anonymous,
  status,
  user_id,
  created_at,
  updated_at
) VALUES 
(
  'prayer-001',
  'ขอให้ครอบครัวมีสุขภาพแข็งแรง',
  'ขอให้สมาชิกในครอบครัวทุกคนมีสุขภาพแข็งแรง มีความสุข และอยู่ร่วมกันอย่างอบอุ่น ขอให้พระเจ้าคุ้มครองและอวยพรครอบครัวของเรา',
  'สุขภาพ',
  false,
  false,
  false,
  'pending',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  'prayer-002',
  'ขอให้การงานเจริญก้าวหน้า',
  'ขอให้การงานที่ทำอยู่เจริญก้าวหน้า มีความสำเร็จ และมีรายได้ที่เพียงพอสำหรับครอบครัว ขอให้มีโอกาสก้าวหน้าในหน้าที่การงาน',
  'การงาน',
  false,
  false,
  false,
  'pending',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  'prayer-003',
  'ขอให้ลูกเรียนหนังสือเก่ง',
  'ขอให้ลูกมีสมาธิในการเรียน มีความตั้งใจ และเรียนหนังสือเก่ง ขอให้มีผลการเรียนที่ดี และมีความสุขในการเรียน',
  'การศึกษา',
  false,
  false,
  false,
  'answered',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '2 days'
),
(
  'prayer-004',
  'ขอให้พ่อแม่หายป่วย',
  'ขอให้พ่อแม่หายป่วยจากโรคภัยไข้เจ็บ มีสุขภาพแข็งแรง และมีอายุยืนยาว ขอให้พระเจ้าคุ้มครองและรักษาพ่อแม่ของเรา',
  'สุขภาพ',
  true,
  false,
  false,
  'pending',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'prayer-005',
  'ขอให้มีความสัมพันธ์ที่ดีในครอบครัว',
  'ขอให้สมาชิกในครอบครัวมีความสัมพันธ์ที่ดีต่อกัน มีความเข้าใจและให้อภัยซึ่งกันและกัน ขอให้ครอบครัวมีความสุขและอบอุ่น',
  'ครอบครัว',
  false,
  false,
  false,
  'pending',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Insert some prayer likes
INSERT INTO public.prayer_likes (
  prayer_id,
  user_id,
  created_at
) VALUES 
('prayer-001', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '4 days'),
('prayer-002', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days'),
('prayer-003', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '6 days'),
('prayer-004', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day'),
('prayer-005', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day');

-- Insert some prayer responses/comments
INSERT INTO public.prayer_responses (
  id,
  prayer_id,
  user_id,
  content,
  response_type,
  created_at
) VALUES 
(
  'response-001',
  'prayer-001',
  '550e8400-e29b-41d4-a716-446655440001',
  'ขอให้ครอบครัวของคุณมีสุขภาพแข็งแรงและมีความสุขครับ',
  'comment',
  NOW() - INTERVAL '4 days'
),
(
  'response-002',
  'prayer-002',
  '550e8400-e29b-41d4-a716-446655440001',
  'ขอให้การงานเจริญก้าวหน้าครับ พระเจ้าจะอวยพร',
  'comment',
  NOW() - INTERVAL '2 days'
),
(
  'response-003',
  'prayer-003',
  '550e8400-e29b-41d4-a716-446655440001',
  'ขอบคุณพระเจ้าที่ตอบคำอธิษฐาน ขอให้ลูกเรียนเก่งขึ้นจริงๆ',
  'comment',
  NOW() - INTERVAL '1 day'
),
(
  'response-004',
  'prayer-004',
  '550e8400-e29b-41d4-a716-446655440001',
  'ขอให้พ่อแม่หายป่วยเร็วๆ ครับ พระเจ้าจะรักษา',
  'comment',
  NOW() - INTERVAL '1 day'
),
(
  'response-005',
  'prayer-005',
  '550e8400-e29b-41d4-a716-446655440001',
  'ขอให้ครอบครัวมีความสัมพันธ์ที่ดีต่อกันครับ',
  'comment',
  NOW() - INTERVAL '1 day'
);

-- Update prayer counts
UPDATE public.prayers 
SET 
  likes_count = (
    SELECT COUNT(*) FROM public.prayer_likes WHERE prayer_id = prayers.id
  ),
  comments_count = (
    SELECT COUNT(*) FROM public.prayer_responses WHERE prayer_id = prayers.id AND response_type = 'comment'
  )
WHERE id IN ('prayer-001', 'prayer-002', 'prayer-003', 'prayer-004', 'prayer-005');

-- Display the inserted data
SELECT 
  p.id,
  p.title,
  p.description,
  p.category,
  p.is_urgent,
  p.status,
  p.likes_count,
  p.comments_count,
  p.created_at,
  pr.display_name as author_name
FROM public.prayers p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
WHERE p.id IN ('prayer-001', 'prayer-002', 'prayer-003', 'prayer-004', 'prayer-005')
ORDER BY p.created_at DESC;
