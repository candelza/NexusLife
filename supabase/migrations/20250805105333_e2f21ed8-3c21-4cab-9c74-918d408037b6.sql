-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  member_level TEXT DEFAULT 'member' CHECK (member_level IN ('admin', 'moderator', 'member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create care_groups table
CREATE TABLE public.care_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.care_groups ENABLE ROW LEVEL SECURITY;

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.care_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create prayers table
CREATE TABLE public.prayers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  care_group_id UUID REFERENCES public.care_groups(id),
  is_urgent BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'answered', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

-- Create prayer_responses table
CREATE TABLE public.prayer_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_type TEXT NOT NULL CHECK (response_type IN ('prayer', 'comment', 'testimony')),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_responses ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('prayer', 'worship', 'study', 'fellowship', 'service', 'general')),
  organizer_id UUID REFERENCES public.profiles(id),
  care_group_id UUID REFERENCES public.care_groups(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_care_groups_updated_at BEFORE UPDATE ON public.care_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prayers_updated_at BEFORE UPDATE ON public.prayers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies for profiles
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Care groups policies
CREATE POLICY "Anyone can view care groups" ON public.care_groups FOR SELECT USING (true);
CREATE POLICY "Group leaders can update their groups" ON public.care_groups FOR UPDATE USING (leader_id = auth.uid());
CREATE POLICY "Authenticated users can create groups" ON public.care_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin policies for care groups
CREATE POLICY "Admin can update care groups" ON public.care_groups FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);
CREATE POLICY "Admin can delete care groups" ON public.care_groups FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Group members policies
CREATE POLICY "Users can view group memberships" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Group leaders can manage members" ON public.group_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.care_groups 
    WHERE id = group_id AND leader_id = auth.uid()
  )
);

-- Admin policies for group members
CREATE POLICY "Admin can manage group members" ON public.group_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Prayers policies
CREATE POLICY "Users can view non-private prayers" ON public.prayers FOR SELECT USING (
  NOT is_private OR 
  user_id = auth.uid() OR
  (is_private AND care_group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = care_group_id AND user_id = auth.uid()
  ))
);
CREATE POLICY "Users can create prayers" ON public.prayers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayers" ON public.prayers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayers" ON public.prayers FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for prayers
CREATE POLICY "Admin can manage prayers" ON public.prayers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Prayer responses policies
CREATE POLICY "Users can view prayer responses for visible prayers" ON public.prayer_responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.prayers p 
    WHERE p.id = prayer_id AND (
      NOT p.is_private OR 
      p.user_id = auth.uid() OR
      (p.is_private AND p.care_group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_id = p.care_group_id AND user_id = auth.uid()
      ))
    )
  )
);
CREATE POLICY "Users can create prayer responses" ON public.prayer_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own responses" ON public.prayer_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own responses" ON public.prayer_responses FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for prayer responses
CREATE POLICY "Admin can manage prayer responses" ON public.prayer_responses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Events policies
CREATE POLICY "Users can view public events or group events they're in" ON public.events FOR SELECT USING (
  is_public OR 
  organizer_id = auth.uid() OR
  (care_group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = care_group_id AND user_id = auth.uid()
  ))
);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Event organizers can update their events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Event organizers can delete their events" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- Admin policies for events
CREATE POLICY "Admin can manage events" ON public.events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Insert sample data
INSERT INTO public.care_groups (name, description) VALUES
('กลุ่มคนหนุ่มสาว', 'กลุ่มสำหรับคนหนุ่มสาววัย 18-30 ปี'),
('กลุ่มครอบครัว', 'กลุ่มสำหรับครอบครัวที่มีลูก'),
('กลุ่มผู้ทำงาน', 'กลุ่มสำหรับคนทำงานวัยกลางคน'),
('กลุ่มผู้สูงอายุ', 'กลุ่มสำหรับผู้สูงอายุ 60+'),
('กลุ่มนักเรียน', 'กลุ่มสำหรับนักเรียน นักศึกษา'),
('กลุ่มสมาชิกใหม่', 'กลุ่มต้อนรับสมาชิกใหม่'),
('กลุ่มผู้ชาย', 'กลุ่มสำหรับผู้ชายเท่านั้น'),
('กลุ่มผู้หญิง', 'กลุ่มสำหรับผู้หญิงเท่านั้น');

-- Insert sample events
INSERT INTO public.events (title, description, start_time, end_time, location, event_type, is_public) VALUES
('การอธิษฐานรวมหมู่', 'มาร่วมอธิษฐานกันเป็นชุมชน', '2024-01-15 19:00:00+07', '2024-01-15 20:30:00+07', 'ห้องประชุมใหญ่', 'prayer', true),
('การนมัสการวันอาทิตย์', 'การนมัสการประจำสัปดาห์', '2024-01-21 09:00:00+07', '2024-01-21 11:00:00+07', 'โบสถ์หลัก', 'worship', true),
('การศึกษาพระคัมภีร์', 'การศึกษาพระคัมภีร์ร่วมกัน', '2024-01-18 19:30:00+07', '2024-01-18 21:00:00+07', 'ห้องเรียน A', 'study', true),
('งานเลี้ยงสังสรรค์', 'งานสังสรรค์ของชุมชน', '2024-01-25 18:00:00+07', '2024-01-25 21:00:00+07', 'ลานหน้าโบสถ์', 'fellowship', true),
('กิจกรรมช่วยเหลือชุมชน', 'ช่วยเหลือผู้ยากไร้ในชุมชน', '2024-01-28 08:00:00+07', '2024-01-28 16:00:00+07', 'ชุมชนบ้านสวน', 'service', true);