'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState({text:'',type:'success'})
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)
  const router = useRouter()

  const emptyForm = {name:'',description:'',type:'curso',access_url:'',thumbnail_url:'',is_active:true,sort_order:0}
  const [form, setForm] = useState(emptyForm)

  const s = {
    bg:'#0a0a0a',nav:'#0f0f0f',border:'#1e1e1e',
    card:'#111',text:'#e8e8e8',muted:'#555',
    accent:'#f0a500',accent2:'#e05500',
    green:'#22d97a',red:'#ff4560',blue:'#00d4ff'
  }

  const typeOptions = [
    {value:'curso',label:'🎯 Curso'},
    {value:'saas',label:'⚙️ SaaS'},
    {value:'ebook',label:'📗 E-book'},
    {value:'whitelabel',label:'🏷️ White Label'},
    {value:'automacao',label:'⚡ Automação'},
    {value:'bonus',label:'🎁 Bônus'},
  ]

  const typeColors = {
    saas:'#00d4ff',curso:'#f0a500',whitelabel:'#b06aff',
    ebook:'#22d97a',automacao:'#ff4560',bonus:'#e05500'
  }

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') { router.push('/dashboard'); return }
    setUser(user)
    const { data: prods } = await supabase.from('products').select('*').order('sort_order')
    const { data: mems } = await supabase.from('profiles').select('*').order('created_at',{ascending:false})
    const { data: access } = await supabase.from('user_products').select('*')
    setProducts(prods||[])
    setMembers((mems||[]).map(m=>({...m,access:(access||[]).filter(a=>a.user_id===m.id&&a.status==='active')})))
    setLoading(false)
  }

  function showMsg(text,type='success') {
    setMsg({text,type})
    setTimeout(()=>setMsg({text:'',type:'success'}),3000)
  }

  function openNew() {
    setForm(emptyForm)
    setPreview(null)
    setEditProduct(null)
    setShowForm(true)
  }

  function openEdit(prod) {
    setForm({
      name:prod.name||'',description:prod.description||'',
      type:prod.type||'curso',access_url:prod.access_url||'',
      thumbnail_url:prod.thumbnail_url||'',is_active:prod.is_active,
      sort_order:prod.sort_order||0
    })
    setPreview(prod.thumbnail_url||null)
    setEditProduct(prod)
    setShowForm(true)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5*1024*1024) { showMsg('Imagem muito grande! Máximo 5MB.','error'); return }
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(fileName, file, {upsert:true})
    if (error) { showMsg('Erro ao fazer upload!','error'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName)
    setForm(prev=>({...prev,thumbnail_url:urlData.publicUrl}))
    setPreview(urlData.publicUrl)
    setUploading(false)
    showMsg('Imagem enviada!')
  }

  async function handleSave() {
    if (!form.name.trim()) { showMsg('Nome é obrigatório!','error'); return }
    const supabase = createClient()
    if (editProduct) {
      const { error } = await supabase.from('products').update({
        name:form.name,description:form.description,type:form.type,
        access_url:form.access_url,thumbnail_url:form.thumbnail_url,
        is_active:form.is_active,sort_order:parseInt(form.sort_order)||0
      }).eq('id',editProduct.id)
      if (error) { showMsg('Erro: '+error.message,'error'); return }
      showMsg('Produto atualizado!')
    } else {
      const { error } = await supabase.from('products').insert({
        name:form.name,description:form.description,type:form.type,
        access_url:form.access_url,thumbnail_url:form.thumbnail_url,
        is_active:form.is_active,sort_order:parseInt(form.sort_order)||0
      })
      if (error) { showMsg('Erro: '+error.message,'error'); return }
      showMsg('Produto criado!')
    }
    setShowForm(false)
    loadAll()
  }

  async function handleDelete(id) {
    if (!confirm('Deletar este produto?')) return
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id',id)
    if (error) { showMsg('Erro: '+error.message,'error'); return }
    showMsg('Produto deletado!')
    loadAll()
  }

  async function toggleActive(prod) {
    const supabase = createClient()
    await supabase.from('products').update({is_active:!prod.is_active}).eq('id',prod.id)
    loadAll()
  }

  async function grantAccess(userId,productId) {
    const supabase = createClient()
    await supabase.from('user_products').upsert({user_id:userId,product_id:productId,status:'active',source:'admin'},{onConflict:'user_id,product_id'})
    showMsg('Acesso liberado!')
    loadAll()
  }

  async function revokeAccess(userId,productId) {
    const supabase = createClient()
    await supabase.from('user_products').update({status:'revoked'}).eq('user_id',userId).eq('product_id',productId)
    showMsg('Acesso revogado!')
    loadAll()
  }

  async function toggleStatus(memberId,currentStatus) {
    const supabase = createClient()
    await supabase.from('profiles').update({status:currentStatus==='active'?'suspended':'active'}).eq('id',memberId)
    showMsg(currentStatus==='active'?'Conta suspensa!':'Conta reativada!')
    loadAll()
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{color:s.accent,fontSize:'14px',letterSpacing:'4px'}}>CARREGANDO...</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif',color:s.text}}>

      <nav style={{background:s.nav,borderBottom:`1px solid ${s.border}`,padding:'0 32px',height:'52px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'4px',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
          <div style={{background:'rgba(255,69,96,.15)',border:'1px solid rgba(255,69,96,.3)',borderRadius:'4px',padding:'2px 8px',fontSize:'9px',fontWeight:'700',color:s.red,letterSpacing:'1px'}}>ADMIN</div>
        </div>
        <button onClick={()=>router.push('/dashboard')} style={{background:'transparent',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'6px 14px',fontSize:'10px',color:s.muted,cursor:'pointer',letterSpacing:'1px'}}>← ÁREA DE MEMBROS</button>
      </nav>

      <div style={{padding:'28px 36px'}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'28px'}}>
          {[
            {label:'Total Membros',value:members.length,color:s.blue},
            {label:'Membros Ativos',value:members.filter(m=>m.status==='active').length,color:s.green},
            {label:'Suspensos',value:members.filter(m=>m.status==='suspended').length,color:s.red},
            {label:'Total Produtos',value:products.length,color:s.accent},
          ].map((stat,i)=>(
            <div key={i} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px 20px'}}>
              <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>{stat.label}</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:stat.color}}>{stat.value}</div>
            </div>
          ))}
        </div>

        {msg.text && (
          <div style={{background:msg.type==='error'?'rgba(255,69,96,.1)':'rgba(34,217,122,.1)',border:`1px solid ${msg.type==='error'?'rgba(255,69,96,.3)':'rgba(34,217,122,.3)'}`,borderRadius:'6px',padding:'10px 16px',fontSize:'12px',color:msg.type==='error'?s.red:s.green,marginBottom:'16px'}}>
            {msg.text}
          </div>
        )}

        <div style={{display:'flex',borderBottom:`1px solid ${s.border}`,marginBottom:'24px'}}>
          {[['products','📦 Produtos'],['members','👥 Membros']].map(([id,label])=>(
            <div key={id} onClick={()=>setTab(id)}
              style={{padding:'10px 20px',fontSize:'12px',cursor:'pointer',borderBottom:`2px solid ${tab===id?s.accent:'transparent'}`,color:tab===id?s.accent:s.muted,transition:'all .15s'}}>
              {label}
            </div>
          ))}
        </div>

        {/* PRODUTOS */}
        {tab==='products' && (
          <div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'20px'}}>
              <button onClick={openNew} style={{background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',border:'none',borderRadius:'6px',padding:'10px 22px',fontSize:'11px',fontWeight:'700',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase'}}>
                + Novo Produto
              </button>
            </div>
            {/* GRID CARDS — proporção poster 200x267 igual ao dashboard */}
            <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
              {products.map(prod=>(
                <div key={prod.id} style={{width:'200px',borderRadius:'10px',overflow:'hidden',background:s.card,border:`1px solid ${s.border}`}}>
                  {/* IMAGEM 200x267 proporção poster */}
                  <div style={{width:'200px',height:'267px',position:'relative',overflow:'hidden',background:'linear-gradient(160deg,#0d0d0d,#1a1a1a)',display:'flex',alignItems:'flex-end',padding:'12px'}}>
                    {prod.thumbnail_url ? (
                      <img src={prod.thumbnail_url} alt={prod.name} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
                    ) : (
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'64px',opacity:.2}}>
                        {prod.type==='saas'?'⚙️':prod.type==='curso'?'🎯':prod.type==='ebook'?'📗':prod.type==='whitelabel'?'🏷️':prod.type==='automacao'?'⚡':'🎁'}
                      </div>
                    )}
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,rgba(0,0,0,.85) 0%,transparent 55%)'}}></div>
                    <div style={{position:'absolute',top:'10px',left:'10px',fontSize:'8px',fontWeight:'700',padding:'3px 8px',borderRadius:'4px',background:`${typeColors[prod.type]||s.accent}22`,color:typeColors[prod.type]||s.accent,border:`1px solid ${typeColors[prod.type]||s.accent}44`,zIndex:2}}>
                      {prod.type?.toUpperCase()}
                    </div>
                    <div style={{position:'absolute',top:'10px',right:'10px',fontSize:'8px',fontWeight:'700',padding:'3px 8px',borderRadius:'4px',background:prod.is_active?'rgba(34,217,122,.2)':'rgba(255,69,96,.2)',color:prod.is_active?s.green:s.red,zIndex:2}}>
                      {prod.is_active?'ATIVO':'INATIVO'}
                    </div>
                    <div style={{position:'relative',zIndex:2}}>
                      <div style={{fontSize:'11px',fontWeight:'600',lineHeight:1.3,color:'#fff'}}>{prod.name}</div>
                      <div style={{fontSize:'9px',color:'#888',marginTop:'2px'}}>{prod.description}</div>
                    </div>
                  </div>
                  {/* AÇÕES */}
                  <div style={{padding:'8px 10px',background:'#0f0f0f',borderTop:`1px solid ${s.border}`,display:'flex',gap:'6px'}}>
                    <button onClick={()=>openEdit(prod)} style={{flex:1,background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'6px',fontSize:'9px',color:s.text,cursor:'pointer',fontFamily:'sans-serif',fontWeight:'600'}}>✏️ Editar</button>
                    <button onClick={()=>toggleActive(prod)} style={{flex:1,background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'6px',fontSize:'9px',color:prod.is_active?s.red:s.green,cursor:'pointer',fontFamily:'sans-serif',fontWeight:'600'}}>
                      {prod.is_active?'⏸':'▶'}
                    </button>
                    <button onClick={()=>handleDelete(prod.id)} style={{background:'rgba(255,69,96,.1)',border:'1px solid rgba(255,69,96,.3)',borderRadius:'5px',padding:'6px 8px',fontSize:'11px',color:s.red,cursor:'pointer'}}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEMBROS */}
        {tab==='members' && (
          <div>
            <input type="text" placeholder="🔍  Buscar por email ou nome..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{width:'100%',background:'#161616',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 14px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif',marginBottom:'16px'}}/>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {members.filter(m=>m.email?.toLowerCase().includes(search.toLowerCase())||m.full_name?.toLowerCase().includes(search.toLowerCase())).map(member=>(
                <div key={member.id} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px 20px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'50%',background:`linear-gradient(135deg,${s.accent},${s.accent2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:'#000',flexShrink:0}}>
                        {member.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:'13px',fontWeight:'600'}}>{member.full_name||member.email}</div>
                        <div style={{fontSize:'10px',color:s.muted,marginTop:'2px'}}>{member.email}</div>
                        <div style={{display:'flex',gap:'6px',marginTop:'4px',flexWrap:'wrap'}}>
                          <span style={{fontSize:'8px',padding:'2px 6px',borderRadius:'4px',background:member.role==='admin'?'rgba(255,69,96,.15)':'rgba(0,212,255,.15)',color:member.role==='admin'?s.red:s.blue,border:`1px solid ${member.role==='admin'?'rgba(255,69,96,.3)':'rgba(0,212,255,.3)'}`}}>{member.role?.toUpperCase()}</span>
                          <span style={{fontSize:'8px',padding:'2px 6px',borderRadius:'4px',background:member.status==='active'?'rgba(34,217,122,.15)':'rgba(255,69,96,.15)',color:member.status==='active'?s.green:s.red,border:`1px solid ${member.status==='active'?'rgba(34,217,122,.3)':'rgba(255,69,96,.3)'}`}}>{member.status?.toUpperCase()}</span>
                          <span style={{fontSize:'8px',color:s.muted}}>{member.access?.length||0} produtos</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={()=>toggleStatus(member.id,member.status)}
                      style={{fontSize:'9px',fontWeight:'700',padding:'5px 12px',borderRadius:'5px',border:'none',cursor:'pointer',background:member.status==='active'?'rgba(255,69,96,.2)':'rgba(34,217,122,.2)',color:member.status==='active'?s.red:s.green,letterSpacing:'.5px'}}>
                      {member.status==='active'?'SUSPENDER':'REATIVAR'}
                    </button>
                  </div>
                  <div style={{marginTop:'14px',paddingTop:'12px',borderTop:`1px solid ${s.border}`}}>
                    <div style={{fontSize:'10px',color:s.muted,marginBottom:'8px',letterSpacing:'1px',textTransform:'uppercase'}}>Produtos — clique para liberar ou revogar</div>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      {products.map(prod=>{
                        const hasAccess=member.access?.some(a=>a.product_id===prod.id)
                        return (
                          <div key={prod.id} onClick={()=>hasAccess?revokeAccess(member.id,prod.id):grantAccess(member.id,prod.id)}
                            style={{fontSize:'9px',fontWeight:'600',padding:'4px 10px',borderRadius:'5px',cursor:'pointer',transition:'all .15s',background:hasAccess?'rgba(34,217,122,.15)':'rgba(255,255,255,.05)',color:hasAccess?s.green:s.muted,border:`1px solid ${hasAccess?'rgba(34,217,122,.3)':'rgba(255,255,255,.1)'}`}}>
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
      </div>

      {/* MODAL */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#111',border:`1px solid ${s.border}`,borderRadius:'14px',width:'100%',maxWidth:'520px',maxHeight:'90vh',overflowY:'auto',scrollbarWidth:'thin'}}>
            <div style={{padding:'20px 24px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'#111',zIndex:2}}>
              <div style={{fontSize:'15px',fontWeight:'700'}}>{editProduct?'✏️ Editar Produto':'➕ Novo Produto'}</div>
              <div onClick={()=>setShowForm(false)} style={{cursor:'pointer',fontSize:'16px',color:s.muted,width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'6px',background:'#1a1a1a'}}>✕</div>
            </div>
            <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:'16px'}}>

              {/* UPLOAD CAPA */}
              <div>
                <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Capa do Produto <span style={{color:'#444'}}>(300x400px recomendado)</span></div>
                <div onClick={()=>fileRef.current?.click()}
                  style={{width:'100%',height:'200px',border:`2px dashed ${s.border}`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',position:'relative',background:'#0d0d0d'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#333'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=s.border}>
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      <div style={{position:'absolute',bottom:'8px',right:'8px',background:'rgba(0,0,0,.7)',borderRadius:'4px',padding:'4px 8px',fontSize:'9px',color:'#fff'}}>Clique para trocar</div>
                    </>
                  ) : (
                    <div style={{textAlign:'center',color:s.muted}}>
                      <div style={{fontSize:'36px',marginBottom:'10px'}}>🖼️</div>
                      <div style={{fontSize:'12px',fontWeight:'600'}}>{uploading?'Enviando...':'Clique para fazer upload'}</div>
                      <div style={{fontSize:'10px',marginTop:'6px',color:'#444'}}>JPG, PNG · máx 5MB · 300x400px ideal</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}}/>
              </div>

              {/* NOME */}
              <div>
                <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Nome *</div>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Tráfego Pago 2025"
                  style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'10px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
              </div>

              {/* DESCRIÇÃO */}
              <div>
                <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Descrição</div>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Breve descrição..." rows={2}
                  style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'10px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif',resize:'none'}}/>
              </div>

              {/* TIPO */}
              <div>
                <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Tipo</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  {typeOptions.map(opt=>(
                    <div key={opt.value} onClick={()=>setForm(p=>({...p,type:opt.value}))}
                      style={{padding:'10px 8px',borderRadius:'8px',border:`1px solid ${form.type===opt.value?typeColors[opt.value]||s.accent:s.border}`,background:form.type===opt.value?`${typeColors[opt.value]||s.accent}15`:'#0d0d0d',cursor:'pointer',textAlign:'center',fontSize:'11px',color:form.type===opt.value?typeColors[opt.value]||s.accent:s.muted,fontWeight:form.type===opt.value?'700':'400'}}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* URL */}
              <div>
                <div style={{fontSize:'11px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>
                  {form.type==='curso'?'URL do Vídeo':form.type==='ebook'?'URL do PDF':'URL do Sistema'}
                </div>
                <input value={form.access_url} onChange={e=>setForm(p=>({...p,access_url:e.target.value}))}
                  placeholder={form.type==='saas'||form.type==='whitelabel'||form.type==='automacao'?'https://seu-sistema.com':form.type==='curso'?'https://youtube.com/embed/ID':'https://...'}
                  style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'10px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
                <div style={{fontSize:'9px',color:'#444',marginTop:'4px'}}>
                  {(form.type==='saas'||form.type==='whitelabel'||form.type==='automacao')&&'↗ Abrirá em nova aba'}
                  {form.type==='curso'&&'📺 Use: youtube.com/embed/ID_DO_VIDEO'}
                  {form.type==='ebook'&&'📗 Abrirá leitor inline'}
                </div>
              </div>

              {/* ATIVO */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'12px 14px'}}>
                <div>
                  <div style={{fontSize:'12px',fontWeight:'600'}}>Produto ativo</div>
                  <div style={{fontSize:'10px',color:s.muted,marginTop:'2px'}}>Visível para os alunos</div>
                </div>
                <div onClick={()=>setForm(p=>({...p,is_active:!p.is_active}))}
                  style={{width:'44px',height:'24px',borderRadius:'12px',background:form.is_active?s.green:'#333',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                  <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#fff',position:'absolute',top:'3px',left:form.is_active?'23px':'3px',transition:'left .2s'}}></div>
                </div>
              </div>

              {/* BOTÕES */}
              <div style={{display:'flex',gap:'10px',paddingTop:'4px'}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'7px',padding:'11px',fontSize:'12px',color:s.muted,cursor:'pointer',fontFamily:'sans-serif'}}>Cancelar</button>
                <button onClick={handleSave} disabled={uploading}
                  style={{flex:2,background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',border:'none',borderRadius:'7px',padding:'11px',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'sans-serif',letterSpacing:'.5px'}}>
                  {uploading?'Aguarde...':editProduct?'Salvar Alterações':'Criar Produto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}