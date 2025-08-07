-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_bible_verses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Care groups policies
DROP POLICY IF EXISTS "Anyone can view care groups" ON public.care_groups;
CREATE POLICY "Anyone can view care groups" ON public.care_groups
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage care groups" ON public.care_groups;
CREATE POLICY "Admins can manage care groups" ON public.care_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND member_level IN ('admin', 'moderator')
    )
  );

-- Group members policies
DROP POLICY IF EXISTS "Users can view their group memberships" ON public.group_members;
CREATE POLICY "Users can view their group memberships" ON public.group_members
  FOR SELECT USING (member_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;
CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND member_level IN ('admin', 'moderator')
    )
  );

-- Daily bible verses policies
DROP POLICY IF EXISTS "Anyone can view daily bible verses" ON public.daily_bible_verses;
CREATE POLICY "Anyone can view daily bible verses" ON public.daily_bible_verses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage daily bible verses" ON public.daily_bible_verses;
CREATE POLICY "Admins can manage daily bible verses" ON public.daily_bible_verses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND member_level IN ('admin', 'moderator')
    )
  );
