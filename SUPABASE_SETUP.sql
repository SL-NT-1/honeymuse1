-- =====================================================
-- HoneyMuse — Supabase Database Setup
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. สร้าง profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  honey INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้าง characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- พื้นฐาน
  name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  gender TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  tagline TEXT DEFAULT '',
  creator_notes TEXT DEFAULT '',
  -- สาธารณะ
  is_public BOOLEAN DEFAULT false,
  originality TEXT DEFAULT 'original',
  age_rating TEXT DEFAULT 'all',
  description TEXT DEFAULT '',
  -- บุคลิกภาพ
  personality TEXT DEFAULT '',
  -- บทสนทนา
  scenario TEXT DEFAULT '',
  first_message TEXT DEFAULT '',
  status_display TEXT DEFAULT '',
  -- ขั้นสูง
  speech_style TEXT DEFAULT '',
  life_experience TEXT DEFAULT '',
  user_persona TEXT DEFAULT '',
  -- meta
  chat_count INTEGER DEFAULT 0,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. สร้าง chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "chars_select" ON characters FOR SELECT USING (is_public = true OR auth.uid() = creator_id OR is_preset = true);
CREATE POLICY "chars_insert" ON characters FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "chars_update" ON characters FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "chars_delete" ON characters FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "chats_select" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chats_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Preset characters (ตัวละครตัวอย่าง)
INSERT INTO characters (creator_id, name, gender, tags, tagline, description, personality, first_message, is_public, is_preset, age_rating)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  'Hana', 'female',
  ARRAY['ขี้เล่น','อบอุ่น','เพื่อน'],
  'เพื่อนซี้ที่คอยอยู่เคียงข้างเสมอ 🌸',
  'สาวร่าเริงที่ชอบแกล้งแต่มีจิตใจงดงาม เธอจะทำให้ทุกวันของคุณสดใส',
  'Hana is a cheerful, playful girl who loves to tease but is incredibly kind-hearted. She speaks in a casual, warm tone with cute expressions. She is energetic and always makes others smile.',
  'สวัสดีค่ะ~! วันนี้เป็นยังไงบ้างคะ? 🌸',
  true, true, 'all'
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- 7. Supabase Storage bucket (รัน manual ใน Dashboard > Storage)
-- สร้าง bucket ชื่อ "avatars" แล้วตั้งเป็น public

-- =====================================================
-- เสร็จแล้ว! ต่อไปไปที่ README.md
-- =====================================================
