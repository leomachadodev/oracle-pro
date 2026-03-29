'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Curso() {
  const [user, setUser] = useState(null)
  const [product, setProduct] = useState(null)
  const [aulaAtiva, setAulaAtiva] = useState(0)
  const [modAberto, setModAberto] = useState(0)
  const [tab, setTab] = useState('sobre')
  const [concluidas, setConcluidas] = useState([])
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const productId = localStorage.getItem('curso_product_id')
      if (!productId) { router.push('/dashboard'); return }
      const { data: prod } = await supabase.from('products').select('*').eq('id', productId).single()
      setProduct(prod)
      const { data: prog } = await supabase.from('progress').select('lesson_id').eq('user_id', user.id).eq('product_id', productId).eq('completed', true)
      if (prog) setConcluidas(prog.map(p => p.lesson_id))
    }
    load()
  }, [])

  async function marcarConcluida() {
    const supabase = createClient()
    const productId = localStorage.getItem('curso_product_id')
    const lessonId = `${modAberto}-${aulaAtiva}`
    await supabase.from('progress').upsert({
      user_id: user.id, product_id: productId,
      lesson_id: lessonId, completed: true
    }, {onConflict: 'user_id,product_id,lesson_id'})
    setConcluidas(prev => [...new Set([...prev, lessonId])])
    if (aulaAtiva < todasAulas.length - 1) setAulaAtiva(prev => prev + 1)
  }

  const modules = product?.metadata?.modules || []
  const todasAulas = modules.flatMap((mod, mi) =>
    (mod.aulas || []).map((aula, ai) => ({
      ...aula,
      modIndex: mi,
      aulaIndex: ai,
      globalIndex: modules.slice(0, mi).flatMap(m => m.aulas || []).length + ai
    }))
  )
  const aulaAtual = todasAulas[aulaAtiva]
  const lessonId = aulaAtual ? `${aulaAtual.modIndex}-${aulaAtual.aulaIndex}` : null
  const isAtualConcluida = lessonId && concluidas.includes(lessonId)

  const embedUrl = aulaAtual?.youtube
    ? aulaAtual.youtube.includes('embed') ? aulaAtual.youtube
      : aulaAtual.youtube.includes('youtu.be/') ? 'https://www.youtube.com/embed/' + aulaAtual.youtube.split('youtu.be/')[1]
      : aulaAtual.youtube.includes('watch?v=') ? aulaAtual.youtube.replace('watch?v=', 'embed/')
      : aulaAtual.youtube
    : ''

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
        <div style={{fontSize:'10px',color:s.muted}}>Aula {aulaAtiva+1} de {todasAulas.length}</div>
      </nav>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        {/* PLAYER LADO ESQUERDO */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

          {/* PLAYER — altura generosa como YouTube */}
          <div style={{background:'#000',width:'100%',position:'relative',flexShrink:0}} >
            {embedUrl ? (
              <div style={{position:'relative',paddingBottom:'56.25%',height:0}}>
                <iframe
                  src={embedUrl}
                  style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div style={{paddingBottom:'56.25%',position:'relative'}}>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,#080808,#151008)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px'}}>
                  <div style={{width:'68px',height:'68px',borderRadius:'50%',background:'rgba(240,165,0,.18)',border:'2px solid rgba(240,165,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px'}}>▶</div>
                  <div style={{fontSize:'12px',color:s.muted}}>Vídeo não configurado</div>
                </div>
              </div>
            )}
          </div>

          {/* CONTROLES */}
          <div style={{background:'#0d0d0d',borderBottom:`1px solid ${s.border}`,padding:'10px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>setAulaAtiva(Math.max(0,aulaAtiva-1))} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'7px 14px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>⬅ Anterior</button>
              <button onClick={marcarConcluida} style={{background:isAtualConcluida?'rgba(34,217,122,.2)':`linear-gradient(90deg,${s.accent},${s.accent2})`,color:isAtualConcluida?s.green:'#000',border:isAtualConcluida?`1px solid ${s.green}44`:'none',borderRadius:'6px',padding:'7px 14px',fontSize:'10px',fontWeight:'700',cursor:'pointer'}}>
                {isAtualConcluida?'✓ Concluída':'✓ Marcar concluída'}
              </button>
              <button onClick={()=>setAulaAtiva(Math.min(todasAulas.length-1,aulaAtiva+1))} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'7px 14px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>Próxima ➡</button>
            </div>
            <select style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'6px 10px',fontSize:'10px',color:s.text,fontFamily:'sans-serif',outline:'none'}}>
              <option>0.75x</option><option>1x</option><option>1.25x</option><option>1.5x</option><option>2x</option>
            </select>
          </div>

          {/* TABS + CONTEÚDO */}
          <div style={{display:'flex',borderBottom:`1px solid ${s.border}`,padding:'0 18px',flexShrink:0}}>
            {[['sobre','Sobre a aula'],['materiais','Materiais'],['comentarios','Comentários']].map(([id,label])=>(
              <div key={id} onClick={()=>setTab(id)} style={{padding:'10px 14px',fontSize:'11px',cursor:'pointer',borderBottom:`2px solid ${tab===id?s.accent:'transparent'}`,color:tab===id?s.accent:s.muted,transition:'all .15s'}}>{label}</div>
            ))}
          </div>

          <div style={{padding:'20px',overflowY:'auto',flex:1,scrollbarWidth:'thin'}}>
            {tab==='sobre' && (
              <div>
                <div style={{fontSize:'18px',fontWeight:'700',marginBottom:'6px'}}>{aulaAtual?.title}</div>
                <div style={{fontSize:'12px',color:s.muted}}>{modules[aulaAtual?.modIndex]?.title}{aulaAtual?.duration?' · '+aulaAtual.duration:''}</div>
              </div>
            )}
            {tab==='materiais' && (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {aulaAtual?.files?.length > 0 ? aulaAtual.files.map((file,i)=>(
                  <a key={i} href={file.url} target="_blank" rel="noreferrer"
                    style={{background:'#111',border:`1px solid ${s.border}`,borderRadius:'8px',padding:'10px 14px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer',textDecoration:'none',transition:'border-color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#333'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=s.border}>
                    <div style={{width:'32px',height:'32px',borderRadius:'6px',background:'rgba(240,165,0,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',flexShrink:0}}>📄</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'11px',fontWeight:'600',color:s.text}}>{file.name}</div>
                      <div style={{fontSize:'9px',color:s.muted,marginTop:'2px'}}>{file.size}</div>
                    </div>
                    <div style={{fontSize:'10px',color:s.accent,fontWeight:'700'}}>⬇ Baixar</div>
                  </a>
                )) : (
                  <div style={{textAlign:'center',padding:'40px',color:s.muted,fontSize:'12px'}}>Nenhum material para esta aula.</div>
                )}
              </div>
            )}
            {tab==='comentarios' && (
              <div style={{textAlign:'center',padding:'40px',color:s.muted,fontSize:'12px'}}>💬 Comentários em breve</div>
            )}
          </div>
        </div>

        {/* SIDEBAR MÓDULOS — DIREITA */}
        <div style={{width:'310px',background:'#0d0d0d',borderLeft:`1px solid ${s.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`}}>
            <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'}}>Conteúdo do Curso</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
              <div style={{flex:1,height:'3px',background:'#222',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${todasAulas.length>0?(concluidas.length/todasAulas.length)*100:0}%`,background:`linear-gradient(90deg,${s.accent},${s.accent2})`,borderRadius:'2px'}}></div>
              </div>
              <span style={{fontSize:'10px',color:s.muted}}>{concluidas.length}/{todasAulas.length}</span>
            </div>
          </div>
          <div style={{padding:'8px 12px',borderBottom:`1px solid ${s.border}`}}>
            <input type="text" placeholder="🔍  Buscar aula..." style={{width:'100%',background:'#161616',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'6px 10px',fontSize:'11px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#1a1a1a transparent'}}>
            {modules.map((mod,mi)=>(
              <div key={mi} style={{borderBottom:`1px solid ${s.border}`}}>
                <div onClick={()=>setModAberto(modAberto===mi?-1:mi)}
                  style={{padding:'11px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',gap:'10px'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#111'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',flex:1,minWidth:0}}>
                    <span style={{fontSize:'8px',color:s.muted,fontWeight:'700',background:'#1a1a1a',padding:'2px 6px',borderRadius:'3px',flexShrink:0}}>MOD {mi+1}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:'11px',fontWeight:'600',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{mod.title}</div>
                      <div style={{fontSize:'9px',color:s.muted,marginTop:'1px'}}>{mod.aulas?.length||0} aulas</div>
                    </div>
                  </div>
                  <span style={{fontSize:'9px',color:s.muted,transition:'transform .2s',transform:modAberto===mi?'rotate(90deg)':'rotate(0deg)',flexShrink:0}}>▶</span>
                </div>
                {modAberto===mi && (
                  <div>
                    {(mod.aulas||[]).map((aula,ai)=>{
                      const gIndex = modules.slice(0,mi).flatMap(m=>m.aulas||[]).length + ai
                      const isActive = aulaAtiva===gIndex
                      const isDone = concluidas.includes(`${mi}-${ai}`)
                      return (
                        <div key={ai} onClick={()=>setAulaAtiva(gIndex)}
                          style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 14px 8px 28px',cursor:'pointer',borderLeft:`2px solid ${isActive?s.accent:'transparent'}`,background:isActive?'rgba(240,165,0,.07)':'transparent'}}
                          onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='#111'}}
                          onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background='transparent'}}>
                          <span style={{fontSize:'9px',color:s.muted,width:'18px',flexShrink:0}}>{String(gIndex+1).padStart(2,'0')}</span>
                          <div style={{width:'52px',height:'30px',borderRadius:'4px',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#333',flexShrink:0,border:isActive?'1px solid rgba(240,165,0,.4)':'none'}}>▶</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isActive?s.accent:s.text}}>{aula.title}</div>
                            <div style={{fontSize:'8px',color:s.muted,marginTop:'1px'}}>{aula.duration}</div>
                          </div>
                          <div style={{width:'14px',height:'14px',borderRadius:'50%',border:`1.5px solid ${isDone?s.green:'#2a2a2a'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',flexShrink:0,background:isDone?s.green:'transparent',color:isDone?'#000':'transparent'}}>✓</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
