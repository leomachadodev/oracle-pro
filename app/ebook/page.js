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
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {fileAtual && (
            <a href={fileAtual.url} target="_blank" rel="noreferrer"
              style={{background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',borderRadius:'5px',padding:'6px 14px',fontSize:'10px',fontWeight:'700',textDecoration:'none',letterSpacing:'.5px'}}>
              ⬇ Baixar
            </a>
          )}
          <div style={{fontSize:'10px',color:s.muted}}>{progresso}% lido</div>
        </div>
      </nav>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        {/* SIDEBAR */}
        <div style={{width:'240px',background:'#0d0d0d',borderRight:`1px solid ${s.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`}}>
            <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'}}>Sumário</div>
            <div style={{fontSize:'12px',color:s.green,marginTop:'4px',fontWeight:'600',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{product?.name}</div>
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
                  style={{padding:'10px 16px',cursor:'pointer',background:modAtivo===mi?'rgba(34,217,122,.08)':'transparent',borderLeft:`2px solid ${modAtivo===mi?s.green:'transparent'}`}}
                  onMouseEnter={e=>{if(modAtivo!==mi)e.currentTarget.style.background='#111'}}
                  onMouseLeave={e=>{if(modAtivo!==mi)e.currentTarget.style.background='transparent'}}>
                  <div style={{fontSize:'11px',fontWeight:'700',color:modAtivo===mi?s.green:s.text}}>{mod.title}</div>
                  <div style={{fontSize:'9px',color:s.muted,marginTop:'2px'}}>{mod.files?.length||0} arquivo{(mod.files?.length||0)!==1?'s':''}</div>
                </div>
                {modAtivo===mi && mod.files?.map((file, fi) => (
                  <div key={fi} onClick={()=>setCapAtivo(fi)}
                    style={{padding:'8px 16px 8px 24px',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',background:capAtivo===fi?'rgba(34,217,122,.12)':'transparent',borderLeft:`2px solid ${capAtivo===fi?s.green:'transparent'}`}}
                    onMouseEnter={e=>{if(capAtivo!==fi)e.currentTarget.style.background='#111'}}
                    onMouseLeave={e=>{if(capAtivo!==fi)e.currentTarget.style.background='transparent'}}>
                    <span style={{fontSize:'12px',flexShrink:0}}>
                      {file.name?.match(/\.pdf$/i)?'📄':file.name?.match(/\.(mp4|webm)$/i)?'🎬':file.name?.match(/\.(mp3|wav)$/i)?'🎵':'📎'}
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
        </div>

        {/* VIEWER — ocupa todo o espaço restante */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#111'}}>
          <div style={{background:'#0d0d0d',borderBottom:`1px solid ${s.border}`,padding:'8px 16px',display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
            <button onClick={()=>{
              if(capAtivo>0){setCapAtivo(c=>c-1)}
              else if(modAtivo>0){const newMod=modAtivo-1;setModAtivo(newMod);setCapAtivo((modules[newMod]?.files?.length||1)-1)}
            }} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 12px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>⬅ Anterior</button>
            <span style={{fontSize:'11px',color:s.muted,flex:1,textAlign:'center'}}>{modAtual.title} · {fileAtual?.name}</span>
            <button onClick={()=>{
              if(capAtivo<(modAtual.files?.length||0)-1){setCapAtivo(c=>c+1)}
              else if(modAtivo<modules.length-1){setModAtivo(m=>m+1);setCapAtivo(0)}
            }} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 12px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>Próximo ➡</button>
          </div>

          <div style={{flex:1,overflow:'hidden',position:'relative'}}>
            {fileAtual ? (
              fileAtual.url?.match(/\.pdf$/i) ? (
                <iframe
                  src={fileAtual.url+'#toolbar=1&navpanes=1&scrollbar=1&view=FitH'}
                  style={{width:'100%',height:'100%',border:'none',display:'block'}}
                  title={fileAtual.name}
                />
              ) : fileAtual.url?.match(/\.(mp4|webm)$/i) ? (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',padding:'20px'}}>
                  <video src={fileAtual.url} controls style={{maxWidth:'100%',maxHeight:'100%',borderRadius:'8px'}}/>
                </div>
              ) : fileAtual.url?.match(/\.(mp3|wav)$/i) ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'16px'}}>
                  <div style={{fontSize:'64px'}}>🎵</div>
                  <div style={{fontSize:'14px',fontWeight:'600'}}>{fileAtual.name}</div>
                  <audio src={fileAtual.url} controls style={{width:'80%',maxWidth:'500px'}}/>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'16px'}}>
                  <div style={{fontSize:'64px'}}>📄</div>
                  <div style={{fontSize:'16px',fontWeight:'700'}}>{fileAtual.name}</div>
                  <div style={{fontSize:'12px',color:s.muted}}>{fileAtual.size}</div>
                  <a href={fileAtual.url} target="_blank" rel="noreferrer"
                    style={{background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',padding:'12px 28px',borderRadius:'8px',textDecoration:'none',fontWeight:'700',fontSize:'13px'}}>
                    ⬇ Baixar arquivo
                  </a>
                </div>
              )
            ) : (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:s.muted,fontSize:'13px',flexDirection:'column',gap:'12px'}}>
                <div style={{fontSize:'48px'}}>📭</div>
                Nenhum arquivo neste módulo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
