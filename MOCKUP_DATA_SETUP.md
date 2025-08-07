# การตั้งค่า Mockup Data สำหรับ Faith Nexus Hub

## 📋 ข้อมูลที่ต้องการ

### Supabase Configuration
- **Database Password**: `:hNOV8LYxzsAm8uKN`
- **Supabase URL**: ต้องได้จาก Supabase Dashboard
- **Supabase Anon Key**: ต้องได้จาก Supabase Dashboard

## 🚀 วิธีใช้งาน

### วิธีที่ 1: ใช้ SQL Script (แนะนำ)

1. **เปิด Supabase Dashboard**
   - ไปที่ https://supabase.com
   - เข้าสู่ระบบและเลือกโปรเจกต์

2. **เปิด SQL Editor**
   - คลิกที่ "SQL Editor" ในเมนูด้านซ้าย
   - คลิก "New Query"

3. **รัน SQL Script**
   - คัดลอกเนื้อหาจากไฟล์ `insert_mockup_prayers.sql`
   - วางใน SQL Editor
   - คลิก "Run" เพื่อรันสคริปต์

### วิธีที่ 2: ใช้ Node.js Script

1. **ติดตั้ง Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **แก้ไข Configuration**
   - เปิดไฟล์ `insert_mockup_data.js`
   - แก้ไข `supabaseUrl` และ `supabaseKey` ให้ตรงกับโปรเจกต์ของคุณ

3. **รัน Script**
   ```bash
   node insert_mockup_data.js
   ```

## 📊 ข้อมูลที่จะถูกเพิ่ม

### 1. Test User Profile
- **ID**: `550e8400-e29b-41d4-a716-446655440001`
- **Display Name**: ผู้ทดสอบระบบ
- **Email**: test.user@faithnexus.com

### 2. Mockup Prayers (5 รายการ)

#### 1. ขอให้ครอบครัวมีสุขภาพแข็งแรง
- **หมวดหมู่**: สุขภาพ
- **สถานะ**: กำลังดำเนินการ
- **เร่งด่วน**: ไม่
- **วันที่สร้าง**: 5 วันที่แล้ว

#### 2. ขอให้การงานเจริญก้าวหน้า
- **หมวดหมู่**: การงาน
- **สถานะ**: กำลังดำเนินการ
- **เร่งด่วน**: ไม่
- **วันที่สร้าง**: 3 วันที่แล้ว

#### 3. ขอให้ลูกเรียนหนังสือเก่ง
- **หมวดหมู่**: การศึกษา
- **สถานะ**: ได้รับการตอบ
- **เร่งด่วน**: ไม่
- **วันที่สร้าง**: 7 วันที่แล้ว

#### 4. ขอให้พ่อแม่หายป่วย
- **หมวดหมู่**: สุขภาพ
- **สถานะ**: กำลังดำเนินการ
- **เร่งด่วน**: ใช่
- **วันที่สร้าง**: 1 วันที่แล้ว

#### 5. ขอให้มีความสัมพันธ์ที่ดีในครอบครัว
- **หมวดหมู่**: ครอบครัว
- **สถานะ**: กำลังดำเนินการ
- **เร่งด่วน**: ไม่
- **วันที่สร้าง**: 2 วันที่แล้ว

### 3. Interaction Data
- **Likes**: 1 like ต่อคำอธิษฐาน
- **Comments**: 1 comment ต่อคำอธิษฐาน

## 🔧 การตรวจสอบ

หลังจากรันสคริปต์แล้ว คุณสามารถตรวจสอบได้โดย:

1. **ใน Supabase Dashboard**
   - ไปที่ "Table Editor"
   - ตรวจสอบตาราง `prayers`, `profiles`, `prayer_likes`, `prayer_responses`

2. **ในแอปพลิเคชัน**
   - เปิดแอปพลิเคชัน
   - ไปที่หน้า Dashboard
   - ตรวจสอบว่าคำอธิษฐานแสดงขึ้นมา

## 🛠️ การแก้ไขปัญหา

### ปัญหาที่อาจเกิดขึ้น:

1. **Permission Error**
   - ตรวจสอบ RLS (Row Level Security) policies
   - ตรวจสอบสิทธิ์การเข้าถึงตาราง

2. **Foreign Key Error**
   - ตรวจสอบว่ามี user profile อยู่แล้ว
   - ตรวจสอบความถูกต้องของ user_id

3. **Connection Error**
   - ตรวจสอบ Supabase URL และ Key
   - ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

### คำสั่ง SQL สำหรับตรวจสอบ:

```sql
-- ตรวจสอบ prayers
SELECT * FROM public.prayers ORDER BY created_at DESC;

-- ตรวจสอบ profiles
SELECT * FROM public.profiles;

-- ตรวจสอบ likes
SELECT * FROM public.prayer_likes;

-- ตรวจสอบ comments
SELECT * FROM public.prayer_responses WHERE response_type = 'comment';
```

## 📝 หมายเหตุ

- ข้อมูลนี้เป็น mockup data สำหรับการทดสอบเท่านั้น
- สามารถลบข้อมูลได้โดยใช้คำสั่ง SQL ใน Supabase Dashboard
- ข้อมูลจะถูกสร้างด้วย user_id ที่กำหนดไว้

## 🗑️ การลบข้อมูล

หากต้องการลบ mockup data:

```sql
-- ลบ comments
DELETE FROM public.prayer_responses WHERE id LIKE 'response-%';

-- ลบ likes
DELETE FROM public.prayer_likes WHERE prayer_id LIKE 'prayer-%';

-- ลบ prayers
DELETE FROM public.prayers WHERE id LIKE 'prayer-%';

-- ลบ profile (ถ้าต้องการ)
DELETE FROM public.profiles WHERE id = '550e8400-e29b-41d4-a716-446655440001';
```
