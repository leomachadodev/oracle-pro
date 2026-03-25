'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [agentOpen, setAgentOpen] = useState(false)
  const [messages, setMessages] = useState([{type:'bot',text:'👋 Olá! Sou a Oracle IA. Como posso ajudar?'}])
  const [input, setInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('user_products')
        .select('id, status, products(id, name, description, type, access_url, thumbnail_url)')
        .eq('user_id', user.id)
      if (data) setProducts(data.filter(x => x.status === 'active'))
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleProductClick(up) {
    const type = up.products?.type
    const url = up.products?.access_url
    if (type === 'curso') { router.push('/curso') }
    else if (type === 'ebook') { router.push('/ebook') }
    else if (url) { window.open(url, '_blank') }
  }

  function sendMessage() {
    if (!input.trim()) return
    setMessages(prev => [...prev,
      {type:'user', text:input},
      {type:'bot', text:'Entendido! Para mais detalhes entre em contato pelo suporte@oraclepro.com'}
    ])
    setInput('')
  }

  const categoryColors = {
    saas:'#00d4ff', curso:'#f0a500', whitelabel:'#b06aff',
    ebook:'#22d97a', automacao:'#ff4560', bonus:'#e05500'
  }
  const categoryLabels = {
    saas:'SaaS & Sistemas', curso:'Cursos & Treinamentos',
    whitelabel:'White Label', ebook:'E-books & Materiais',
    automacao:'Automações & Fluxos', bonus:'Bônus & Extras'
  }
  const categoryIcons = {
    saas:'⚙️', curso:'🎯', whitelabel:'🏷️',
    ebook:'📗', automacao:'⚡', bonus:'🎁'
  }
  const categoryOrder = ['saas','curso','automacao','whitelabel','ebook','bonus']

  const grouped = products.reduce((acc, up) => {
    const type = up.products?.type || 'bonus'
    if (!acc[type]) acc[type] = []
    acc[type].push(up)
    return acc
  }, {})

  const sortedGroups = categoryOrder.filter(t => grouped[t])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{color:'#f0a500',fontSize:'14px',letterSpacing:'4px'}}>CARREGANDO...</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',fontFamily:'sans-serif',color:'#e8e8e8'}}>
      <nav style={{background:'#0f0f0f',borderBottom:'1px solid #1e1e1e',padding:'0 32px',height:'52px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:200}}>
        <div style={{fontSize:'20px',fontWeight:'900',letterSpacing:'4px',background:'linear-gradient(90deg,#f0a500,#e05500)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div onClick={() => setAgentOpen(!agentOpen)} style={{background:'linear-gradient(90deg,rgba(240,165,0,.12),rgba(224,85,0,.12))',border:'1px solid rgba(240,165,0,.3)',borderRadius:'6px',padding:'7px 14px',fontSize:'10px',fontWeight:'700',color:'#f0a500',display:'flex',alignItems:'center',gap:'7px',cursor:'pointer',letterSpacing:'1px'}}>
            <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#22d97a'}}></div>
            Oracle IA
          </div>
          <span style={{fontSize:'11px',color:'#444'}}>{user?.email}</span>
          <button onClick={handleLogout} style={{background:'transparent',border:'1px solid #333',borderRadius:'6px',padding:'6px 14px',fontSize:'10px',color:'#666',cursor:'pointer',letterSpacing:'1px'}}>SAIR</button>
        </div>
      </nav>
      <div style={{transition:'margin-right .35s',marginRight:agentOpen?'380px':'0'}}>
        <div style={{height:'300px',background:'linear-gradient(135deg,#0a0a0a,#1a0f00,#2a1800,#0a0a0a)',position:'relative',display:'flex',alignItems:'flex-end',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(240,165,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(240,165,0,.04) 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
          <div style={{position:'absolute',width:'220px',height:'220px',borderRadius:'50%',filter:'blur(60px)',background:'rgba(240,165,0,.18)',top:'-60px',left:'4%'}}></div>
          <div style={{position:'absolute',width:'180px',height:'180px',borderRadius:'50%',filter:'blur(60px)',background:'rgba(224,85,0,.14)',bottom:'-40px',right:'6%'}}></div>
          <div style={{position:'relative',zIndex:2,padding:'0 44px 44px'}}>
            <div style={{fontSize:'10px',letterSpacing:'4px',textTransform:'uppercase',color:'#f0a500',marginBottom:'10px',display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{width:'28px',height:'1px',background:'#f0a500',display:'inline-block'}}></span>
              Bem-vindo de volta
            </div>
            <div style={{fontSize:'58px',fontWeight:'900',lineHeight:.92,color:'#fff',textShadow:'0 4px 40px rgba(0,0,0,.9)'}}>
              ORACLE<br/>
              <span style={{background:'linear-gradient(90deg,#f0a500,#e05500)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>PRO</span>
            </div>
            <div style={{fontSize:'12px',color:'#666',marginTop:'14px'}}>{products.length} produtos liberados</div>
          </div>
          <div style={{position:'absolute',right:'44px',bottom:'44px',zIndex:2,display:'flex',gap:'32px'}}>
            <div><div style={{fontFamily:'monospace',fontSize:'28px',fontWeight:'900',color:'#f0a500'}}>{products.length}</div><div style={{fontSize:'8px',color:'#555',letterSpacing:'2px',textTransform:'uppercase',marginTop:'1px'}}>Produtos</div></div>
            <div><div style={{fontFamily:'monospace',fontSize:'28px',fontWeight:'900',color:'#f0a500'}}>{sortedGroups.length}</div><div style={{fontSize:'8px',color:'#555',letterSpacing:'2px',textTransform:'uppercase',marginTop:'1px'}}>Categorias</div></div>
          </div>
        </div>
        <div style={{padding:'32px 36px 80px'}}>
          {sortedGroups.length === 0 ? (
            <div style={{textAlign:'center',padding:'80px 20px',color:'#444'}}>
              <div style={{fontSize:'32px',marginBottom:'16px'}}>📦</div>
              <div style={{fontSize:'13px'}}>Nenhum produto liberado ainda.</div>
            </div>
          ) : (
            sortedGroups.map(type => {
              const items = grouped[type]
              const color = categoryColors[type] || '#f0a500'
              return (
                <div key={type} style={{marginBottom:'44px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px',paddingBottom:'12px',borderBottom:'1px solid #1e1e1e'}}>
                    <div style={{width:'10px',height:'10px',borderRadius:'2px',transform:'rotate(45deg)',background:color,flexShrink:0}}></div>
                    <div style={{fontSize:'20px',fontWeight:'700',letterSpacing:'2px',color:color}}>{categoryLabels[type]||type.toUpperCase()}</div>
                    <div style={{fontSize:'9px',color:'#444',border:'1px solid #1e1e1e',padding:'2px 10px',borderRadius:'20px',letterSpacing:'1px'}}>{items.length} produto{items.length!==1?'s':''}</div>
                  </div>
                  <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
                    {items.map(up => (
                      <div key={up.id}
                        onClick={() => handleProductClick(up)}
                        style={{width:'200px',borderRadius:'10px',overflow:'hidden',cursor:'pointer',background:'#111',border:'1px solid #1e1e1e',transition:'transform .2s,box-shadow .2s'}}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 18px 45px rgba(0,0,0,.7)'}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                        <div style={{width:'200px',height:'267px',position:'relative',overflow:'hidden',display:'flex',alignItems:'flex-end',padding:'12px'}}>
                          {up.products?.thumbnail_url
                            ? <img src={up.products.thumbnail_url} alt={up.products.name} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
                            : <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,#0d0d0d,#1a1a1a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'64px',opacity:.15}}>{categoryIcons[up.products?.type]||'📦'}</div>
                          }
                          <div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,rgba(0,0,0,.85) 0%,transparent 55%)'}}></div>
                          <div style={{position:'absolute',top:'10px',left:'10px',fontSize:'8px',fontWeight:'700',padding:'3px 8px',borderRadius:'4px',letterSpacing:'1px',background:`${color}22`,color:color,border:`1px solid ${color}44`,zIndex:2}}>
                            {categoryLabels[up.products?.type]?.split(' ')[0]||'Produto'}
                          </div>
                          <div style={{position:'relative',zIndex:2}}>
                            <div style={{fontSize:'11px',fontWeight:'600',lineHeight:1.3}}>{up.products?.name}</div>
                            <div style={{fontSize:'9px',color:'#aaa',marginTop:'2px'}}>{up.products?.description}</div>
                          </div>
                        </div>
                        <div style={{background:'#0f0f0f',padding:'9px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid #1a1a1a'}}>
                          <span style={{fontSize:'8px',color:'#22d97a'}}>● Ativo</span>
                          <button style={{fontSize:'9px',fontWeight:'700',padding:'4px 10px',borderRadius:'4px',border:'none',cursor:'pointer',background:color,color:(color==='#f0a500'||color==='#22d97a'||color==='#00d4ff')?'#000':'#fff',letterSpacing:'.5px'}}>
                            {up.products?.type==='curso'?'Assistir':up.products?.type==='ebook'?'Ler':'Acessar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div style={{background:'#0a0a0a',borderTop:'1px solid #181818',padding:'20px 36px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:'14px',fontWeight:'900',letterSpacing:'3px',background:'linear-gradient(90deg,#f0a500,#e05500)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
          <div style={{fontSize:'9px',color:'#333',letterSpacing:'1px'}}>© 2025 Oracle Pro · Todos os direitos reservados</div>
          <div style={{display:'flex',gap:'16px'}}>
            <span style={{fontSize:'9px',color:'#444',cursor:'pointer'}}>Termos de Uso</span>
            <span style={{fontSize:'9px',color:'#444',cursor:'pointer'}}>Privacidade</span>
            <span style={{fontSize:'9px',color:'#444',cursor:'pointer'}}>suporte@oraclepro.com</span>
          </div>
        </div>
      </div>
      {!agentOpen && (
        <div style={{position:'fixed',bottom:'28px',right:'28px',zIndex:300,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'12px'}}>
          <div style={{background:'#161616',border:'1px solid rgba(240,165,0,.3)',borderRadius:'12px 12px 0 12px',padding:'12px 16px',fontSize:'11px',color:'#ccc',maxWidth:'220px',lineHeight:1.6}}>
            👋 Olá! Sou a <strong style={{color:'#f0a500'}}>Oracle IA</strong>.<br/>Tem dúvidas sobre seus produtos?
          </div>
          <div style={{position:'relative'}}>
            <div onClick={() => setAgentOpen(true)} style={{width:'56px',height:'56px',borderRadius:'50%',background:'linear-gradient(135deg,#f0a500,#e05500)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 6px 24px rgba(240,165,0,.4)'}}>
              <svg width="24" height="24" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{position:'absolute',top:'-2px',right:'-2px',width:'16px',height:'16px',borderRadius:'50%',background:'#22d97a',border:'2px solid #0a0a0a',fontSize:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:'#000'}}>IA</div>
          </div>
        </div>
      )}
      {agentOpen && (
        <div style={{position:'fixed',top:0,right:0,width:'380px',height:'100vh',background:'#0d0d0d',borderLeft:'1px solid #1e1e1e',zIndex:250,display:'flex',flexDirection:'column',boxShadow:'-8px 0 40px rgba(0,0,0,.6)'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #1e1e1e',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#111',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,#f0a500,#e05500)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🤖</div>
              <div>
                <div style={{fontSize:'13px',fontWeight:'700'}}>Oracle IA</div>
                <div style={{fontSize:'10px',color:'#22d97a',display:'flex',alignItems:'center',gap:'5px'}}>
                  <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#22d97a',display:'inline-block'}}></span>
                  Online agora
                </div>
              </div>
            </div>
            <div onClick={() => setAgentOpen(false)} style={{width:'28px',height:'28px',borderRadius:'6px',background:'#1a1a1a',border:'1px solid #222',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'14px',color:'#666'}}>✕</div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {messages.map((msg, i) => (
              <div key={i} style={{display:'flex',flexDirection:'column',maxWidth:'88%',alignSelf:msg.type==='user'?'flex-end':'flex-start',alignItems:msg.type==='user'?'flex-end':'flex-start'}}>
                <div style={{padding:'10px 14px',borderRadius:msg.type==='user'?'12px 4px 12px 12px':'4px 12px 12px 12px',fontSize:'12px',lineHeight:1.55,background:msg.type==='user'?'linear-gradient(135deg,rgba(240,165,0,.2),rgba(224,85,0,.2))':'#181818',border:msg.type==='user'?'1px solid rgba(240,165,0,.25)':'1px solid #222',color:'#e8e8e8'}}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 14px 16px',borderTop:'1px solid #1e1e1e',background:'#0f0f0f',flexShrink:0}}>
            <div style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}}
                placeholder="Digite sua dúvida..." rows={1}
                style={{flex:1,background:'#161616',border:'1px solid #1e1e1e',borderRadius:'8px',padding:'10px 12px',fontSize:'12px',color:'#e8e8e8',resize:'none',fontFamily:'sans-serif',outline:'none',minHeight:'42px',maxHeight:'100px'}}/>
              <button onClick={sendMessage} style={{width:'40px',height:'40px',borderRadius:'8px',background:'linear-gradient(135deg,#f0a500,#e05500)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                <svg width="16" height="16" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div style={{fontSize:'9px',color:'#2a2a2a',marginTop:'7px',textAlign:'center'}}>🔒 Conversa criptografada · Oracle Pro</div>
          </div>
        </div>
      )}
    </div>
  )
}