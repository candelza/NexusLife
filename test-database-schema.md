# 🧪 Test Database Schema

## Verify Profile Fields Are Added

The database has been reset and should now include the missing fields. Here's how to verify:

### 1. Check Database Schema
```sql
-- Run this in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

Expected columns:
- id (UUID)
- first_name (TEXT)
- last_name (TEXT)
- display_name (TEXT)
- avatar_url (TEXT)
- bio (TEXT) ✅
- phone (TEXT) ✅
- location (TEXT) ✅
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 2. Test Profile Edit
1. Go to http://localhost:8080/profile
2. Click "แก้ไขโปรไฟล์"
3. Fill in the form (including bio, phone, location)
4. Click "บันทึก"
5. Should work without errors

### 3. If Still Getting Errors

#### Option A: Manual Database Check
```sql
-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('bio', 'phone', 'location');
```

#### Option B: Force Add Columns
```sql
-- Manually add columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;
```

#### Option C: Reset Database Again
```bash
supabase db reset
```

### 4. Test Profile Creation
```sql
-- Test inserting a profile with new fields
INSERT INTO public.profiles (
  id, 
  first_name, 
  last_name, 
  display_name, 
  bio, 
  phone, 
  location
) VALUES (
  gen_random_uuid(),
  'Test',
  'User',
  'Test User',
  'This is a test bio',
  '123-456-7890',
  'Bangkok, Thailand'
);
```

## Expected Result
After the database reset, the profile edit should work correctly with all fields including bio, phone, and location.

## Troubleshooting
If you're still getting the 'bio' column error:
1. Check if you're connected to the correct database
2. Verify the migration was applied
3. Try accessing the profile edit again
4. Clear browser cache and reload 