'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos!')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'40px',width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'28px',fontWeight:'900',letterSpacing:'4px',background:'linear-gradient(90deg,#f0a500,#e05500)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
          <div style={{fontSize:'12px',color:'#555',marginTop:'6px',letterSpacing:'2px'}}>ÁREA DE MEMBROS</div>
        </div>
        {error && <div style={{background:'rgba(255,69,96,.15)',border:'1px solid rgba(255,69,96,.3)',borderRadius:'6px',padding:'10px 14px',fontSize:'12px',color:'#ff4560',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'16px'}}>
            <label style={{fontSize:'11px',color:'#555',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com"
              style={{width:'100%',background:'#161616',border:'1px solid #222',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',color:'#e8e8e8',outline:'none'}}/>
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{fontSize:'11px',color:'#555',letterSpacing:'1px',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Senha</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
              style={{width:'100%',background:'#161616',border:'1px solid #222',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',color:'#e8e8e8',outline:'none'}}/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'linear-gradient(90deg,#f0a500,#e05500)',color:'#000',fontWeight:'700',fontSize:'12px',padding:'12px',borderRadius:'6px',border:'none',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase'}}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:'20px',fontSize:'11px',color:'#333'}}>🔒 Acesso seguro e criptografado</div>
      </div>
    </div>
  )
}