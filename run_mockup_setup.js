#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Faith Nexus Hub - Mockup Data Setup');
console.log('=====================================\n');

// Mockup data
const mockupPrayers = [
  {
    id: 'prayer-001',
    title: 'ขอให้ครอบครัวมีสุขภาพแข็งแรง',
    description: 'ขอให้สมาชิกในครอบครัวทุกคนมีสุขภาพแข็งแรง มีความสุข และอยู่ร่วมกันอย่างอบอุ่น ขอให้พระเจ้าคุ้มครองและอวยพรครอบครัวของเรา',
    category: 'สุขภาพ',
    is_urgent: false,
    is_private: false,
    is_anonymous: false,
    status: 'pending',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prayer-002',
    title: 'ขอให้การงานเจริญก้าวหน้า',
    description: 'ขอให้การงานที่ทำอยู่เจริญก้าวหน้า มีความสำเร็จ และมีรายได้ที่เพียงพอสำหรับครอบครัว ขอให้มีโอกาสก้าวหน้าในหน้าที่การงาน',
    category: 'การงาน',
    is_urgent: false,
    is_private: false,
    is_anonymous: false,
    status: 'pending',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prayer-003',
    title: 'ขอให้ลูกเรียนหนังสือเก่ง',
    description: 'ขอให้ลูกมีสมาธิในการเรียน มีความตั้งใจ และเรียนหนังสือเก่ง ขอให้มีผลการเรียนที่ดี และมีความสุขในการเรียน',
    category: 'การศึกษา',
    is_urgent: false,
    is_private: false,
    is_anonymous: false,
    status: 'answered',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prayer-004',
    title: 'ขอให้พ่อแม่หายป่วย',
    description: 'ขอให้พ่อแม่หายป่วยจากโรคภัยไข้เจ็บ มีสุขภาพแข็งแรง และมีอายุยืนยาว ขอให้พระเจ้าคุ้มครองและรักษาพ่อแม่ของเรา',
    category: 'สุขภาพ',
    is_urgent: true,
    is_private: false,
    is_anonymous: false,
    status: 'pending',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prayer-005',
    title: 'ขอให้มีความสัมพันธ์ที่ดีในครอบครัว',
    description: 'ขอให้สมาชิกในครอบครัวมีความสัมพันธ์ที่ดีต่อกัน มีความเข้าใจและให้อภัยซึ่งกันและกัน ขอให้ครอบครัวมีความสุขและอบอุ่น',
    category: 'ครอบครัว',
    is_urgent: false,
    is_private: false,
    is_anonymous: false,
    status: 'pending',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockupLikes = [
  { prayer_id: 'prayer-001', user_id: '550e8400-e29b-41d4-a716-446655440001' },
  { prayer_id: 'prayer-002', user_id: '550e8400-e29b-41d4-a716-446655440001' },
  { prayer_id: 'prayer-003', user_id: '550e8400-e29b-41d4-a716-446655440001' },
  { prayer_id: 'prayer-004', user_id: '550e8400-e29b-41d4-a716-446655440001' },
  { prayer_id: 'prayer-005', user_id: '550e8400-e29b-41d4-a716-446655440001' }
];

const mockupComments = [
  {
    id: 'response-001',
    prayer_id: 'prayer-001',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'ขอให้ครอบครัวของคุณมีสุขภาพแข็งแรงและมีความสุขครับ',
    response_type: 'comment'
  },
  {
    id: 'response-002',
    prayer_id: 'prayer-002',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'ขอให้การงานเจริญก้าวหน้าครับ พระเจ้าจะอวยพร',
    response_type: 'comment'
  },
  {
    id: 'response-003',
    prayer_id: 'prayer-003',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'ขอบคุณพระเจ้าที่ตอบคำอธิษฐาน ขอให้ลูกเรียนเก่งขึ้นจริงๆ',
    response_type: 'comment'
  },
  {
    id: 'response-004',
    prayer_id: 'prayer-004',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'ขอให้พ่อแม่หายป่วยเร็วๆ ครับ พระเจ้าจะรักษา',
    response_type: 'comment'
  },
  {
    id: 'response-005',
    prayer_id: 'prayer-005',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'ขอให้ครอบครัวมีความสัมพันธ์ที่ดีต่อกันครับ',
    response_type: 'comment'
  }
];

async function promptForCredentials() {
  return new Promise((resolve) => {
    rl.question('🔗 กรุณาใส่ Supabase URL: ', (url) => {
      rl.question('🔑 กรุณาใส่ Supabase Anon Key: ', (key) => {
        resolve({ url, key });
      });
    });
  });
}

async function insertMockupData(supabaseUrl, supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('\n📝 เริ่มต้นเพิ่ม mockup data...\n');

    // 1. เพิ่ม test user profile
    console.log('1️⃣ เพิ่ม test user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440001',
        display_name: 'ผู้ทดสอบระบบ',
        first_name: 'ผู้ทดสอบ',
        last_name: 'ระบบ',
        avatar_url: null,
        bio: 'ผู้ใช้ทดสอบระบบ Faith Nexus Hub',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error inserting profile:', profileError.message);
    } else {
      console.log('✅ เพิ่ม profile สำเร็จ');
    }

    // 2. เพิ่ม prayers
    console.log('\n2️⃣ เพิ่ม prayers...');
    const { error: prayersError } = await supabase
      .from('prayers')
      .upsert(mockupPrayers);

    if (prayersError) {
      console.error('❌ Error inserting prayers:', prayersError.message);
    } else {
      console.log('✅ เพิ่ม prayers สำเร็จ');
    }

    // 3. เพิ่ม likes
    console.log('\n3️⃣ เพิ่ม likes...');
    const { error: likesError } = await supabase
      .from('prayer_likes')
      .upsert(mockupLikes);

    if (likesError) {
      console.error('❌ Error inserting likes:', likesError.message);
    } else {
      console.log('✅ เพิ่ม likes สำเร็จ');
    }

    // 4. เพิ่ม comments
    console.log('\n4️⃣ เพิ่ม comments...');
    const { error: commentsError } = await supabase
      .from('prayer_responses')
      .upsert(mockupComments);

    if (commentsError) {
      console.error('❌ Error inserting comments:', commentsError.message);
    } else {
      console.log('✅ เพิ่ม comments สำเร็จ');
    }

    // 5. อัพเดท prayer counts
    console.log('\n5️⃣ อัพเดท prayer counts...');
    for (const prayer of mockupPrayers) {
      const { error: updateError } = await supabase
        .from('prayers')
        .update({
          likes_count: mockupLikes.filter(like => like.prayer_id === prayer.id).length,
          comments_count: mockupComments.filter(comment => comment.prayer_id === prayer.id).length
        })
        .eq('id', prayer.id);

      if (updateError) {
        console.error(`❌ Error updating prayer ${prayer.id}:`, updateError.message);
      }
    }
    console.log('✅ อัพเดท prayer counts สำเร็จ');

    // 6. แสดงผลลัพธ์
    console.log('\n📊 ข้อมูลที่เพิ่มเข้าไป:');
    const { data: prayers, error: fetchError } = await supabase
      .from('prayers')
      .select(`
        *,
        profile:profiles!prayers_user_id_fkey(display_name)
      `)
      .in('id', mockupPrayers.map(p => p.id))
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching prayers:', fetchError.message);
    } else {
      console.table(prayers.map(p => ({
        id: p.id,
        title: p.title.substring(0, 30) + '...',
        category: p.category,
        status: p.status,
        is_urgent: p.is_urgent ? 'ใช่' : 'ไม่',
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        author: p.profile?.display_name,
        created_at: new Date(p.created_at).toLocaleDateString('th-TH')
      })));
    }

    console.log('\n🎉 เพิ่ม mockup data สำเร็จแล้ว!');
    console.log('\n📱 ตอนนี้คุณสามารถเปิดแอปพลิเคชันและดูคำอธิษฐานได้แล้ว');
    console.log('🌐 URL: http://localhost:8080');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

async function main() {
  try {
    const credentials = await promptForCredentials();
    
    if (!credentials.url || !credentials.key) {
      console.log('❌ กรุณาใส่ URL และ Key ที่ถูกต้อง');
      rl.close();
      return;
    }

    await insertMockupData(credentials.url, credentials.key);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    rl.close();
  }
}

main();
