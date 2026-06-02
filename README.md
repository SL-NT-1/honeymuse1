# 🍯 HoneyMuse v2 — Deploy Guide

## ขั้นที่ 1 — สร้าง Supabase Project (ฟรี)
1. ไปที่ https://supabase.com → New Project
2. จด `Project URL` และ `anon key` จาก Settings > API
3. จด `service_role key` ด้วย (ใช้ใน backend)

## ขั้นที่ 2 — ตั้งค่า Database
1. ไปที่ SQL Editor ใน Supabase Dashboard
2. วาง + รัน ไฟล์ `SUPABASE_SETUP.sql` ทั้งหมด

## ขั้นที่ 3 — สร้าง Storage Bucket
1. ไปที่ Storage > New Bucket
2. ชื่อ: `avatars`  ตั้งเป็น **Public**

## ขั้นที่ 4 — Deploy บน Vercel
1. อัปโหลดโปรเจกต์ขึ้น GitHub
2. เชื่อม Vercel กับ GitHub repo
3. ไปที่ Settings > Environment Variables ใส่:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENROUTER_API_KEY
4. Deploy!

## โครงสร้าง
```
pages/
  index.jsx        ← Frontend ทั้งหมด
  api/chat.js      ← Backend proxy (OpenRouter + honey deduction)
lib/
  supabase.js      ← Supabase client
SUPABASE_SETUP.sql ← รัน 1 ครั้งใน Supabase SQL Editor
```
