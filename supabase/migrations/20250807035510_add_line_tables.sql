-- Create line_users table
CREATE TABLE public.line_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  followed_at TIMESTAMP WITH TIME ZONE,
  unfollowed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create line_groups table
CREATE TABLE public.line_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_group_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create line_messages table
CREATE TABLE public.line_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_text TEXT,
  source_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.line_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for line_users
CREATE POLICY "Anyone can view line users" ON public.line_users FOR SELECT USING (true);
CREATE POLICY "Admin can manage line users" ON public.line_users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- RLS Policies for line_groups
CREATE POLICY "Anyone can view line groups" ON public.line_groups FOR SELECT USING (true);
CREATE POLICY "Admin can manage line groups" ON public.line_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- RLS Policies for line_messages
CREATE POLICY "Anyone can view line messages" ON public.line_messages FOR SELECT USING (true);
CREATE POLICY "Admin can manage line messages" ON public.line_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND member_level = 'admin'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_line_users_updated_at BEFORE UPDATE ON public.line_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_line_groups_updated_at BEFORE UPDATE ON public.line_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
