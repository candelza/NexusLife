-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('invite', 'event', 'prayer_response', 'group_update')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to create notification when prayer is liked
CREATE OR REPLACE FUNCTION create_prayer_like_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        (SELECT user_id FROM public.prayers WHERE id = NEW.prayer_id),
        'prayer_response',
        'มีคนกดไลค์คำอธิษฐานของคุณ',
        'มีคนกดไลค์คำอธิษฐานของคุณแล้ว',
        jsonb_build_object('prayer_id', NEW.prayer_id, 'liked_by', NEW.user_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for prayer likes
CREATE TRIGGER trigger_prayer_like_notification
    AFTER INSERT ON public.prayer_likes
    FOR EACH ROW
    EXECUTE FUNCTION create_prayer_like_notification();

-- Create function to create notification when prayer is commented
CREATE OR REPLACE FUNCTION create_prayer_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        (SELECT user_id FROM public.prayers WHERE id = NEW.prayer_id),
        'prayer_response',
        'มีคนแสดงความคิดเห็นในคำอธิษฐานของคุณ',
        'มีคนแสดงความคิดเห็นในคำอธิษฐานของคุณแล้ว',
        jsonb_build_object('prayer_id', NEW.prayer_id, 'commented_by', NEW.user_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for prayer comments
CREATE TRIGGER trigger_prayer_comment_notification
    AFTER INSERT ON public.prayer_responses
    FOR EACH ROW
    WHEN (NEW.response_type = 'comment')
    EXECUTE FUNCTION create_prayer_comment_notification();

-- Create function to create notification for new events
CREATE OR REPLACE FUNCTION create_event_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify all group members about new event
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    SELECT 
        gm.user_id,
        'event',
        'มีกิจกรรมใหม่ในกลุ่มของคุณ',
        'มีกิจกรรมใหม่ในกลุ่มของคุณ: ' || NEW.title,
        jsonb_build_object('event_id', NEW.id, 'event_title', NEW.title)
    FROM public.group_members gm
    WHERE gm.group_id = NEW.care_group_id
    AND gm.user_id != NEW.organizer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new events
CREATE TRIGGER trigger_event_notification
    AFTER INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION create_event_notification(); 