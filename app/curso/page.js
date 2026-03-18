'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Curso() {
  const [user, setUser] = useState(null)
  const [aulaAtiva, setAulaAtiva] = useState(0)
  const [modAberto, setModAberto] = useState(0)
  const [tab, setTab] = useState('sobre')
  const router = useRouter()

  const curso = {
    nome: 'Tráfego Pago Dominação 2025',
    progresso: 45,
    modulos: [
      { nome: 'Fundamentos', aulas: [
        { titulo: 'Introdução ao tráfego', dur: '8min', done: true },
        { titulo: 'Métricas essenciais', dur: '12min', done: true },
        { titulo: 'Estrutura de campanhas', dur: '15min', done: true },
        { titulo: 'Pixels e rastreamento', dur: '18min', done: false },
        { titulo: 'Públicos e segmentação', dur: '20min', done: false },
        { titulo: 'Orçamento e lances', dur: '14min', done: false },
      ]},
      { nome: 'Meta Ads', aulas: [
        { titulo: 'Criando conta Business', dur: '10min', done: false },
        { titulo: 'Campanhas de conversão', dur: '22min', done: false },
        { titulo: 'Criativos que convertem', dur: '18min', done: false },
      ]},
      { nome: 'Google Ads', aulas: [
        { titulo: 'Google Search', dur: '20min', done: false },
        { titulo: 'Google Display', dur: '15min', done: false },
      ]},
      { nome: 'TikTok Ads', aulas: [
        { titulo: 'Introdução TikTok Ads', dur: '14min', done: false },
        { titulo: 'Criando campanhas', dur: '18min', done: false },
      ]},
    ],
    materiais: [
      { nome: 'Checklist instalação do Pixel', tipo: 'PDF', tamanho: '380 KB' },
      { nome: 'Planilha de eventos', tipo: 'XLSX', tamanho: '220 KB' },
    ]
  }

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
    }
    check()
  }, [])

  const todasAulas = curso.modulos.flatMap(m => m.aulas)
  const aulaAtual = todasAulas[aulaAtiva]
  const totalAulas = todasAulas.length

  const s = {
    bg:'#0a0a0a', nav:'#0f0f0f', border:'#1e1e1e',
    card:'#111', text:'#e8e8e8', muted:'#555',
    accent:'#f0a500', accent2:'#e05500', green:'#22d97a'
  }

  return (
    <div style={{height:'100vh',background:s.bg,fontFamily:'sans-serif',color:s.text,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      <nav style={{background:s.nav,borderBottom:`1px solid ${s.border}`,padding:'0 20px',height:'50px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div onClick={() => router.push('/dashboard')} style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'11px',color:s.muted,cursor:'pointer'}}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            Voltar
          </div>
          <div style={{width:'1px',height:'14px',background:s.border}}></div>
          <div style={{fontSize:'11px',color:'#666'}}>{curso.nome}</div>
        </div>
        <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'4px',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
        <div style={{fontSize:'10px',color:s.muted}}>Aula {aulaAtiva + 1} de {totalAulas}</div>
      </nav>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        <div style={{flex:1,display:'flex',flexDirection:'column',overflowY:'auto',scrollbarWidth:'thin'}}>

          <div style={{background:'#000',width:'100%',aspectRatio:'16/9',maxHeight:'56vh',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,#080808,#151008,#080808)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:'68px',height:'68px',borderRadius:'50%',background:'rgba(240,165,0,.18)',border:'2px solid rgba(240,165,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'26px'}}>▶</div>
            </div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px 18px 12px',background:'linear-gradient(0deg,rgba(0,0,0,.95),transparent)'}}>
              <div style={{fontSize:'13px',fontWeight:'600'}}>{aulaAtual?.titulo}</div>
              <div style={{fontSize:'10px',color:'#888',marginTop:'2px'}}>{aulaAtual?.dur}</div>
              <div style={{height:'3px',background:'#333',borderRadius:'2px',marginTop:'10px'}}>
                <div style={{height:'100%',width:'38%',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,borderRadius:'2px'}}></div>
              </div>
            </div>
          </div>

          <div style={{background:'#0d0d0d',borderBottom:`1px solid ${s.border}`,padding:'9px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => setAulaAtiva(Math.max(0, aulaAtiva - 1))} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'6px 13px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>⬅ Anterior</button>
              <button style={{background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',border:'none',borderRadius:'6px',padding:'6px 13px',fontSize:'10px',fontWeight:'700',cursor:'pointer'}}>✓ Marcar concluída</button>
              <button onClick={() => setAulaAtiva(Math.min(totalAulas - 1, aulaAtiva + 1))} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'6px 13px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>Próxima ➡</button>
            </div>
            <select style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'5px 9px',fontSize:'10px',color:s.text,fontFamily:'sans-serif',outline:'none'}}>
              <option>0.75x</option><option>1x</option><option>1.25x</option><option>1.5x</option><option>2x</option>
            </select>
          </div>

          <div style={{display:'flex',borderBottom:`1px solid ${s.border}`,padding:'0 18px',flexShrink:0}}>
            {[['sobre','Sobre a aula'],['materiais','Materiais'],['comentarios','Comentários']].map(([id,label]) => (
              <div key={id} onClick={() => setTab(id)} style={{padding:'11px 14px',fontSize:'11px',cursor:'pointer',borderBottom:`2px solid ${tab===id?s.accent:'transparent'}`,color:tab===id?s.accent:s.muted,transition:'all .15s'}}>{label}</div>
            ))}
          </div>

          <div style={{padding:'20px',flex:1}}>
            {tab === 'sobre' && (
              <div>
                <div style={{fontSize:'18px',fontWeight:'700',marginBottom:'8px'}}>{aulaAtual?.titulo}</div>
                <p style={{fontSize:'12px',color:'#888',lineHeight:1.7}}>Nesta aula você vai aprender os conceitos fundamentais e aplicações práticas. Acompanhe com atenção e utilize os materiais de apoio disponíveis.</p>
              </div>
            )}
            {tab === 'materiais' && (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {curso.materiais.map((mat, i) => (
                  <div key={i} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'10px 14px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'6px',background:'rgba(240,165,0,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px'}}>📄</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'11px',fontWeight:'600'}}>{mat.nome}</div>
                      <div style={{fontSize:'9px',color:s.muted,marginTop:'2px'}}>{mat.tipo} · {mat.tamanho}</div>
                    </div>
                    <div style={{fontSize:'10px',color:s.accent,fontWeight:'700'}}>⬇ Baixar</div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'comentarios' && (
              <div style={{textAlign:'center',padding:'40px',color:s.muted,fontSize:'12px'}}>💬 Comentários em breve</div>
            )}
          </div>
        </div>

        <div style={{width:'310px',background:'#0d0d0d',borderLeft:`1px solid ${s.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`}}>
            <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'}}>Conteúdo do Curso</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
              <div style={{flex:1,height:'3px',background:'#222',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${curso.progresso}%`,background:`linear-gradient(90deg,${s.accent},${s.accent2})`,borderRadius:'2px'}}></div>
              </div>
              <span style={{fontSize:'10px',color:s.muted}}>{curso.progresso}%</span>
            </div>
          </div>
          <div style={{padding:'8px 12px',borderBottom:`1px solid ${s.border}`}}>
            <input type="text" placeholder="🔍  Buscar aula..." style={{width:'100%',background:'#161616',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'6px 10px',fontSize:'11px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#1a1a1a transparent'}}>
            {curso.modulos.map((mod, mi) => (
              <div key={mi} style={{borderBottom:`1px solid ${s.border}`}}>
                <div onClick={() => setModAberto(modAberto === mi ? -1 : mi)}
                  style={{padding:'11px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',gap:'10px'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#111'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',flex:1,minWidth:0}}>
                    <span style={{fontSize:'8px',color:s.muted,fontWeight:'700',background:'#1a1a1a',padding:'2px 6px',borderRadius:'3px',flexShrink:0}}>MOD {mi+1}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:'11px',fontWeight:'600',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{mod.nome}</div>
                      <div style={{fontSize:'9px',color:s.muted,marginTop:'1px'}}>{mod.aulas.length} aulas</div>
                    </div>
                  </div>
                  <span style={{fontSize:'9px',color:s.muted,transition:'transform .2s',transform:modAberto===mi?'rotate(90deg)':'rotate(0deg)',flexShrink:0}}>▶</span>
                </div>
                {modAberto === mi && (
                  <div>
                    {mod.aulas.map((aula, ai) => {
                      const globalIndex = curso.modulos.slice(0,mi).flatMap(m=>m.aulas).length + ai
                      const isActive = aulaAtiva === globalIndex
                      return (
                        <div key={ai} onClick={() => setAulaAtiva(globalIndex)}
                          style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 14px 8px 28px',cursor:'pointer',borderLeft:`2px solid ${isActive?s.accent:'transparent'}`,background:isActive?'rgba(240,165,0,.07)':'transparent'}}
                          onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='#111' }}
                          onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background=isActive?'rgba(240,165,0,.07)':'transparent' }}>
                          <span style={{fontSize:'9px',color:s.muted,width:'18px',flexShrink:0}}>{String(globalIndex+1).padStart(2,'0')}</span>
                          <div style={{width:'52px',height:'30px',borderRadius:'4px',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#333',flexShrink:0,border:isActive?'1px solid rgba(240,165,0,.4)':'none'}}>▶</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'10px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isActive?s.accent:s.text}}>{aula.titulo}</div>
                            <div style={{fontSize:'8px',color:s.muted,marginTop:'1px'}}>{aula.dur}</div>
                          </div>
                          <div style={{width:'14px',height:'14px',borderRadius:'50%',border:`1.5px solid ${aula.done?s.green:'#2a2a2a'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',flexShrink:0,background:aula.done?s.green:'transparent',color:aula.done?'#000':'transparent'}}>✓</div>
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