import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const MSG_COST = 5

// ─── SHARED UI ────────────────────────────────────────────────
function HoneyBadge({ amount }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:5,background:'linear-gradient(135deg,#fff3dc,#ffe0a0)',border:'1.5px solid #ffb347',borderRadius:20,padding:'5px 12px',fontSize:13,fontWeight:700,color:'#b85c00',flexShrink:0}}>
      🍯 {amount ?? '...'}
    </div>
  )
}

function Avatar({ url, emoji = '🌸', size = 54, accent = '#ff6fa8', light = '#fff0f7', dark = '#ffb7d5' }) {
  if (url) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:`2.5px solid ${accent}`,flexShrink:0,boxShadow:`0 2px 10px ${accent}44`}}>
      <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </div>
  )
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${light},${dark})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.45,border:`2.5px solid ${accent}`,flexShrink:0,boxShadow:`0 2px 10px ${accent}44`}}>
      {emoji}
    </div>
  )
}

function Stars() {
  const [pts] = useState(() => Array.from({length:14},(_,i)=>({
    id:i, top:`${Math.floor(Math.random()*100)}%`, left:`${Math.floor(Math.random()*100)}%`,
    dur:`${(20+Math.floor(Math.random()*20))/10}s`, delay:`${Math.floor(Math.random()*30)/10}s`
  })))
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      {pts.map(p=><div key={p.id} style={{position:'absolute',width:4,height:4,borderRadius:'50%',background:'rgba(255,182,219,0.4)',top:p.top,left:p.left,animation:`twinkle ${p.dur} ease-in-out infinite`,animationDelay:p.delay}}/>)}
    </div>
  )
}

function Loader({ text = 'HoneyMuse' }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#fff5f9,#f9f0ff)'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:52,animation:'logoFloat 1.5s ease-in-out infinite'}}>🍯</div><div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:'#ff6fa8',marginTop:10}}>{text}</div></div>
    </div>
  )
}

// Character color by gender
function charTheme(char) {
  const g = char?.gender
  if (g==='male')   return {accent:'#5c6fff',light:'#f0f2ff',dark:'#b8c4ff'}
  if (g==='female') return {accent:'#ff6fa8',light:'#fff0f7',dark:'#ffb7d5'}
  return {accent:'#9b59b6',light:'#f9f0ff',dark:'#e8d5ff'}
}

// ─── AUTH SCREEN ──────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode,setMode]=useState('login')
  const [email,setEmail]=useState('')
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)

  const handle = async () => {
    setErr(''); setLoading(true)
    try {
      if (mode==='register') {
        if (!username.trim()||username.trim().length<3) { setErr('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'); setLoading(false); return }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { username: username.trim().toLowerCase() } }
        })
        if (error) throw error
        if (data.user) {
          // ensure profile exists
          const { data:prof } = await supabase.from('profiles').select('*').eq('id',data.user.id).single()
          if (!prof) await supabase.from('profiles').insert({ id:data.user.id, username:username.trim().toLowerCase(), honey:100 })
          const { data:profile } = await supabase.from('profiles').select('*').eq('id',data.user.id).single()
          onLogin({ ...data.user, profile, session: data.session })
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email:email.trim(), password })
        if (error) throw error
        const { data:profile } = await supabase.from('profiles').select('*').eq('id',data.user.id).single()
        onLogin({ ...data.user, profile, session: data.session })
      }
    } catch(e) {
      setErr(e.message==='Invalid login credentials'?'อีเมลหรือรหัสผ่านไม่ถูกต้อง':e.message)
    } finally { setLoading(false) }
  }

  const fi = { style:{width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid #ffd6eb',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:14,outline:'none',boxSizing:'border-box',background:'#fff9fc',color:'#444'}, onFocus:e=>e.target.style.borderColor='#ff6fa8', onBlur:e=>e.target.style.borderColor='#ffd6eb' }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fff5f9,#f9f0ff,#f0f8ff)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:"'Noto Sans Thai',sans-serif",position:'relative'}}>
      <Stars/>
      <div style={{background:'rgba(255,255,255,0.93)',backdropFilter:'blur(14px)',borderRadius:26,padding:28,maxWidth:420,width:'100%',boxShadow:'0 10px 40px rgba(255,107,168,0.18)',border:'1.5px solid #ffd6eb',position:'relative',zIndex:1,animation:'fadeUp 0.4s ease'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:50,animation:'logoFloat 3s ease-in-out infinite'}}>🍯</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:30,background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>HoneyMuse</div>
          <div style={{fontSize:11,color:'#c994cc',letterSpacing:'0.12em',marginTop:2}}>✦ AI ROLEPLAY COMPANION ✦</div>
        </div>
        <div style={{display:'flex',background:'#f5f5f5',borderRadius:14,padding:4,marginBottom:20}}>
          {['login','register'].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr('')}} style={{flex:1,padding:10,border:'none',borderRadius:10,background:mode===m?'white':'transparent',color:mode===m?'#ff6fa8':'#aaa',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:14,fontWeight:mode===m?600:400,cursor:'pointer',transition:'all 0.2s',boxShadow:mode===m?'0 2px 8px rgba(255,107,168,0.15)':'none'}}>
              {m==='login'?'เข้าสู่ระบบ':'สมัครสมาชิก'}
            </button>
          ))}
        </div>
        {mode==='register'&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#bbb',marginBottom:5}}>ชื่อผู้ใช้</div>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" {...fi} onKeyDown={e=>e.key==='Enter'&&handle()}/>
          </div>
        )}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:'#bbb',marginBottom:5}}>อีเมล</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="email@example.com" {...fi} onKeyDown={e=>e.key==='Enter'&&handle()}/>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:'#bbb',marginBottom:5}}>รหัสผ่าน</div>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" {...fi} onKeyDown={e=>e.key==='Enter'&&handle()}/>
        </div>
        {err&&<div style={{color:'#ff4466',fontSize:13,marginBottom:12,textAlign:'center',background:'#fff0f3',padding:8,borderRadius:10}}>{err}</div>}
        {mode==='register'&&<div style={{fontSize:12,color:'#cca0cc',marginBottom:14,textAlign:'center'}}>🎁 รับน้ำผึ้งฟรี 100 หน่วยเมื่อสมัครใหม่</div>}
        <button onClick={handle} disabled={loading} style={{width:'100%',padding:14,borderRadius:16,border:'none',background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',color:'#fff',fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:loading?'not-allowed':'pointer',boxShadow:'0 4px 18px #ff6fa855',opacity:loading?0.7:1}}>
          {loading?'กำลังโหลด...':(mode==='login'?'เข้าสู่ระบบ ✦':'สมัครสมาชิก ✦')}
        </button>
      </div>
    </div>
  )
}

// ─── HOME SCREEN ──────────────────────────────────────────────
function HomeScreen({ user, onSelectChar, onShop, onCreateChar, onProfile }) {
  const [chars,setChars]=useState([])
  const [loading,setLoading]=useState(true)
  const [tab,setTab]=useState('all') // all | mine

  useEffect(()=>{
    fetchChars()
  },[tab])

  const fetchChars = async () => {
    setLoading(true)
    let q = supabase.from('characters').select('*').order('created_at',{ascending:false})
    if (tab==='mine') q = q.eq('creator_id', user.id)
    else q = q.or(`is_public.eq.true,creator_id.eq.${user.id},is_preset.eq.true`)
    const { data } = await q
    setChars(data||[])
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fff5f9,#f9f0ff,#f0f8ff)',fontFamily:"'Noto Sans Thai',sans-serif",position:'relative',paddingBottom:20}}>
      <Stars/>
      {/* Header */}
      <div style={{background:'rgba(255,255,255,0.9)',backdropFilter:'blur(14px)',padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1.5px solid #ffd6eb',position:'sticky',top:0,zIndex:10,boxShadow:'0 2px 14px rgba(255,107,168,0.1)'}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:21,background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>🍯 HoneyMuse</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <HoneyBadge amount={user.profile?.honey}/>
          <button onClick={onProfile} style={{width:36,height:36,borderRadius:'50%',border:'1.5px solid #ffd6eb',background:'#fff9fc',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>👤</button>
        </div>
      </div>

      <div style={{padding:'16px 14px',position:'relative',zIndex:1}}>
        {/* Tabs + buttons */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{display:'flex',background:'#f0e8f8',borderRadius:12,padding:3}}>
            {[['all','ทั้งหมด'],['mine','ของฉัน']].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)} style={{padding:'7px 14px',border:'none',borderRadius:9,background:tab===v?'white':'transparent',color:tab===v?'#c97ee8':'#bbb',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:13,fontWeight:tab===v?600:400,cursor:'pointer',transition:'all 0.2s',boxShadow:tab===v?'0 2px 6px rgba(201,126,232,0.2)':'none'}}>{l}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onShop} style={{background:'linear-gradient(135deg,#ffb347,#ffd700)',color:'#fff',border:'none',borderRadius:20,padding:'7px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>🛒 Shop</button>
            <button onClick={onCreateChar} style={{background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',color:'#fff',border:'none',borderRadius:20,padding:'7px 12px',fontSize:12,cursor:'pointer'}}>+ สร้าง</button>
          </div>
        </div>
        <div style={{fontSize:11,color:'#ddb0dd',marginBottom:16,textAlign:'center'}}>✦ 1 ข้อความ = {MSG_COST} น้ำผึ้ง ✦</div>

        {loading ? <div style={{textAlign:'center',padding:40,color:'#dbb0dd'}}>กำลังโหลด...</div> : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {chars.map((char,i)=>{
              const t=charTheme(char)
              return (
                <div key={char.id} onClick={()=>onSelectChar(char)}
                  style={{background:`linear-gradient(135deg,${t.light},${t.dark}44)`,border:`2px solid ${t.dark}`,borderRadius:20,padding:'14px 12px',cursor:'pointer',animation:`fadeUp 0.3s ease ${i*0.05}s both`,transition:'transform 0.2s,box-shadow 0.2s',boxShadow:`0 4px 14px ${t.dark}55`,position:'relative',overflow:'hidden'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px) scale(1.02)';e.currentTarget.style.boxShadow=`0 12px 26px ${t.dark}77`}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`0 4px 14px ${t.dark}55`}}
                >
                  <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
                    <Avatar url={char.avatar_url} emoji='🌸' size={60} accent={t.accent} light={t.light} dark={t.dark}/>
                  </div>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:t.accent,textAlign:'center',marginBottom:2}}>{char.name}</div>
                  {char.tagline&&<div style={{fontSize:11,color:t.accent,textAlign:'center',opacity:0.75,marginBottom:5,lineHeight:1.3}}>{char.tagline}</div>}
                  {char.tags?.length>0&&(
                    <div style={{display:'flex',flexWrap:'wrap',gap:3,justifyContent:'center',marginBottom:4}}>
                      {char.tags.slice(0,3).map(tag=><span key={tag} style={{background:`${t.accent}22`,color:t.accent,borderRadius:10,fontSize:9,padding:'2px 7px'}>#{tag}</span>)}
                    </div>
                  )}
                  {char.chat_count>0&&<div style={{fontSize:10,color:'#bbb',textAlign:'center'}}>💬 {char.chat_count}</div>}
                  <div style={{position:'absolute',bottom:7,right:9,background:t.accent,color:'#fff',borderRadius:10,fontSize:8,padding:'2px 7px',fontWeight:700}}>CHAT ✦</div>
                  {char.age_rating==='adult'&&<div style={{position:'absolute',top:7,left:9,background:'#ff4466',color:'#fff',borderRadius:8,fontSize:8,padding:'2px 6px',fontWeight:700}}>18+</div>}
                </div>
              )
            })}
          </div>
        )}
        {!loading&&chars.length===0&&<div style={{textAlign:'center',padding:'40px 20px',color:'#ccc'}}>ยังไม่มีตัวละคร<br/>กด + สร้าง เพื่อเพิ่มตัวละครแรก</div>}
      </div>
    </div>
  )
}

// ─── CHAR DETAIL SCREEN ───────────────────────────────────────
function CharDetailScreen({ char, onBack, onStartChat }) {
  const t = charTheme(char)
  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${t.light},#ffffff)`,fontFamily:"'Noto Sans Thai',sans-serif"}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(160deg,${t.light},${t.dark}55)`,padding:'0 0 24px',position:'relative'}}>
        <button onClick={onBack} style={{position:'absolute',top:14,left:14,background:'rgba(255,255,255,0.8)',border:'none',borderRadius:'50%',width:36,height:36,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>←</button>
        <div style={{display:'flex',justifyContent:'center',paddingTop:50,marginBottom:14}}>
          <Avatar url={char.avatar_url} size={110} accent={t.accent} light={t.light} dark={t.dark}/>
        </div>
        <div style={{textAlign:'center',padding:'0 20px'}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:t.accent}}>{char.name}</div>
          {char.tagline&&<div style={{fontSize:13,color:t.accent,opacity:0.8,marginTop:4,fontStyle:'italic'}}>"{char.tagline}"</div>}
          <div style={{display:'flex',gap:4,justifyContent:'center',flexWrap:'wrap',marginTop:10}}>
            {char.gender&&<span style={{background:`${t.accent}22`,color:t.accent,borderRadius:12,fontSize:11,padding:'3px 10px'}}>{char.gender==='male'?'♂ ชาย':char.gender==='female'?'♀ หญิง':'⚧ อื่นๆ'}</span>}
            {char.age_rating==='adult'&&<span style={{background:'#ff446622',color:'#ff4466',borderRadius:12,fontSize:11,padding:'3px 10px'}}>🔞 ผู้ใหญ่เท่านั้น</span>}
            {char.tags?.map(tag=><span key={tag} style={{background:`${t.accent}15`,color:t.accent,borderRadius:12,fontSize:11,padding:'3px 10px'}}>#{tag}</span>)}
          </div>
        </div>
      </div>

      <div style={{padding:'20px 16px'}}>
        {/* Description */}
        {char.description&&(
          <div style={{background:'white',borderRadius:18,padding:18,marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:`1.5px solid ${t.dark}`}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:t.accent,marginBottom:8}}>📖 เกี่ยวกับตัวละคร</div>
            <div style={{fontSize:14,color:'#555',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{char.description}</div>
          </div>
        )}

        {/* Personality */}
        {char.personality&&(
          <div style={{background:'white',borderRadius:18,padding:18,marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:`1.5px solid ${t.dark}`}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:t.accent,marginBottom:8}}>✨ บุคลิกภาพ</div>
            <div style={{fontSize:13,color:'#666',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{char.personality}</div>
          </div>
        )}

        {/* Scenario */}
        {char.scenario&&(
          <div style={{background:'white',borderRadius:18,padding:18,marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:`1.5px solid ${t.dark}`}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:t.accent,marginBottom:8}}>🎬 ฉากเปิดเรื่อง</div>
            <div style={{fontSize:13,color:'#666',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{char.scenario}</div>
          </div>
        )}

        {/* Creator notes */}
        {char.creator_notes&&(
          <div style={{background:`${t.light}`,borderRadius:18,padding:18,marginBottom:14,border:`1.5px dashed ${t.dark}`}}>
            <div style={{fontSize:12,color:t.accent,marginBottom:6}}>📝 บันทึกจากผู้สร้าง</div>
            <div style={{fontSize:13,color:'#777',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{char.creator_notes}</div>
          </div>
        )}

        {/* Stats */}
        <div style={{display:'flex',gap:10,marginBottom:20}}>
          <div style={{flex:1,background:'white',borderRadius:14,padding:14,textAlign:'center',border:`1.5px solid ${t.dark}`}}>
            <div style={{fontSize:20,fontWeight:800,color:t.accent}}>{char.chat_count||0}</div>
            <div style={{fontSize:11,color:'#bbb'}}>แชท</div>
          </div>
          <div style={{flex:1,background:'white',borderRadius:14,padding:14,textAlign:'center',border:`1.5px solid ${t.dark}`}}>
            <div style={{fontSize:14,fontWeight:600,color:t.accent}}>{char.originality==='original'?'ต้นฉบับ':char.originality==='fanfic'?'แฟนฟิค':'กึ่งต้นฉบับ'}</div>
            <div style={{fontSize:11,color:'#bbb'}}>ประเภท</div>
          </div>
        </div>

        {/* Start chat button */}
        <button onClick={()=>onStartChat(char)} style={{width:'100%',padding:16,borderRadius:18,border:'none',background:`linear-gradient(135deg,${t.accent},${t.dark})`,color:'#fff',fontFamily:"'Fredoka One',cursive",fontSize:20,cursor:'pointer',boxShadow:`0 5px 20px ${t.accent}55`,letterSpacing:'0.03em'}}>
          เริ่มแชท ✦
        </button>
      </div>
    </div>
  )
}

// ─── CREATE / EDIT CHARACTER ──────────────────────────────────
const SECTION_COUNT = 5
function CharFormSection({ num, title, active, onToggle, children }) {
  return (
    <div style={{marginBottom:12,background:'white',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 10px rgba(255,107,168,0.08)',border:'1.5px solid #ffd6eb'}}>
      <button onClick={()=>onToggle(num)} style={{width:'100%',padding:'15px 18px',background:'none',border:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',fontFamily:"'Noto Sans Thai',sans-serif"}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',color:'#fff',borderRadius:20,fontSize:11,padding:'3px 10px',fontWeight:700}}>{num}/{SECTION_COUNT}</span>
          <span style={{fontWeight:600,color:'#555',fontSize:15}}>{title}</span>
        </div>
        <span style={{color:'#dbb0dd',fontSize:20,transition:'transform 0.2s',transform:active?'rotate(180deg)':''}}>▾</span>
      </button>
      {active&&<div style={{padding:'0 18px 18px'}}>{children}</div>}
    </div>
  )
}

function TextCount({ val, max }) {
  return <div style={{textAlign:'right',fontSize:11,color:(val||0)>max*0.9?'#ff6fa8':'#ccc',marginTop:3}}>{(val||'').length}/{max}</div>
}

function CreateCharScreen({ user, onBack, onSave, editChar = null }) {
  const [active, setActive] = useState(1)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(editChar?.avatar_url||'')
  const [tagInput, setTagInput] = useState('')
  const [f, setF] = useState({
    name: '', avatar_url: '', gender: 'other',
    tags: [], tagline: '', creator_notes: '',
    is_public: false, originality: 'original', age_rating: 'all',
    description: '', personality: '',
    scenario: '', first_message: '', status_display: '',
    speech_style: '', life_experience: '', user_persona: '',
    ...(editChar||{})
  })

  const upd = (k,v) => setF(p=>({...p,[k]:v}))

  const toggleSection = (n) => setActive(a=>a===n?0:n)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !f.tags.includes(t) && f.tags.length<10) { upd('tags',[...f.tags,t]); setTagInput('') }
  }

  const save = async () => {
    if (!f.name.trim()) { alert('กรุณาใส่ชื่อตัวละคร'); return }
    setSaving(true)
    try {
      let avatar_url = f.avatar_url
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error:upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, {upsert:true})
        if (!upErr) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          avatar_url = data.publicUrl
        }
      }
      const payload = { ...f, avatar_url, creator_id: user.id }
      let result
      if (editChar?.id) {
        const { data,error } = await supabase.from('characters').update(payload).eq('id',editChar.id).select().single()
        if (error) throw error; result = data
      } else {
        const { data,error } = await supabase.from('characters').insert(payload).select().single()
        if (error) throw error; result = data
      }
      onSave(result)
    } catch(e) { alert('เกิดข้อผิดพลาด: '+e.message) }
    finally { setSaving(false) }
  }

  const ta = (k, max, rows=4) => ({
    value: f[k], onChange: e=>upd(k,e.target.value), rows,
    maxLength: max,
    style:{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #ffd6eb',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:13.5,outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.6},
    onFocus:e=>e.target.style.borderColor='#ff6fa8', onBlur:e=>e.target.style.borderColor='#ffd6eb'
  })
  const inp = (k, max) => ({
    value: f[k], onChange: e=>upd(k,e.target.value),
    maxLength: max,
    style:{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #ffd6eb',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:13.5,outline:'none',boxSizing:'border-box'},
    onFocus:e=>e.target.style.borderColor='#ff6fa8', onBlur:e=>e.target.style.borderColor='#ffd6eb'
  })
  const label = (txt,hint) => <div style={{fontSize:13,fontWeight:600,color:'#888',marginBottom:6,marginTop:14}}>{txt}{hint&&<span style={{fontSize:11,color:'#ccc',marginLeft:5}}>{hint}</span>}</div>
  const rowBtn = (label,active,onClick) => (
    <button onClick={onClick} style={{flex:1,padding:'10px 8px',border:active?'2px solid #ff6fa8':'1.5px solid #eee',borderRadius:12,background:active?'#fff0f7':'white',color:active?'#ff6fa8':'#999',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:13,cursor:'pointer',fontWeight:active?600:400,transition:'all 0.15s'}}>{label}</button>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fff5f9,#f9f0ff)',fontFamily:"'Noto Sans Thai',sans-serif"}}>
      <div style={{background:'rgba(255,255,255,0.9)',backdropFilter:'blur(14px)',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1.5px solid #ffd6eb',position:'sticky',top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#ff6fa8',lineHeight:1}}>←</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:'#ff6fa8',flex:1}}>{editChar?'แก้ไขตัวละคร':'สร้างตัวละคร'}</div>
        <button onClick={save} disabled={saving||!f.name.trim()} style={{background:f.name.trim()?'linear-gradient(135deg,#ff6fa8,#c97ee8)':'#eee',color:f.name.trim()?'#fff':'#bbb',border:'none',borderRadius:16,padding:'8px 18px',fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:f.name.trim()&&!saving?'pointer':'not-allowed'}}>
          {saving?'กำลังบันทึก...':'สร้าง ✦'}
        </button>
      </div>

      <div style={{padding:'14px 14px 80px'}}>
        {/* Section 1 — พื้นฐาน */}
        <CharFormSection num={1} title="การตั้งค่าพื้นฐาน" active={active===1} onToggle={toggleSection}>
          {label('กรอกชื่อตัวละคร *')}
          <input {...inp('name',40)}/><TextCount val={f.name} max={40}/>

          {label('อวาตาร์')}
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:4}}>
            <label style={{cursor:'pointer'}}>
              {avatarPreview
                ? <img src={avatarPreview} style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'2.5px solid #ff6fa8'}}/>
                : <div style={{width:80,height:80,borderRadius:'50%',background:'#ffd6eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,border:'2.5px dashed #ff6fa8',cursor:'pointer'}}>📷</div>
              }
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}}/>
            </label>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:'#bbb',marginBottom:5}}>หรือใส่ URL รูปภาพ</div>
              <input value={f.avatar_url} onChange={e=>{upd('avatar_url',e.target.value);if(!avatarFile)setAvatarPreview(e.target.value)}} placeholder="https://..." style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'1.5px solid #ffd6eb',fontSize:12,outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='#ff6fa8'} onBlur={e=>e.target.style.borderColor='#ffd6eb'}/>
            </div>
          </div>

          {label('เพศ')}
          <div style={{display:'flex',gap:8}}>
            {[['male','♂ ชาย'],['female','♀ หญิง'],['other','⚧ อื่นๆ']].map(([v,l])=>rowBtn(l,f.gender===v,()=>upd('gender',v)))}
          </div>

          {label('แท็ก','(สูงสุด 10)')}
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} placeholder="เพิ่มแท็ก..." onKeyDown={e=>e.key==='Enter'&&addTag()} style={{flex:1,padding:'9px 12px',borderRadius:10,border:'1.5px solid #ffd6eb',fontSize:13,outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='#ff6fa8'} onBlur={e=>e.target.style.borderColor='#ffd6eb'}/>
            <button onClick={addTag} style={{background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',color:'#fff',border:'none',borderRadius:10,padding:'9px 14px',cursor:'pointer',fontSize:13,fontWeight:700}}>+ เพิ่ม</button>
          </div>
          {f.tags.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {f.tags.map(tag=><span key={tag} style={{background:'#fff0f7',color:'#ff6fa8',borderRadius:14,fontSize:12,padding:'4px 10px',border:'1.5px solid #ffd6eb',display:'flex',alignItems:'center',gap:5}}>#{tag}<button onClick={()=>upd('tags',f.tags.filter(t=>t!==tag))} style={{background:'none',border:'none',cursor:'pointer',color:'#ffaac5',fontSize:12,padding:0}}>✕</button></span>)}
          </div>}

          {label('แท็กไลน์','ประโยคสั้นๆ ที่ดึงดูด')}
          <input {...inp('tagline',100)}/><TextCount val={f.tagline} max={100}/>

          {label('บันทึกจากผู้สร้าง','(ไม่บังคับ)')}
          <textarea {...ta('creator_notes',500,3)}/><TextCount val={f.creator_notes} max={500}/>
        </CharFormSection>

        {/* Section 2 — ข้อมูลสาธารณะ */}
        <CharFormSection num={2} title="ข้อมูลสาธารณะ" active={active===2} onToggle={toggleSection}>
          {label('การตั้งค่าความเป็นส่วนตัว')}
          <div style={{display:'flex',gap:8,marginBottom:4}}>
            {rowBtn('🌐 สาธารณะ',f.is_public,()=>upd('is_public',true))}
            {rowBtn('🔒 ส่วนตัว',!f.is_public,()=>upd('is_public',false))}
          </div>
          {f.is_public&&<div style={{fontSize:11,color:'#aaa',background:'#fff8f0',borderRadius:8,padding:'7px 10px',marginTop:6}}>ทุกคนจะสามารถเห็นและแชทกับตัวละครนี้ได้</div>}

          {label('การตั้งค่าความเป็นต้นฉบับ')}
          <div style={{display:'flex',gap:8}}>
            {[['original','ต้นฉบับ'],['semi_original','กึ่งต้นฉบับ'],['fanfic','แฟนฟิค']].map(([v,l])=>rowBtn(l,f.originality===v,()=>upd('originality',v)))}
          </div>

          {label('การจำกัดอายุ')}
          <div style={{display:'flex',gap:8}}>
            {rowBtn('👶 ทุกวัย',f.age_rating==='all',()=>upd('age_rating','all'))}
            {rowBtn('🔞 ผู้ใหญ่เท่านั้น',f.age_rating==='adult',()=>upd('age_rating','adult'))}
          </div>

          {label('คำอธิบายสาธารณะ','(แสดงในหน้าโปรไฟล์ตัวละคร)')}
          <textarea {...ta('description',2000,5)}/><TextCount val={f.description} max={2000}/>
        </CharFormSection>

        {/* Section 3 — บุคลิกภาพ */}
        <CharFormSection num={3} title="บุคลิกภาพ" active={active===3} onToggle={toggleSection}>
          {label('บุคลิกภาพ','อธิบายนิสัย ความชอบ ความลับ ฯลฯ')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6,lineHeight:1.5}}>อธิบายบุคลิกภาพของตัวละคร เช่น ชอบ/ไม่ชอบ ความสัมพันธ์กับผู้ใช้ ความลับที่ซ่อนอยู่ ฯลฯ บุคลิกภาพคือจิตวิญญาณของตัวละคร</div>
          <textarea {...ta('personality',5000,8)}/><TextCount val={f.personality} max={5000}/>
        </CharFormSection>

        {/* Section 4 — บทสนทนาเปิดเรื่อง */}
        <CharFormSection num={4} title="บทสนทนาเปิดเรื่อง" active={active===4} onToggle={toggleSection}>
          {label('ฉากหลัง','(ไม่บังคับ)')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6}}>ระบุเวลา สถานที่ และบรรยากาศของฉากอย่างชัดเจน เพื่อสร้างน้ำหนักทางอารมณ์</div>
          <textarea {...ta('scenario',1000,4)}/><TextCount val={f.scenario} max={1000}/>

          {label('ประโยคแรก *','ข้อความเปิดตัวของตัวละคร')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6}}>ให้ตัวละครกล่าวประโยคแรกในบทบาทของตนเอง เพื่อแสดงเอกลักษณ์ของน้ำเสียงและสไตล์การพูด</div>
          <div style={{display:'flex',gap:6,marginBottom:6}}>
            {['*action*','{{user}}','{{char}}'].map(tag=><button key={tag} onClick={()=>upd('first_message',f.first_message+tag)} style={{background:'#fff0f7',color:'#ff6fa8',border:'1px solid #ffd6eb',borderRadius:8,fontSize:11,padding:'4px 9px',cursor:'pointer'}}>{tag}</button>)}
          </div>
          <textarea {...ta('first_message',2000,5)}/><TextCount val={f.first_message} max={2000}/>

          {label('สถานะ','(แสดงผลแบบ real-time ไม่บังคับ)')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6}}>เช่น: วันที่: ปปปป/ดด/วว | ความคิดภายใน: ... | เสื้อผ้า: ...</div>
          <textarea {...ta('status_display',200,2)}/><TextCount val={f.status_display} max={200}/>
        </CharFormSection>

        {/* Section 5 — ขั้นสูง */}
        <CharFormSection num={5} title="การตั้งค่าขั้นสูง" active={active===5} onToggle={toggleSection}>
          {label('ตัวตนของผู้ใช้','ผู้ใช้คือใครในเรื่อง')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6}}>อธิบายหมวดหมู่เพื่อเพิ่มความสึกให้กับเรื่องราว</div>
          <textarea {...ta('user_persona',500,3)}/><TextCount val={f.user_persona} max={500}/>

          {label('สไตล์การพูด')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6}}>กำหนดรูปแบบการพูดและนิสัยการใช้คำของตัวละคร เช่น คำพูดที่มักใช้ในสถานการณ์เฉพาะ หรือโทนการสื่อสารโดยรวม</div>
          <textarea {...ta('speech_style',800,4)}/><TextCount val={f.speech_style} max={800}/>

          {label('ประสบการณ์ชีวิต')}
          <div style={{fontSize:11,color:'#bbb',marginBottom:6}}>อธิบายเหตุการณ์สำคัญในอดีต ที่ส่งผลต่อทัศนคติ มุมมองโลก หรือวิธีคิดของตัวละคร</div>
          <textarea {...ta('life_experience',1000,4)}/><TextCount val={f.life_experience} max={1000}/>
        </CharFormSection>

        {/* Save button */}
        <button onClick={save} disabled={saving||!f.name.trim()} style={{width:'100%',padding:16,borderRadius:18,border:'none',background:f.name.trim()?'linear-gradient(135deg,#ff6fa8,#c97ee8)':'#eee',color:f.name.trim()?'#fff':'#bbb',fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:f.name.trim()&&!saving?'pointer':'not-allowed',boxShadow:f.name.trim()?'0 4px 18px #ff6fa855':'none',marginTop:8}}>
          {saving?'กำลังบันทึก...':(editChar?'บันทึกการแก้ไข ✦':'สร้างตัวละคร ✦')}
        </button>
      </div>
    </div>
  )
}

// ─── CHAT SCREEN ──────────────────────────────────────────────
function ChatScreen({ char, user, onBack, onUpdateHoney }) {
  const t = charTheme(char)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [honey, setHoney] = useState(user.profile?.honey || 0)
  const [ready, setReady] = useState(false)
  const bottomRef = useRef(null)
  const textRef = useRef(null)

  useEffect(()=>{
    loadHistory()
  },[])

  const loadHistory = async () => {
    const firstMsg = char.first_message
      ? [{ role:'assistant', content: char.first_message.replace('{{char}}',char.name).replace('{{user}}', user.profile?.username||'คุณ') }]
      : [{ role:'assistant', content:`สวัสดีค่ะ~! ฉัน${char.name} ยินดีที่ได้รู้จักนะ 💕` }]

    const { data } = await supabase.from('chat_messages')
      .select('role,content,created_at')
      .eq('user_id', user.id).eq('character_id', char.id)
      .order('created_at',{ascending:true}).limit(80)

    setMsgs(data?.length ? data : firstMsg)
    setReady(true)
  }

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs,loading])

  const send = async () => {
    const text = input.trim()
    if (!text||loading) return
    if (honey < MSG_COST) { setErr(`น้ำผึ้งไม่พอ! ต้องการ ${MSG_COST} หน่วย`); return }
    setErr(''); setLoading(true)
    const newMsgs = [...msgs, {role:'user',content:text}]
    setMsgs(newMsgs); setInput('')
    if (textRef.current) textRef.current.style.height='auto'

    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const res = await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({ messages: newMsgs.map(m=>({role:m.role,content:m.content})), character: char })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const reply = data.reply
      const updatedMsgs = [...newMsgs, {role:'assistant',content:reply}]
      setMsgs(updatedMsgs)
      setHoney(data.honey)
      onUpdateHoney(data.honey)

      // Save to DB
      await supabase.from('chat_messages').insert([
        {user_id:user.id, character_id:char.id, role:'user', content:text},
        {user_id:user.id, character_id:char.id, role:'assistant', content:reply},
      ])

      // Increment chat count
      await supabase.from('characters').update({chat_count: (char.chat_count||0)+1}).eq('id',char.id)

    } catch(e) {
      setMsgs(prev=>[...prev,{role:'assistant',content:`❌ ${e.message}`}])
    } finally { setLoading(false) }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:`linear-gradient(160deg,${t.light},#ffffff)`}}>
      <div style={{background:'rgba(255,255,255,0.93)',backdropFilter:'blur(14px)',padding:'11px 14px',display:'flex',alignItems:'center',gap:11,borderBottom:`2px solid ${t.dark}`,flexShrink:0}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:t.accent,lineHeight:1}}>←</button>
        <Avatar url={char.avatar_url} size={42} accent={t.accent} light={t.light} dark={t.dark}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:t.accent}}>{char.name}</div>
          <div style={{fontSize:10,color:t.accent,opacity:0.7,display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',display:'inline-block',boxShadow:'0 0 5px #4ade80'}}/>
            {char.tagline||char.tags?.[0]||'ออนไลน์'}
          </div>
        </div>
        <HoneyBadge amount={honey}/>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 12px'}}>
        {char.status_display&&<div style={{background:`${t.light}`,border:`1.5px solid ${t.dark}`,borderRadius:12,padding:'8px 14px',marginBottom:14,fontSize:12,color:t.accent,textAlign:'center',fontStyle:'italic'}}>{char.status_display}</div>}
        {msgs.map((msg,i)=>{
          const isUser=msg.role==='user'
          return (
            <div key={i} style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',marginBottom:13,animation:'fadeUp 0.25s ease'}}>
              {!isUser&&<div style={{marginRight:8,flexShrink:0,alignSelf:'flex-end'}}><Avatar url={char.avatar_url} size={32} accent={t.accent} light={t.light} dark={t.dark}/></div>}
              <div style={{maxWidth:'76%',background:isUser?`linear-gradient(135deg,${t.accent},${t.accent}cc)`:'rgba(255,255,255,0.95)',color:isUser?'#fff':'#444',borderRadius:isUser?'18px 4px 18px 18px':'4px 18px 18px 18px',padding:'10px 15px',fontSize:14.5,lineHeight:1.65,fontFamily:"'Noto Sans Thai',sans-serif",boxShadow:isUser?`0 4px 14px ${t.accent}44`:'0 2px 10px rgba(0,0,0,0.07)',border:isUser?'none':`1.5px solid ${t.dark}`,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
                {msg.content}
              </div>
            </div>
          )
        })}
        {loading&&(
          <div style={{display:'flex',alignItems:'flex-end',marginBottom:13}}>
            <div style={{marginRight:8,flexShrink:0}}><Avatar url={char.avatar_url} size={32} accent={t.accent} light={t.light} dark={t.dark}/></div>
            <div style={{background:'rgba(255,255,255,0.95)',borderRadius:'4px 18px 18px 18px',padding:'13px 16px',border:`1.5px solid ${t.dark}`,display:'flex',gap:5}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:t.accent,animation:'bounce 1.2s infinite',animationDelay:`${i*0.18}s`}}/>)}
            </div>
          </div>
        )}
        {err&&<div style={{background:'#fff0f3',border:'1.5px solid #ffb3c6',borderRadius:14,padding:'10px',color:'#cc3355',fontSize:13,marginBottom:12,textAlign:'center'}}>{err}</div>}
        <div ref={bottomRef}/>
      </div>

      <div style={{background:'rgba(255,255,255,0.93)',backdropFilter:'blur(14px)',borderTop:`2px solid ${t.dark}`,padding:'10px 12px',display:'flex',gap:9,alignItems:'flex-end',flexShrink:0}}>
        <div style={{flex:1,background:'#fff',border:`1.5px solid ${t.dark}`,borderRadius:20,padding:'10px 14px'}}>
          <textarea ref={textRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder={`พิมพ์ข้อความถึง ${char.name}...`} rows={1}
            style={{width:'100%',border:'none',outline:'none',resize:'none',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:14.5,color:'#444',background:'transparent',lineHeight:1.5,maxHeight:120,overflowY:'auto'}}
            onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}}
          />
        </div>
        <button onClick={send} disabled={loading||!input.trim()||honey<MSG_COST}
          style={{width:46,height:46,borderRadius:'50%',border:'none',flexShrink:0,background:loading||!input.trim()||honey<MSG_COST?'#eee':`linear-gradient(135deg,${t.accent},${t.dark})`,color:loading||!input.trim()||honey<MSG_COST?'#bbb':'#fff',fontSize:20,cursor:loading||!input.trim()||honey<MSG_COST?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',boxShadow:loading||!input.trim()||honey<MSG_COST?'none':`0 4px 14px ${t.accent}55`}}>
          {loading?'⏳':'💌'}
        </button>
      </div>
    </div>
  )
}

// ─── SHOP SCREEN ──────────────────────────────────────────────
const PACKAGES = [
  {id:'s',emoji:'🍯',name:'Small Jar',honey:100,price:'฿49'},
  {id:'m',emoji:'🫙',name:'Medium Jar',honey:300,price:'฿129',badge:'ยอดนิยม'},
  {id:'l',emoji:'🏺',name:'Large Jar',honey:700,price:'฿249'},
  {id:'xl',emoji:'👑',name:'Royal Jar',honey:2000,price:'฿599',badge:'คุ้มสุด'},
]

function ShopScreen({ user, onBack, onUpdateHoney }) {
  const [honey,setHoney]=useState(user.profile?.honey||0)
  const [bought,setBought]=useState(null)

  const buy = async (pkg) => {
    const newHoney = honey + pkg.honey
    const { error } = await supabase.from('profiles').update({honey:newHoney}).eq('id',user.id)
    if (!error) { setHoney(newHoney); onUpdateHoney(newHoney); setBought(pkg); setTimeout(()=>setBought(null),2800) }
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fffbf0,#fff5dc)',fontFamily:"'Noto Sans Thai',sans-serif"}}>
      <div style={{background:'rgba(255,255,255,0.9)',backdropFilter:'blur(14px)',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1.5px solid #ffd6a5',position:'sticky',top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#ff9500',lineHeight:1}}>←</button>
        <div style={{flex:1,fontFamily:"'Fredoka One',cursive",fontSize:20,color:'#ff9500'}}>🛒 ร้านค้า — น้ำผึ้ง</div>
        <HoneyBadge amount={honey}/>
      </div>
      <div style={{padding:'22px 14px'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:46,animation:'logoFloat 3s ease-in-out infinite'}}>🍯</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:'#ff9500',marginTop:4}}>เติมน้ำผึ้ง</div>
          <div style={{fontSize:12,color:'#bbb',marginTop:3}}>1 ข้อความ = {MSG_COST} น้ำผึ้ง</div>
        </div>
        {bought&&<div style={{background:'linear-gradient(135deg,#d4edda,#c3e6cb)',border:'1.5px solid #28a745',borderRadius:16,padding:14,textAlign:'center',marginBottom:18,animation:'fadeUp 0.3s ease',color:'#155724',fontWeight:700,fontSize:15}}>✅ ได้รับ {bought.honey} น้ำผึ้งแล้ว! 🍯</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {PACKAGES.map((pkg,i)=>(
            <div key={pkg.id} onClick={()=>buy(pkg)}
              style={{background:'rgba(255,255,255,0.94)',border:'2px solid #ffd6a5',borderRadius:20,padding:'20px 12px',cursor:'pointer',textAlign:'center',animation:`fadeUp 0.3s ease ${i*0.08}s both`,transition:'transform 0.2s',boxShadow:'0 4px 16px #ffd6a544',position:'relative'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px) scale(1.02)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}
            >
              {pkg.badge&&<div style={{position:'absolute',top:-9,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#ff6fa8,#c97ee8)',color:'#fff',borderRadius:20,fontSize:10,padding:'3px 10px',fontWeight:700,whiteSpace:'nowrap'}}>{pkg.badge}</div>}
              <div style={{fontSize:38,marginBottom:7}}>{pkg.emoji}</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:'#ff9500',marginBottom:4}}>{pkg.name}</div>
              <div style={{fontSize:22,fontWeight:900,color:'#b85c00',marginBottom:10}}>🍯 {pkg.honey}</div>
              <div style={{background:'linear-gradient(135deg,#ff9500,#ffb347)',color:'#fff',borderRadius:12,padding:'9px',fontSize:17,fontWeight:800}}>{pkg.price}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:20,padding:12,background:'rgba(255,255,255,0.6)',borderRadius:14,border:'1.5px dashed #ffd6a5',textAlign:'center',color:'#bbb',fontSize:11,lineHeight:1.7}}>💡 Demo Mode — เชื่อมต่อ PromptPay / Stripe สำหรับระบบจริง</div>
      </div>
    </div>
  )
}

// ─── PROFILE SCREEN ───────────────────────────────────────────
function ProfileScreen({ user, onBack, onLogout }) {
  const [honey] = useState(user.profile?.honey||0)
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fff5f9,#f9f0ff)',fontFamily:"'Noto Sans Thai',sans-serif"}}>
      <div style={{background:'rgba(255,255,255,0.9)',backdropFilter:'blur(14px)',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1.5px solid #ffd6eb'}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#ff6fa8',lineHeight:1}}>←</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:'#ff6fa8'}}>โปรไฟล์</div>
      </div>
      <div style={{padding:'32px 20px',textAlign:'center'}}>
        <div style={{width:84,height:84,borderRadius:'50%',background:'linear-gradient(135deg,#ffd6eb,#e8d5ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,margin:'0 auto 14px',border:'3px solid #ff6fa8',boxShadow:'0 4px 20px #ff6fa844'}}>👤</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:'#ff6fa8',marginBottom:3}}>{user.profile?.username}</div>
        <div style={{fontSize:12,color:'#ccc',marginBottom:24}}>{user.email}</div>
        <div style={{background:'white',borderRadius:20,padding:20,boxShadow:'0 4px 16px rgba(255,107,168,0.1)',border:'1.5px solid #ffd6eb',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f0e8f8'}}><span style={{color:'#aaa',fontSize:14}}>น้ำผึ้งคงเหลือ</span><HoneyBadge amount={honey}/></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}><span style={{color:'#aaa',fontSize:14}}>สมาชิกตั้งแต่</span><span style={{color:'#c97ee8',fontSize:14}}>{new Date(user.profile?.created_at||Date.now()).toLocaleDateString('th-TH')}</span></div>
        </div>
        <button onClick={onLogout} style={{width:'100%',padding:13,borderRadius:16,border:'1.5px solid #ffb3c6',background:'white',color:'#ff6fa8',fontFamily:"'Noto Sans Thai',sans-serif",fontSize:14,cursor:'pointer',fontWeight:600}}>ออกจากระบบ</button>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(null)
  const [user, setUser] = useState(null)
  const [activeChar, setActiveChar] = useState(null)

  useEffect(()=>{
    supabase.auth.getSession().then(async ({data:{session}})=>{
      if (session?.user) {
        const {data:profile} = await supabase.from('profiles').select('*').eq('id',session.user.id).single()
        setUser({...session.user, profile})
        setScreen('home')
      } else {
        setScreen('login')
      }
    })
    const {data:{subscription}} = supabase.auth.onAuthStateChange(async (event,session)=>{
      if (event==='SIGNED_OUT') { setUser(null); setScreen('login') }
    })
    return ()=>subscription.unsubscribe()
  },[])

  const updateHoney = (h) => setUser(u=>({...u, profile:{...u.profile,honey:h}}))
  const logout = async () => { await supabase.auth.signOut() }

  if (!screen) return (<><style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Noto+Sans+Thai:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style><Loader/></>)

  return (
    <>
      <Head>
        <title>HoneyMuse — AI Roleplay Companion</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍯</text></svg>"/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Noto+Sans+Thai:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{max-width:480px;margin:0 auto;background:#f5f5f5;min-height:100vh}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes twinkle{0%,100%{opacity:0.15;transform:scale(1)}50%{opacity:1;transform:scale(1.6)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,107,168,0.3);border-radius:3px}
        input,textarea{outline:none;resize:none}
        html,body{height:100%}
        @media(min-width:480px){body{box-shadow:0 0 40px rgba(0,0,0,0.08)}}
      `}</style>

      {screen==='login' && <AuthScreen onLogin={u=>{setUser(u);setScreen('home')}}/>}
      {screen==='home' && user && <HomeScreen user={user} onSelectChar={c=>{setActiveChar(c);setScreen('char-detail')}} onShop={()=>setScreen('shop')} onCreateChar={()=>setScreen('create-char')} onProfile={()=>setScreen('profile')}/>}
      {screen==='char-detail' && activeChar && <CharDetailScreen char={activeChar} onBack={()=>setScreen('home')} onStartChat={c=>{setActiveChar(c);setScreen('chat')}}/>}
      {screen==='chat' && activeChar && user && <ChatScreen char={activeChar} user={user} onBack={()=>setScreen('home')} onUpdateHoney={updateHoney}/>}
      {screen==='shop' && user && <ShopScreen user={user} onBack={()=>setScreen('home')} onUpdateHoney={updateHoney}/>}
      {screen==='profile' && user && <ProfileScreen user={user} onBack={()=>setScreen('home')} onLogout={logout}/>}
      {screen==='create-char' && user && <CreateCharScreen user={user} onBack={()=>setScreen('home')} onSave={()=>setScreen('home')}/>}
    </>
  )
}
