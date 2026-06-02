// pages/api/chat.js
import { createClient } from '@supabase/supabase-js'

const MODEL   = 'x-ai/grok-4.20'
const MSG_COST = 5

// Supabase admin client (service role — secret, server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function buildPersona(char) {
  return [
    `Your name is ${char.name}. You are a fictional character in a roleplay story.`,
    char.personality    && `Personality:\n${char.personality}`,
    char.speech_style   && `Speech style:\n${char.speech_style}`,
    char.life_experience && `Background:\n${char.life_experience}`,
    char.scenario       && `Current scenario:\n${char.scenario}`,
    char.user_persona   && `Treat the user as: ${char.user_persona}`,
    `RULES: Never say you are an AI, Claude, or made by any company. Stay in character at ALL times. Respond in the same language as the user.`,
  ].filter(Boolean).join('\n\n')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Auth ──────────────────────────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' })

  // ── Load profile ──────────────────────────────────
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles').select('honey').eq('id', user.id).single()
  if (profileErr) return res.status(500).json({ error: 'Profile not found' })

  if (profile.honey < MSG_COST) {
    return res.status(402).json({ error: `น้ำผึ้งไม่พอ ต้องการ ${MSG_COST} หน่วย` })
  }

  // ── Request body ──────────────────────────────────
  const { messages, character } = req.body
  if (!messages || !character) return res.status(400).json({ error: 'Missing fields' })

  // ── Call OpenRouter ───────────────────────────────
  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://honeymuse.app',
        'X-Title': 'HoneyMuse',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: buildPersona(character) },
          ...messages.slice(-20),
        ],
      }),
    })

    const data = await orRes.json()
    if (!orRes.ok) throw new Error(data?.error?.message || `HTTP ${orRes.status}`)

    const reply = data.choices?.[0]?.message?.content
    if (!reply) throw new Error('No reply from AI')

    // ── Deduct honey (server-side, secure) ────────────
    await supabaseAdmin
      .from('profiles')
      .update({ honey: profile.honey - MSG_COST })
      .eq('id', user.id)

    return res.status(200).json({ reply, honey: profile.honey - MSG_COST })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
