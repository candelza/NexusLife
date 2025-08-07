-- Add member_level column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'member_level'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN member_level TEXT DEFAULT 'member' CHECK (member_level IN ('admin', 'moderator', 'member'));
    END IF;
END $$;

-- Add scheduled_date and scheduled_time columns to bible_verses if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bible_verses' AND column_name = 'scheduled_date'
    ) THEN
        ALTER TABLE public.bible_verses ADD COLUMN scheduled_date DATE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bible_verses' AND column_name = 'scheduled_time'
    ) THEN
        ALTER TABLE public.bible_verses ADD COLUMN scheduled_time TIME;
    END IF;
END $$;

-- Admin policies for profiles
DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for care groups
DROP POLICY IF EXISTS "Admin can update care groups" ON public.care_groups;
CREATE POLICY "Admin can update care groups" ON public.care_groups FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin can delete care groups" ON public.care_groups;
CREATE POLICY "Admin can delete care groups" ON public.care_groups FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for group members
DROP POLICY IF EXISTS "Admin can manage group members" ON public.group_members;
CREATE POLICY "Admin can manage group members" ON public.group_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for prayers
DROP POLICY IF EXISTS "Admin can manage prayers" ON public.prayers;
CREATE POLICY "Admin can manage prayers" ON public.prayers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for prayer responses
DROP POLICY IF EXISTS "Admin can manage prayer responses" ON public.prayer_responses;
CREATE POLICY "Admin can manage prayer responses" ON public.prayer_responses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for events
DROP POLICY IF EXISTS "Admin can manage events" ON public.events;
CREATE POLICY "Admin can manage events" ON public.events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for bible verses
DROP POLICY IF EXISTS "Admin can manage bible verses" ON public.bible_verses;
CREATE POLICY "Admin can manage bible verses" ON public.bible_verses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Admin policies for user roles
DROP POLICY IF EXISTS "Admin can manage user roles" ON public.user_roles;
CREATE POLICY "Admin can manage user roles" ON public.user_roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);
