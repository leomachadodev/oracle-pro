'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Ebook() {
  const [user, setUser] = useState(null)
  const [product, setProduct] = useState(null)
  const [capAtivo, setCapAtivo] = useState(0)
  const [modAtivo, setModAtivo] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const productId = localStorage.getItem('ebook_product_id')
      if (!productId) { router.push('/dashboard'); return }
      const { data: prod } = await supabase.from('products').select('*').eq('id', productId).single()
      setProduct(prod)
    }
    load()
  }, [])

  const modules = product?.metadata?.modules || []
  const modAtual = modules[modAtivo] || {}
  const fileAtual = modAtual.files?.[capAtivo]
  const totalFiles = modules.reduce((acc, m) => acc + (m.files?.length || 0), 0)
  const filesPassados = modules.slice(0, modAtivo).reduce((acc, m) => acc + (m.files?.length || 0), 0)
  const progresso = totalFiles > 0 ? Math.round(((filesPassados + capAtivo) / totalFiles) * 100) : 0

  const s = {bg:'#0a0a0a',nav:'#0f0f0f',border:'#1e1e1e',text:'#e8e8e8',muted:'#555',accent:'#f0a500',accent2:'#e05500',green:'#22d97a'}

  if (!product) return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{color:s.accent,fontSize:'14px',letterSpacing:'4px'}}>CARREGANDO...</div>
    </div>
  )

  return (
    <div style={{height:'100vh',background:s.bg,fontFamily:'sans-serif',color:s.text,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <nav style={{background:s.nav,borderBottom:`1px solid ${s.border}`,padding:'0 20px',height:'50px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div onClick={()=>router.push('/dashboard')} style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'11px',color:s.muted,cursor:'pointer'}}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7"/></svg>Voltar
          </div>
          <div style={{width:'1px',height:'14px',background:s.border}}></div>
          <div style={{fontSize:'11px',color:'#666'}}>{product?.name}</div>
        </div>
        <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'4px',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
        <div style={{fontSize:'10px',color:s.muted}}>{progresso}% lido</div>
      </nav>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        {/* VIEWER */}
        <div style={{flex:1,background:'#1a1a1a',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{background:'#0d0d0d',borderBottom:`1px solid ${s.border}`,padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,position:'sticky',top:0,zIndex:10}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <button onClick={()=>{
                if(capAtivo>0){setCapAtivo(c=>c-1)}
                else if(modAtivo>0){setModAtivo(m=>m-1);setCapAtivo((modules[modAtivo-1]?.files?.length||1)-1)}
              }} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 12px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>⬅ Anterior</button>
              <span style={{fontSize:'11px',color:s.muted}}>{modAtual.title} · {capAtivo+1}/{modAtual.files?.length||0}</span>
              <button onClick={()=>{
                if(capAtivo<(modAtual.files?.length||0)-1){setCapAtivo(c=>c+1)}
                else if(modAtivo<modules.length-1){setModAtivo(m=>m+1);setCapAtivo(0)}
              }} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 12px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>Próximo ➡</button>
            </div>
            {fileAtual && (
              <a href={fileAtual.url} target="_blank" rel="noreferrer"
                style={{background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',border:'none',borderRadius:'5px',padding:'6px 14px',fontSize:'10px',fontWeight:'700',cursor:'pointer',textDecoration:'none',letterSpacing:'.5px'}}>
                ⬇ Baixar arquivo
              </a>
            )}
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'32px',display:'flex',justifyContent:'center',scrollbarWidth:'thin',scrollbarColor:'#222 transparent'}}>
            {fileAtual ? (
              <div style={{background:'#fff',width:'100%',maxWidth:'700px',minHeight:'600px',borderRadius:'8px',boxShadow:'0 8px 40px rgba(0,0,0,.6)',overflow:'hidden'}}>
                {fileAtual.url?.match(/\.(pdf)$/i) ? (
                  <iframe src={fileAtual.url} style={{width:'100%',height:'100%',minHeight:'800px',border:'none'}}/>
                ) : fileAtual.url?.match(/\.(mp4|webm)$/i) ? (
                  <video src={fileAtual.url} controls style={{width:'100%'}}/>
                ) : fileAtual.url?.match(/\.(mp3|wav)$/i) ? (
                  <div style={{padding:'40px',textAlign:'center'}}>
                    <div style={{fontSize:'48px',marginBottom:'16px'}}>🎵</div>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#111',marginBottom:'16px'}}>{fileAtual.name}</div>
                    <audio src={fileAtual.url} controls style={{width:'100%'}}/>
                  </div>
                ) : (
                  <div style={{padding:'60px',textAlign:'center'}}>
                    <div style={{fontSize:'64px',marginBottom:'20px'}}>📄</div>
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#111',marginBottom:'8px'}}>{fileAtual.name}</div>
                    <div style={{fontSize:'12px',color:'#888',marginBottom:'24px'}}>{fileAtual.size}</div>
                    <a href={fileAtual.url} target="_blank" rel="noreferrer"
                      style={{background:'#f0a500',color:'#000',padding:'12px 28px',borderRadius:'8px',textDecoration:'none',fontWeight:'700',fontSize:'13px'}}>
                      ⬇ Baixar arquivo
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'80px',color:s.muted,fontSize:'13px'}}>
                <div style={{fontSize:'48px',marginBottom:'16px'}}>📭</div>
                Nenhum arquivo neste módulo ainda.
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{width:'260px',background:'#0d0d0d',borderLeft:`1px solid ${s.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`}}>
            <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'}}>Sumário</div>
            <div style={{fontSize:'12px',color:s.green,marginTop:'4px',fontWeight:'600'}}>{product?.name}</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
              <div style={{flex:1,height:'3px',background:'#222',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${progresso}%`,background:s.green,borderRadius:'2px'}}></div>
              </div>
              <span style={{fontSize:'10px',color:s.muted}}>{progresso}%</span>
            </div>
          </div>

          <div style={{flex:1,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#1a1a1a transparent'}}>
            {modules.map((mod, mi) => (
              <div key={mi} style={{borderBottom:`1px solid ${s.border}`}}>
                <div onClick={()=>{setModAtivo(mi);setCapAtivo(0)}}
                  style={{padding:'10px 16px',cursor:'pointer',background:modAtivo===mi?'rgba(34,217,122,.06)':'transparent',borderLeft:`2px solid ${modAtivo===mi?s.green:'transparent'}`}}
                  onMouseEnter={e=>{if(modAtivo!==mi)e.currentTarget.style.background='#111'}}
                  onMouseLeave={e=>{if(modAtivo!==mi)e.currentTarget.style.background='transparent'}}>
                  <div style={{fontSize:'11px',fontWeight:'700',color:modAtivo===mi?s.green:s.text}}>{mod.title}</div>
                  <div style={{fontSize:'9px',color:s.muted,marginTop:'2px'}}>{mod.files?.length||0} arquivo{(mod.files?.length||0)!==1?'s':''}</div>
                </div>
                {modAtivo===mi && mod.files?.map((file, fi) => (
                  <div key={fi} onClick={()=>setCapAtivo(fi)}
                    style={{padding:'8px 16px 8px 28px',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',background:capAtivo===fi?'rgba(34,217,122,.1)':'transparent',borderLeft:`2px solid ${capAtivo===fi?s.green:'transparent'}`}}
                    onMouseEnter={e=>{if(capAtivo!==fi)e.currentTarget.style.background='#111'}}
                    onMouseLeave={e=>{if(capAtivo!==fi)e.currentTarget.style.background='transparent'}}>
                    <span style={{fontSize:'12px'}}>
                      {file.name?.endsWith('.pdf')?'📄':file.name?.endsWith('.mp4')?'🎬':file.name?.endsWith('.mp3')?'🎵':'📎'}
                    </span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'10px',color:capAtivo===fi?s.green:s.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{file.name}</div>
                      <div style={{fontSize:'9px',color:s.muted}}>{file.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{padding:'14px 16px',borderTop:`1px solid ${s.border}`}}>
            <a href={fileAtual?.url} target="_blank" rel="noreferrer"
              style={{display:'block',width:'100%',background:`linear-gradient(90deg,#15803d,${s.green})`,color:'#000',fontSize:'11px',fontWeight:'700',padding:'10px',borderRadius:'6px',border:'none',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',textAlign:'center',textDecoration:'none'}}>
              ⬇ Baixar arquivo atual
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
