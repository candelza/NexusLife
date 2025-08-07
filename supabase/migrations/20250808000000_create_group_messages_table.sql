-- Create group_messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.care_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON public.group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON public.group_messages(user_id);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_messages
CREATE POLICY "Group members can view messages" ON public.group_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_messages.group_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can insert messages" ON public.group_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_messages.group_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.group_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.group_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_group_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_group_messages_updated_at
    BEFORE UPDATE ON public.group_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_group_messages_updated_at();

-- Create function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify all group members about new message (except sender)
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    SELECT 
        gm.user_id,
        'group_update',
        'ข้อความใหม่ในกลุ่ม',
        'มีข้อความใหม่ในกลุ่ม: ' || NEW.content,
        jsonb_build_object('group_id', NEW.group_id, 'message_id', NEW.id, 'sender_id', NEW.user_id)
    FROM public.group_members gm
    WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
CREATE TRIGGER trigger_message_notification
    AFTER INSERT ON public.group_messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();
