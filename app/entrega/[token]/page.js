'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'

export default function EntregaPage({ params }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('whitelabel_configs')
        .select('*, products(name, access_url, metadata)')
        .eq('delivery_token', params.token)
        .single()
      setConfig(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{color:'#f0a500',fontSize:'14px',letterSpacing:'4px'}}>CARREGANDO...</div>
    </div>
  )

  if (!config) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',color:'#e8e8e8'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>❌</div>
        <div style={{fontSize:'16px',fontWeight:'700'}}>Link inválido ou expirado</div>
      </div>
    </div>
  )

  const color = config.primary_color || '#f0a500'
  const modules = config.products?.metadata?.modules || []

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',fontFamily:'sans-serif',color:'#e8e8e8'}}>
      <nav style={{background:'#0f0f0f',borderBottom:'1px solid #1e1e1e',padding:'0 32px',height:'52px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        {config.business_logo_url
          ? <img src={config.business_logo_url} alt="logo" style={{height:'32px',objectFit:'contain'}}/>
          : <div style={{fontSize:'16px',fontWeight:'900',letterSpacing:'3px',color}}>{config.business_name||'Oracle Pro'}</div>
        }
        <div style={{fontSize:'10px',color:'#555',letterSpacing:'1px'}}>Kit de Entrega White Label</div>
      </nav>
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'48px 24px'}}>
        <div style={{background:'linear-gradient(135deg,#111,#1a1500)',border:'1px solid rgba(240,165,0,.27)',borderRadius:'16px',padding:'40px',marginBottom:'28px',textAlign:'center',position:'relative',overflow:'hidden'}}>
          <div style={{position:'relative',zIndex:2}}>
            {config.business_logo_url && <img src={config.business_logo_url} alt="logo" style={{height:'48px',objectFit:'contain',marginBottom:'20px'}}/>}
            <div style={{fontSize:'11px',letterSpacing:'4px',color:'#f0a500',textTransform:'uppercase',marginBottom:'10px'}}>Certificado White Label</div>
            <div style={{fontSize:'28px',fontWeight:'900',color:'#f0a500',marginBottom:'10px'}}>{config.business_name||'Seu Negócio'}</div>
            <div style={{fontSize:'14px',color:'#aaa',marginBottom:'20px'}}>
              Licença autorizada para: <strong style={{color:'#e8e8e8'}}>{config.client_name||'Cliente'}</strong>
            </div>
            <div style={{display:'inline-block',background:'rgba(240,165,0,.1)',border:'1px solid rgba(240,165,0,.27)',borderRadius:'8px',padding:'10px 24px',fontSize:'13px',color:'#f0a500',letterSpacing:'2px',fontFamily:'monospace',marginBottom:'16px'}}>
              ID: {config.delivery_token?.toUpperCase().substring(0,16)}
            </div>
            <div style={{fontSize:'11px',color:'#555'}}>
              {new Date(config.created_at).toLocaleDateString('pt-BR',{year:'numeric',month:'long',day:'numeric'})}
            </div>
          </div>
        </div>
        {config.products?.access_url && (
          <a href={config.products.access_url} target="_blank" rel="noreferrer"
            style={{display:'block',width:'100%',background:'linear-gradient(90deg,#f0a500,#e05500)',color:'#000',borderRadius:'10px',padding:'16px',textAlign:'center',fontSize:'14px',fontWeight:'700',textDecoration:'none',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'24px'}}>
            🚀 Acessar o Sistema
          </a>
        )}
        {modules.length > 0 && (
          <div style={{background:'#111',border:'1px solid #1e1e1e',borderRadius:'12px',padding:'24px',marginBottom:'20px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',marginBottom:'16px'}}>📋 Documentação e Materiais</div>
            {modules.map((mod,mi)=>(
              <div key={mi} style={{marginBottom:'12px'}}>
                <div style={{fontSize:'11px',fontWeight:'700',color:'#f0a500',marginBottom:'8px',textTransform:'uppercase'}}>{mod.title}</div>
                {mod.files?.map((file,fi)=>(
                  <a key={fi} href={file.url} target="_blank" rel="noreferrer"
                    style={{display:'flex',alignItems:'center',gap:'12px',background:'#0d0d0d',borderRadius:'8px',padding:'10px 14px',border:'1px solid #1e1e1e',textDecoration:'none',marginBottom:'6px'}}>
                    <span style={{fontSize:'18px'}}>{file.name?.endsWith('.pdf')?'📄':'📎'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'12px',fontWeight:'600',color:'#e8e8e8'}}>{file.name}</div>
                      <div style={{fontSize:'10px',color:'#555'}}>{file.size}</div>
                    </div>
                    <div style={{fontSize:'11px',color:'#f0a500',fontWeight:'700'}}>⬇ Baixar</div>
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{textAlign:'center',fontSize:'10px',color:'#333',marginTop:'32px'}}>
          🔒 Entrega segura · {config.business_name||'Oracle Pro'} · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}