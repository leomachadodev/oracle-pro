'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function WhiteLabel() {
  const [user, setUser] = useState(null)
  const [product, setProduct] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState('inicio')
  const [msg, setMsg] = useState({text:'',type:'success'})
  const [copied, setCopied] = useState(false)
  const logoRef = useRef(null)
  const router = useRouter()

  const emptyConfig = {
    business_name:'', business_logo_url:'', primary_color:'#f0a500',
    client_name:'', client_email:'', client_business:''
  }
  const [form, setForm] = useState(emptyConfig)

  const s = {
    bg:'#0a0a0a', nav:'#0f0f0f', border:'#1e1e1e',
    card:'#111', text:'#e8e8e8', muted:'#555',
    accent:'#f0a500', accent2:'#e05500', green:'#22d97a'
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const productId = localStorage.getItem('wl_product_id')
      if (!productId) { router.push('/dashboard'); return }

      const { data: prod } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      setProduct(prod)

      const { data: cfg } = await supabase
        .from('whitelabel_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

      if (cfg) {
        setConfig(cfg)
        setForm({
          business_name: cfg.business_name||'',
          business_logo_url: cfg.business_logo_url||'',
          primary_color: cfg.primary_color||'#f0a500',
          client_name: cfg.client_name||'',
          client_email: cfg.client_email||'',
          client_business: cfg.client_business||''
        })
      } else {
        const { data: newCfg } = await supabase
          .from('whitelabel_configs')
          .insert({ user_id: user.id, product_id: productId })
          .select()
          .single()
        setConfig(newCfg)
      }
      setLoading(false)
    }
    load()
  }, [])

  function showMsg(text, type='success') {
    setMsg({text, type})
    setTimeout(() => setMsg({text:'',type:'success'}), 3000)
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('whitelabel').upload(fileName, file, {upsert:true})
    if (error) { showMsg('Erro no upload!','error'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('whitelabel').getPublicUrl(fileName)
    setForm(p => ({...p, business_logo_url: urlData.publicUrl}))
    setUploading(false)
    showMsg('Logo enviada!')
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('whitelabel_configs')
      .update({
        business_name: form.business_name,
        business_logo_url: form.business_logo_url,
        primary_color: form.primary_color,
        client_name: form.client_name,
        client_email: form.client_email,
        client_business: form.client_business,
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id)
    setSaving(false)
    if (error) { showMsg('Erro ao salvar!','error'); return }
    showMsg('Configurações salvas!')
    const { data: updated } = await supabase.from('whitelabel_configs').select('*').eq('id', config.id).single()
    setConfig(updated)
  }

  async function handleDeliver() {
    const supabase = createClient()
    await supabase.from('whitelabel_configs').update({status:'delivered'}).eq('id', config.id)
    showMsg('Produto marcado como entregue!')
    const { data: updated } = await supabase.from('whitelabel_configs').select('*').eq('id', config.id).single()
    setConfig(updated)
  }

  function copyDeliveryLink() {
    const link = `${window.location.origin}/entrega/${config?.delivery_token}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const modules = product?.metadata?.modules || []
  const videoUrl = product?.access_url || ''
  const embedUrl = videoUrl.includes('youtube.com/embed') ? videoUrl :
    videoUrl.includes('youtu.be/') ? videoUrl.replace('youtu.be/','youtube.com/embed/') :
    videoUrl.includes('youtube.com/watch?v=') ? videoUrl.replace('watch?v=','embed/') : videoUrl

  if (loading) return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{color:s.accent,fontSize:'14px',letterSpacing:'4px'}}>CARREGANDO...</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif',color:s.text}}>

      <nav style={{background:s.nav,borderBottom:`1px solid ${s.border}`,padding:'0 20px',height:'50px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div onClick={() => router.push('/dashboard')} style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'11px',color:s.muted,cursor:'pointer'}}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            Voltar
          </div>
          <div style={{width:'1px',height:'14px',background:s.border}}></div>
          <div style={{fontSize:'11px',color:'#666'}}>{product?.name}</div>
        </div>
        <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'4px',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{fontSize:'9px',padding:'3px 10px',borderRadius:'4px',background:config?.status==='delivered'?'rgba(34,217,122,.15)':'rgba(240,165,0,.15)',color:config?.status==='delivered'?s.green:s.accent,border:`1px solid ${config?.status==='delivered'?'rgba(34,217,122,.3)':'rgba(240,165,0,.3)'}`}}>
            {config?.status==='delivered'?'✓ ENTREGUE':'RASCUNHO'}
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'32px 24px'}}>

        {msg.text && (
          <div style={{background:msg.type==='error'?'rgba(255,69,96,.1)':'rgba(34,217,122,.1)',border:`1px solid ${msg.type==='error'?'rgba(255,69,96,.3)':'rgba(34,217,122,.3)'}`,borderRadius:'6px',padding:'10px 16px',fontSize:'12px',color:msg.type==='error'?'#ff4560':s.green,marginBottom:'16px'}}>
            {msg.text}
          </div>
        )}

        {/* TABS */}
        <div style={{display:'flex',borderBottom:`1px solid ${s.border}`,marginBottom:'28px'}}>
          {[
            ['inicio','📺 Início'],
            ['docs','📋 Documentação'],
            ['personalizar','🎨 Personalizar'],
            ['entregar','🔗 Entregar']
          ].map(([id,label]) => (
            <div key={id} onClick={() => setTab(id)}
              style={{padding:'11px 18px',fontSize:'12px',cursor:'pointer',borderBottom:`2px solid ${tab===id?s.accent:'transparent'}`,color:tab===id?s.accent:s.muted,transition:'all .15s'}}>
              {label}
            </div>
          ))}
        </div>

        {/* ABA INÍCIO */}
        {tab === 'inicio' && (
          <div>
            <div style={{marginBottom:'24px'}}>
              <div style={{fontSize:'22px',fontWeight:'700',marginBottom:'6px'}}>{product?.name}</div>
              <div style={{fontSize:'13px',color:s.muted}}>{product?.description}</div>
            </div>

            {embedUrl ? (
              <div style={{width:'100%',aspectRatio:'16/9',borderRadius:'12px',overflow:'hidden',marginBottom:'24px',background:'#000'}}>
                <iframe src={embedUrl} style={{width:'100%',height:'100%',border:'none'}} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
              </div>
            ) : (
              <div style={{width:'100%',aspectRatio:'16/9',borderRadius:'12px',background:'#111',border:`1px solid ${s.border}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px',color:s.muted,fontSize:'13px'}}>
                📺 Vídeo de boas-vindas não configurado ainda
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
              {[
                {icon:'📋',label:'Documentação',desc:'Tutoriais e APIs',action:()=>setTab('docs')},
                {icon:'🎨',label:'Personalizar',desc:'Logo e dados do cliente',action:()=>setTab('personalizar')},
                {icon:'🔗',label:'Entregar',desc:'Link para o cliente',action:()=>setTab('entregar')},
                {icon:'📜',label:'Certificado',desc:'ID: '+config?.delivery_token?.substring(0,8)+'...',action:()=>setTab('entregar')},
              ].map((item,i) => (
                <div key={i} onClick={item.action}
                  style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px',cursor:'pointer',transition:'border-color .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#333'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=s.border}>
                  <div style={{fontSize:'24px',marginBottom:'8px'}}>{item.icon}</div>
                  <div style={{fontSize:'12px',fontWeight:'600',marginBottom:'3px'}}>{item.label}</div>
                  <div style={{fontSize:'10px',color:s.muted}}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA DOCUMENTAÇÃO */}
        {tab === 'docs' && (
          <div>
            <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'20px'}}>📋 Documentação & Tutoriais</div>
            {modules.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px',color:s.muted,fontSize:'13px',background:s.card,borderRadius:'10px',border:`1px solid ${s.border}`}}>
                Nenhuma documentação adicionada ainda pelo administrador.
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                {modules.map((mod, mi) => (
                  <div key={mi} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'20px'}}>
                    <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'14px',color:s.accent}}>{mod.title}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                      {mod.files?.map((file, fi) => (
                        <a key={fi} href={file.url} target="_blank" rel="noreferrer"
                          style={{display:'flex',alignItems:'center',gap:'12px',background:'#0d0d0d',borderRadius:'7px',padding:'10px 14px',border:`1px solid ${s.border}`,textDecoration:'none',transition:'border-color .15s'}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor='#333'}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=s.border}>
                          <div style={{width:'32px',height:'32px',borderRadius:'6px',background:'rgba(240,165,0,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
                            {file.name?.endsWith('.pdf')?'📄':file.name?.endsWith('.mp4')?'🎬':file.name?.endsWith('.zip')?'🗜️':'📎'}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:'12px',fontWeight:'600',color:s.text}}>{file.name}</div>
                            <div style={{fontSize:'10px',color:s.muted,marginTop:'2px'}}>{file.size}</div>
                          </div>
                          <div style={{fontSize:'11px',color:s.accent,fontWeight:'700'}}>⬇ Baixar</div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA PERSONALIZAR */}
        {tab === 'personalizar' && (
          <div>
            <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'20px'}}>🎨 Personalizar para o Cliente</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>

              {/* SEU NEGÓCIO */}
              <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'20px'}}>
                <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'16px',color:s.accent}}>Seu Negócio</div>

                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Nome do seu negócio</div>
                  <input value={form.business_name} onChange={e=>setForm(p=>({...p,business_name:e.target.value}))}
                    placeholder="Ex: Agência Digital XYZ"
                    style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
                </div>

                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Sua logo</div>
                  <div onClick={() => logoRef.current?.click()}
                    style={{width:'100%',height:'100px',border:`2px dashed ${s.border}`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',background:'#0d0d0d',position:'relative'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#333'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=s.border}>
                    {form.business_logo_url
                      ? <img src={form.business_logo_url} alt="logo" style={{maxHeight:'80px',maxWidth:'200px',objectFit:'contain'}}/>
                      : <div style={{textAlign:'center',color:s.muted,fontSize:'11px'}}>{uploading?'Enviando...':'🖼️ Clique para upload da logo'}</div>
                    }
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{display:'none'}}/>
                </div>

                <div>
                  <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Cor principal</div>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <input type="color" value={form.primary_color} onChange={e=>setForm(p=>({...p,primary_color:e.target.value}))}
                      style={{width:'44px',height:'36px',borderRadius:'6px',border:`1px solid ${s.border}`,background:'#0d0d0d',cursor:'pointer',padding:'2px'}}/>
                    <input value={form.primary_color} onChange={e=>setForm(p=>({...p,primary_color:e.target.value}))}
                      style={{flex:1,background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
                  </div>
                </div>
              </div>

              {/* CLIENTE FINAL */}
              <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'20px'}}>
                <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'16px',color:'#00d4ff'}}>Cliente Final</div>

                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Nome do cliente</div>
                  <input value={form.client_name} onChange={e=>setForm(p=>({...p,client_name:e.target.value}))}
                    placeholder="Ex: João Silva"
                    style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
                </div>

                <div style={{marginBottom:'14px'}}>
                  <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Email do cliente</div>
                  <input type="email" value={form.client_email} onChange={e=>setForm(p=>({...p,client_email:e.target.value}))}
                    placeholder="cliente@email.com"
                    style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
                </div>

                <div>
                  <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>Negócio do cliente</div>
                  <input value={form.client_business} onChange={e=>setForm(p=>({...p,client_business:e.target.value}))}
                    placeholder="Ex: Loja do João"
                    style={{width:'100%',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'9px 12px',fontSize:'12px',color:s.text,outline:'none',fontFamily:'sans-serif'}}/>
                </div>
              </div>
            </div>

            {/* PREVIEW */}
            {(form.business_name || form.client_name) && (
              <div style={{marginTop:'20px',background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'10px',padding:'16px'}}>
                <div style={{fontSize:'10px',color:s.muted,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'12px'}}>Preview do kit de entrega</div>
                <div style={{background:form.primary_color||s.accent,borderRadius:'8px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px'}}>
                  {form.business_logo_url && <img src={form.business_logo_url} alt="logo" style={{height:'32px',objectFit:'contain'}}/>}
                  <div>
                    <div style={{fontSize:'13px',fontWeight:'700',color:'#000'}}>{form.business_name||'Seu Negócio'}</div>
                    <div style={{fontSize:'10px',color:'rgba(0,0,0,.7)'}}>Kit entregue para: {form.client_name||'Cliente'} · {form.client_business||''}</div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              style={{marginTop:'20px',width:'100%',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:'#000',border:'none',borderRadius:'8px',padding:'13px',fontSize:'12px',fontWeight:'700',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase'}}>
              {saving?'Salvando...':'💾 Salvar Configurações'}
            </button>
          </div>
        )}

        {/* ABA ENTREGAR */}
        {tab === 'entregar' && (
          <div>
            <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'20px'}}>🔗 Entregar ao Cliente</div>

            {/* CERTIFICADO */}
            <div style={{background:`linear-gradient(135deg,#111,#1a1500)`,border:`1px solid ${s.accent}44`,borderRadius:'12px',padding:'28px',marginBottom:'20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(240,165,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(240,165,0,.03) 1px,transparent 1px)',backgroundSize:'20px 20px'}}></div>
              <div style={{position:'relative',zIndex:2}}>
                <div style={{fontSize:'11px',letterSpacing:'4px',color:s.accent,textTransform:'uppercase',marginBottom:'8px'}}>Certificado White Label</div>
                <div style={{fontSize:'22px',fontWeight:'900',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'6px'}}>
                  {form.business_name || 'Seu Negócio'}
                </div>
                <div style={{fontSize:'12px',color:s.muted,marginBottom:'12px'}}>
                  Licença autorizada para: <strong style={{color:s.text}}>{form.client_name||'Cliente não definido'}</strong>
                </div>
                <div style={{display:'inline-block',background:'rgba(240,165,0,.1)',border:`1px solid ${s.accent}44`,borderRadius:'6px',padding:'6px 16px',fontSize:'11px',color:s.accent,letterSpacing:'2px',fontFamily:'monospace'}}>
                  ID: {config?.delivery_token?.toUpperCase().substring(0,16)}
                </div>
                <div style={{fontSize:'10px',color:s.muted,marginTop:'10px'}}>
                  {new Date().toLocaleDateString('pt-BR',{year:'numeric',month:'long',day:'numeric'})}
                </div>
              </div>
            </div>

            {/* LINK DE ENTREGA */}
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'20px',marginBottom:'16px'}}>
              <div style={{fontSize:'12px',fontWeight:'700',marginBottom:'12px'}}>Link para o cliente</div>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <div style={{flex:1,background:'#0d0d0d',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'10px 14px',fontSize:'11px',color:s.muted,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/entrega/${config?.delivery_token}` : '...'}
                </div>
                <button onClick={copyDeliveryLink}
                  style={{background:copied?`rgba(34,217,122,.2)`:`linear-gradient(90deg,${s.accent},${s.accent2})`,color:copied?s.green:'#000',border:copied?`1px solid ${s.green}44`:'none',borderRadius:'6px',padding:'10px 18px',fontSize:'11px',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s'}}>
                  {copied?'✓ Copiado!':'📋 Copiar'}
                </button>
              </div>
              <div style={{fontSize:'10px',color:s.muted,marginTop:'8px'}}>
                Envie este link para <strong style={{color:s.text}}>{form.client_name||'seu cliente'}</strong> acessar o produto personalizado.
              </div>
            </div>

            {/* STATUS */}
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={handleDeliver} disabled={config?.status==='delivered'}
                style={{flex:1,background:config?.status==='delivered'?'rgba(34,217,122,.1)':'rgba(34,217,122,.2)',color:s.green,border:`1px solid rgba(34,217,122,.3)`,borderRadius:'8px',padding:'12px',fontSize:'12px',fontWeight:'700',cursor:config?.status==='delivered'?'default':'pointer',letterSpacing:'.5px'}}>
                {config?.status==='delivered'?'✓ Entregue':'✓ Marcar como entregue'}
              </button>
              <button onClick={() => window.open(`/entrega/${config?.delivery_token}`,'_blank')}
                style={{flex:1,background:'#1a1a1a',color:s.text,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'12px',fontSize:'12px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
                👁 Preview do cliente
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
