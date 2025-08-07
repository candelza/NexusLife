import { supabase } from '@/integrations/supabase/client';

// Line OA Webhook Configuration
const LINE_WEBHOOK_URL = process.env.VITE_LINE_WEBHOOK_URL || '';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.VITE_LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_USER_IDS = process.env.VITE_LINE_USER_IDS?.split(',') || [];
const LINE_GROUP_IDS = process.env.VITE_LINE_GROUP_IDS?.split(',') || [];

export interface LineMessage {
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'sticker';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  duration?: number;
  title?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  packageId?: string;
  stickerId?: string;
}

export interface LineNotification {
  to: string; // User ID or Group ID
  messages: LineMessage[];
}

// Send notification to Line OA
export const sendLineNotification = async (notification: LineNotification) => {
  try {
    if (!LINE_WEBHOOK_URL || !LINE_CHANNEL_ACCESS_TOKEN) {
      console.error('Line webhook configuration missing');
      return false;
    }

    const response = await fetch(LINE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error(`Line webhook failed: ${response.status}`);
    }

    console.log('Line notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending Line notification:', error);
    return false;
  }
};

// Send text message to Line OA
export const sendLineTextMessage = async (to: string, text: string) => {
  return sendLineNotification({
    to,
    messages: [{ type: 'text', text }],
  });
};

// Send notification to all configured Line users and groups
export const sendLineNotificationToAll = async (text: string) => {
  const allRecipients = [...LINE_USER_IDS, ...LINE_GROUP_IDS];
  const results = await Promise.allSettled(
    allRecipients.map(recipient => sendLineTextMessage(recipient, text))
  );
  
  const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
  console.log(`Line notifications sent: ${successCount}/${allRecipients.length} successful`);
  
  return successCount > 0;
};

// Send prayer notification to Line OA
export const sendPrayerNotification = async (prayer: any, user: any) => {
  const message = `🙏 คำอธิษฐานใหม่\n\n📝 ${prayer.title}\n\n📄 ${prayer.description}\n\n👤 โดย: ${user.display_name || user.email}\n\n⏰ ${new Date().toLocaleString('th-TH')}`;
  
  return sendLineNotificationToAll(message);
};

// Send care group notification to Line OA
export const sendCareGroupNotification = async (group: any, action: 'created' | 'updated' | 'deleted') => {
  const actionText = {
    created: 'สร้างกลุ่มดูแลใหม่',
    updated: 'อัปเดตกลุ่มดูแล',
    deleted: 'ลบกลุ่มดูแล',
  }[action];

  const message = `👥 ${actionText}\n\n📝 ${group.name}\n\n📄 ${group.description || 'ไม่มีคำอธิบาย'}\n\n⏰ ${new Date().toLocaleString('th-TH')}`;
  
  return sendLineNotificationToAll(message);
};

// Send bible verse notification to Line OA
export const sendBibleVerseNotification = async (verse: any) => {
  const message = `📖 พระคัมภีร์ประจำวัน\n\n📚 ${verse.book} ${verse.chapter}:${verse.verse_start}${verse.verse_end ? `-${verse.verse_end}` : ''}\n\n📄 ${verse.content_thai || verse.content}\n\n⏰ ${new Date().toLocaleString('th-TH')}`;
  
  return sendLineNotificationToAll(message);
};

// Send event notification to Line OA
export const sendEventNotification = async (event: any, action: 'created' | 'updated' | 'deleted') => {
  const actionText = {
    created: 'สร้างกิจกรรมใหม่',
    updated: 'อัปเดตกิจกรรม',
    deleted: 'ลบกิจกรรม',
  }[action];

  const message = `📅 ${actionText}\n\n📝 ${event.title}\n\n📄 ${event.description || 'ไม่มีคำอธิบาย'}\n\n📍 ${event.location || 'ไม่ระบุสถานที่'}\n\n⏰ ${new Date().toLocaleString('th-TH')}`;
  
  return sendLineNotificationToAll(message);
};
