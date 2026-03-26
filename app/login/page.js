'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deviceWarning, setDeviceWarning] = useState(false)
  const [pendingSession, setPendingSession] = useState(null)
  const router = useRouter()

  function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  function getDeviceInfo() {
    const ua = navigator.userAgent
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Outro'
    const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop'
    return { browser, device }
  }

  async function checkExistingSession(userId) {
    const supabase = createClient()
    const { data } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false })
    return data || []
  }

  async function createSession(userId, forceDisconnect = false) {
    const supabase = createClient()
    const sessionId = generateSessionId()
    const { browser, device } = getDeviceInfo()

    if (forceDisconnect) {
      await supabase.from('device_sessions').delete().eq('user_id', userId)
    }

    await supabase.from('device_sessions').insert({
      user_id: userId,
      session_id: sessionId,
      device,
      browser,
      ip_address: 'detectando...',
      city: 'detectando...',
      last_active: new Date().toISOString()
    })

    localStorage.setItem('oracle_session_id', sessionId)
    localStorage.setItem('oracle_user_id', userId)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou senha incorretos!')
      setLoading(false)
      return
    }

    const userId = data.user.id
    const existingSessions = await checkExistingSession(userId)

    if (existingSessions.length >= 1) {
      const lastSession = existingSessions[0]
      setPendingSession({ userId, lastSession })
      setDeviceWarning(true)
      setLoading(false)
      return
    }

    await createSession(userId)
    router.push('/dashboard')
  }

  async function handleForceLogin() {
    setLoading(true)
    await createSession(pendingSession.userId, true)
    router.push('/dashboard')
  }

  async function handleCancelLogin() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDeviceWarning(false)
    setPendingSession(null)
    setLoading(false)
  }

  const s = {
    bg:'#0a0a0a', border:'#1e1e1e', text:'#e8e8e8',
    muted:'#555', accent:'#f0a500', accent2:'#e05500'
  }

  if (deviceWarning && pendingSession) {
    return (
      <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',padding:'20px'}}>
        <div style={{background:'#111',border:`1px solid ${s.border}`,borderRadius:'14px',padding:'36px',width:'100%',maxWidth:'420px'}}>
          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <div style={{fontSize:'36px',marginBottom:'12px'}}>⚠️</div>
            <div style={{fontSize:'16px',fontWeight:'700',color:s.text,marginBottom:'8px'}}>Sessão ativa detectada</div>
            <div style={{fontSize:'12px',color:s.muted,lineHeight:1.6}}>
              Sua conta já está conectada em outro dispositivo.<br/>
              Se continuar, o outro acesso será <strong style={{color:'#ff4560'}}>desconectado automaticamente</strong>.
            </div>
          </div>

          <div style={{background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'8px',padding:'14px',marginBottom:'20px'}}>
            <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Dispositivo conectado</div>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{fontSize:'24px'}}>{pendingSession.lastSession.device==='Mobile'?'📱':'💻'}</div>
              <div>
                <div style={{fontSize:'12px',fontWeight:'600',color:s.text}}>{pendingSession.lastSession.device} · {pendingSession.lastSession.browser}</div>
                <div style={{fontSize:'10px',color:s.muted,marginTop:'2px'}}>
                  Último acesso: {new Date(pendingSession.lastSession.last_active).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <button onClick={handleForceLogin} disabled={loading}
              style={{width:'100%',background:'linear-gradient(90deg,#f0a500,#e05500)',color:'#000',fontWeight:'700',fontSize:'12px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer',letterSpacing:'.5px'}}>
              {loading?'Entrando...':'Continuar e desconectar o outro dispositivo'}
            </button>
            <button onClick={handleCancelLogin}
              style={{width:'100%',background:'transparent',color:s.muted,fontSize:'12px',padding:'12px',borderRadius:'8px',border:`1px solid ${s.border}`,cursor:'pointer'}}>
              Cancelar
            </button>
          </div>

          <div style={{textAlign:'center',marginTop:'16px',fontSize:'10px',color:'#333'}}>
            🔒 Este acesso será registrado para segurança
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',padding:'20px'}}>
      <div style={{background:'#111',border:`1px solid ${s.border}`,borderRadius:'14px',padding:'40px',width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'26px',fontWeight:'900',letterSpacing:'4px',background:'linear-gradient(90deg,#f0a500,#e05500)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'6px'}}>ORACLE PRO</div>
          <div style={{fontSize:'11px',color:s.muted,letterSpacing:'2px',textTransform:'uppercase'}}>Área de Membros</div>
        </div>

        {error && (
          <div style={{background:'rgba(255,69,96,.1)',border:'1px solid rgba(255,69,96,.3)',borderRadius:'6px',padding:'10px 14px',fontSize:'12px',color:'#ff4560',marginBottom:'16px'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Email</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com"
              style={{width:'100%',background:'#161616',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'11px 14px',fontSize:'13px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
          </div>
          <div style={{marginBottom:'24px'}}>
            <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Senha</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
              style={{width:'100%',background:'#161616',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'11px 14px',fontSize:'13px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'linear-gradient(90deg,#f0a500,#e05500)',color:'#000',fontWeight:'700',fontSize:'12px',padding:'13px',borderRadius:'7px',border:'none',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase'}}>
            {loading?'Entrando...':'Entrar'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:'20px',fontSize:'10px',color:'#333',letterSpacing:'.5px'}}>
          🔒 Acesso seguro e criptografado · Oracle Pro
        </div>
      </div>
    </div>
  )
}
