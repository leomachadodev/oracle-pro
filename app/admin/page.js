'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('members')
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setUser(user)

      const { data: allMembers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .order('sort_order')

      const { data: allAccess } = await supabase
        .from('user_products')
        .select('*')

      const membersWithAccess = (allMembers || []).map(m => ({
        ...m,
        access: (allAccess || []).filter(a => a.user_id === m.id && a.status === 'active')
      }))

      setMembers(membersWithAccess)
      setProducts(allProducts || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function grantAccess(userId, productId) {
    const supabase = createClient()
    const { error } = await supabase.from('user_products').upsert({
      user_id: userId,
      product_id: productId,
      status: 'active',
      source: 'admin'
    }, { onConflict: 'user_id,product_id' })
    if (!error) {
      setMsg('✅ Acesso liberado!')
      setTimeout(() => setMsg(''), 3000)
      const { data: allAccess } = await supabase.from('user_products').select('*')
      setMembers(prev => prev.map(m => ({
        ...m,
        access: (allAccess || []).filter(a => a.user_id === m.id && a.status === 'active')
      })))
    }
  }

  async function revokeAccess(userId, productId) {
    const supabase = createClient()
    await supabase.from('user_products')
      .update({ status: 'revoked' })
      .eq('user_id', userId)
      .eq('product_id', productId)
    setMsg('🚫 Acesso revogado!')
    setTimeout(() => setMsg(''), 3000)
    const { data: allAccess } = await supabase.from('user_products').select('*')
    setMembers(prev => prev.map(m => ({
      ...m,
      access: (allAccess || []).filter(a => a.user_id === m.id && a.status === 'active')
    })))
  }

  async function toggleStatus(memberId, currentStatus) {
    const supabase = createClient()
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', memberId)
    setMsg(newStatus === 'suspended' ? '🔒 Conta suspensa!' : '✅ Conta reativada!')
    setTimeout(() => setMsg(''), 3000)
    setMembers(prev => prev.map(m => m.id === memberId ? {...m, status: newStatus} : m))
  }

  const filtered = members.filter(m =>
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const s = {
    bg: '#0a0a0a', nav: '#0f0f0f', border: '#1e1e1e',
    card: '#111', text: '#e8e8e8', muted: '#555',
    accent: '#f0a500', accent2: '#e05500',
    green: '#22d97a', red: '#ff4560', blue: '#00d4ff'
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{color:s.accent,fontSize:'14px',letterSpacing:'4px'}}>CARREGANDO...</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif',color:s.text}}>

      {/* NAV */}
      <nav style={{background:s.nav,borderBottom:`1px solid ${s.border}`,padding:'0 32px',height:'52px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'4px',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
          <div style={{background:'rgba(255,69,96,.15)',border:'1px solid rgba(255,69,96,.3)',borderRadius:'4px',padding:'2px 8px',fontSize:'9px',fontWeight:'700',color:'#ff4560',letterSpacing:'1px'}}>ADMIN</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <button onClick={() => router.push('/dashboard')} style={{background:'transparent',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'6px 14px',fontSize:'10px',color:s.muted,cursor:'pointer',letterSpacing:'1px'}}>← ÁREA DE MEMBROS</button>
        </div>
      </nav>

      <div style={{padding:'32px 36px'}}>

        {/* STATS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'32px'}}>
          {[
            {label:'Total de Membros', value: members.length, color: s.blue},
            {label:'Membros Ativos', value: members.filter(m=>m.status==='active').length, color: s.green},
            {label:'Suspensos', value: members.filter(m=>m.status==='suspended').length, color: s.red},
            {label:'Total de Produtos', value: products.length, color: s.accent},
          ].map((stat,i) => (
            <div key={i} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px 20px'}}>
              <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>{stat.label}</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:stat.color}}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* MSG */}
        {msg && (
          <div style={{background:'rgba(34,217,122,.1)',border:'1px solid rgba(34,217,122,.3)',borderRadius:'6px',padding:'10px 16px',fontSize:'12px',color:s.green,marginBottom:'16px'}}>
            {msg}
          </div>
        )}

        {/* TABS */}
        <div style={{display:'flex',borderBottom:`1px solid ${s.border}`,marginBottom:'24px'}}>
          {[['members','👥 Membros'],['products','📦 Produtos']].map(([id,label]) => (
            <div key={id} onClick={() => setTab(id)}
              style={{padding:'10px 20px',fontSize:'12px',cursor:'pointer',borderBottom:`2px solid ${tab===id?s.accent:'transparent'}`,color:tab===id?s.accent:s.muted,transition:'all .15s'}}>
              {label}
            </div>
          ))}
        </div>

        {/* MEMBROS */}
        {tab === 'members' && (
          <div>
            <div style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
              <input
                type="text"
                placeholder="🔍  Buscar por email ou nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{flex:1,background:'#161616',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 14px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}
              />
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {filtered.map(member => (
                <div key={member.id} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px 20px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'50%',background:`linear-gradient(135deg,${s.accent},${s.accent2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:'#000',flexShrink:0}}>
                        {member.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:'13px',fontWeight:'600'}}>{member.full_name || member.email}</div>
                        <div style={{fontSize:'10px',color:s.muted,marginTop:'2px'}}>{member.email}</div>
                        <div style={{display:'flex',gap:'6px',marginTop:'4px',flexWrap:'wrap'}}>
                          <span style={{fontSize:'8px',padding:'2px 6px',borderRadius:'4px',background:member.role==='admin'?'rgba(255,69,96,.15)':'rgba(0,212,255,.15)',color:member.role==='admin'?s.red:s.blue,border:`1px solid ${member.role==='admin'?'rgba(255,69,96,.3)':'rgba(0,212,255,.3)'}`}}>{member.role?.toUpperCase()}</span>
                          <span style={{fontSize:'8px',padding:'2px 6px',borderRadius:'4px',background:member.status==='active'?'rgba(34,217,122,.15)':'rgba(255,69,96,.15)',color:member.status==='active'?s.green:s.red,border:`1px solid ${member.status==='active'?'rgba(34,217,122,.3)':'rgba(255,69,96,.3)'}`}}>{member.status?.toUpperCase()}</span>
                          <span style={{fontSize:'8px',color:s.muted}}>{member.access?.length || 0} produtos</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                      <button onClick={() => toggleStatus(member.id, member.status)}
                        style={{fontSize:'9px',fontWeight:'700',padding:'5px 12px',borderRadius:'5px',border:'none',cursor:'pointer',background:member.status==='active'?'rgba(255,69,96,.2)':'rgba(34,217,122,.2)',color:member.status==='active'?s.red:s.green,letterSpacing:'.5px'}}>
                        {member.status==='active'?'SUSPENDER':'REATIVAR'}
                      </button>
                    </div>
                  </div>

                  {/* PRODUTOS DO MEMBRO */}
                  <div style={{marginTop:'14px',paddingTop:'12px',borderTop:`1px solid ${s.border}`}}>
                    <div style={{fontSize:'10px',color:s.muted,marginBottom:'8px',letterSpacing:'1px',textTransform:'uppercase'}}>Produtos liberados</div>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      {products.map(prod => {
                        const hasAccess = member.access?.some(a => a.product_id === prod.id)
                        return (
                          <div key={prod.id}
                            onClick={() => hasAccess ? revokeAccess(member.id, prod.id) : grantAccess(member.id, prod.id)}
                            title={hasAccess ? 'Clique para revogar' : 'Clique para liberar'}
                            style={{fontSize:'9px',fontWeight:'600',padding:'4px 10px',borderRadius:'5px',cursor:'pointer',transition:'all .15s',
                              background:hasAccess?'rgba(34,217,122,.15)':'rgba(255,255,255,.05)',
                              color:hasAccess?s.green:s.muted,
                              border:`1px solid ${hasAccess?'rgba(34,217,122,.3)':'rgba(255,255,255,.1)'}`}}>
                            {hasAccess?'✓':'+' } {prod.name}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUTOS */}
        {tab === 'products' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'12px'}}>
            {products.map(prod => (
              <div key={prod.id} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px 20px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                  <div style={{fontSize:'24px'}}>{prod.type==='saas'?'⚙️':prod.type==='curso'?'🎯':prod.type==='ebook'?'📗':prod.type==='whitelabel'?'🏷️':prod.type==='automacao'?'⚡':'🎁'}</div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:'600'}}>{prod.name}</div>
                    <div style={{fontSize:'9px',color:s.muted,marginTop:'2px'}}>{prod.description}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'8px',padding:'2px 8px',borderRadius:'4px',background:'rgba(0,212,255,.15)',color:s.blue,border:'1px solid rgba(0,212,255,.3)',letterSpacing:'1px'}}>{prod.type?.toUpperCase()}</span>
                  <span style={{fontSize:'9px',color:prod.is_active?s.green:s.red}}>{prod.is_active?'● Ativo':'● Inativo'}</span>
                </div>
                {prod.access_url && (
                  <div style={{marginTop:'8px',fontSize:'9px',color:s.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{prod.access_url}</div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}