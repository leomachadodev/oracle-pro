'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Ebook() {
  const [user, setUser] = useState(null)
  const [capAtivo, setCapAtivo] = useState(4)
  const router = useRouter()

  const ebook = {
    nome: 'Copy Expert 2025',
    totalPaginas: 120,
    paginaAtual: 38,
    progresso: 32,
    capitulos: [
      { num: '01', nome: 'Introdução à Copy', pagina: 1 },
      { num: '02', nome: 'Psicologia do Comprador', pagina: 12 },
      { num: '03', nome: 'Headlines que Param', pagina: 22 },
      { num: '04', nome: 'A Arte do Lead', pagina: 30 },
      { num: '05', nome: 'A Promessa Irresistível', pagina: 38 },
      { num: '06', nome: 'Provas e Depoimentos', pagina: 50 },
      { num: '07', nome: 'Oferta e Ancoragem', pagina: 62 },
      { num: '08', nome: 'CTA que Converte', pagina: 74 },
      { num: '09', nome: 'Copy para E-mail', pagina: 86 },
      { num: '10', nome: 'Copy para Vídeo (VSL)', pagina: 98 },
      { num: '11', nome: 'Templates Prontos', pagina: 110 },
    ],
    conteudo: [
      { titulo: 'Introdução à Copy', texto: 'Copywriting é a arte de escrever textos persuasivos que levam o leitor a tomar uma ação. Neste capítulo você vai entender os fundamentos que todo copywriter precisa dominar antes de escrever uma única linha.' },
      { titulo: 'Psicologia do Comprador', texto: 'Para vender, você precisa entender como as pessoas tomam decisões. A neurociência comprova que 95% das decisões de compra são emocionais. Aprenda os gatilhos mentais que ativam o desejo de compra.' },
      { titulo: 'Headlines que Param', texto: 'Seu título tem 3 segundos para capturar a atenção do leitor. Neste capítulo você vai aprender as 12 fórmulas de headlines que geraram bilhões em vendas ao redor do mundo.' },
      { titulo: 'A Arte do Lead', texto: 'O lead é o parágrafo de abertura da sua copy. É ele que determina se o leitor vai continuar ou fechar a página. Aprenda as 8 tipos de lead mais poderosos do marketing direto.' },
      { titulo: 'A Fórmula da Promessa Irresistível', texto: 'Toda grande copy começa com uma promessa. Não uma promessa qualquer — uma promessa irresistível que faz o leitor parar tudo e prestar atenção. Para construir uma promessa forte você precisa combinar três elementos: especificidade, credibilidade e desejo.\n\nVeja a diferença entre "Aprenda a vender mais" e "Como eu fechei R$47.000 em 30 dias usando apenas o WhatsApp, sem investir em tráfego pago." A segunda é específica, crível e desperta desejo.\n\nPegue seu produto e escreva 5 versões diferentes da sua promessa. Use números reais, resultados concretos e um prazo específico.' },
      { titulo: 'Provas e Depoimentos', texto: 'A prova social é um dos gatilhos mentais mais poderosos. Aprenda como coletar, formatar e apresentar depoimentos que eliminam objeções e aumentam a conversão.' },
      { titulo: 'Oferta e Ancoragem', texto: 'Uma oferta irresistível não é só sobre preço — é sobre valor percebido. Neste capítulo você vai aprender como estruturar ofertas que fazem o cliente sentir que está fazendo o negócio da sua vida.' },
      { titulo: 'CTA que Converte', texto: 'O Call to Action é o momento da verdade. Um CTA fraco pode destruir uma copy perfeita. Aprenda as técnicas que transformam leitores em compradores.' },
      { titulo: 'Copy para E-mail', texto: 'O e-mail ainda é o canal com maior ROI do marketing digital. Aprenda a escrever sequências de e-mails que nutrem, engajam e convertem sua lista.' },
      { titulo: 'Copy para Vídeo (VSL)', texto: 'O Video Sales Letter é o formato mais poderoso de vendas online. Aprenda a estrutura VSL que gerou mais de R$10 milhões em vendas diretas.' },
      { titulo: 'Templates Prontos', texto: 'Neste capítulo final você encontra 15 templates prontos para usar em seus projetos: headlines, leads, CTAs, e-mails de vendas e scripts de VSL.' },
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

  const cap = ebook.conteudo[capAtivo]
  const s = {
    bg:'#0a0a0a', nav:'#0f0f0f', border:'#1e1e1e',
    text:'#e8e8e8', muted:'#555', accent:'#f0a500',
    accent2:'#e05500', green:'#22d97a'
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
          <div style={{fontSize:'11px',color:'#666'}}>{ebook.nome}</div>
        </div>
        <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'4px',background:`linear-gradient(90deg,${s.accent},${s.accent2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ORACLE PRO</div>
        <div style={{fontSize:'10px',color:s.muted}}>Página {ebook.paginaAtual} de {ebook.totalPaginas}</div>
      </nav>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        <div style={{flex:1,background:'#1a1a1a',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{background:'#0d0d0d',borderBottom:`1px solid ${s.border}`,padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <button onClick={() => setCapAtivo(Math.max(0, capAtivo-1))} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 12px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>⬅ Anterior</button>
              <span style={{fontSize:'11px',color:s.muted}}>Capítulo {capAtivo+1} de {ebook.capitulos.length}</span>
              <button onClick={() => setCapAtivo(Math.min(ebook.conteudo.length-1, capAtivo+1))} style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 12px',fontSize:'10px',color:s.text,cursor:'pointer',fontFamily:'sans-serif'}}>Próximo ➡</button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <button style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 10px',fontSize:'10px',color:s.text,cursor:'pointer'}}>− Zoom</button>
              <span style={{fontSize:'10px',color:s.muted}}>100%</span>
              <button style={{background:'#1a1a1a',border:`1px solid ${s.border}`,borderRadius:'5px',padding:'5px 10px',fontSize:'10px',color:s.text,cursor:'pointer'}}>+ Zoom</button>
            </div>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'32px',display:'flex',justifyContent:'center',scrollbarWidth:'thin',scrollbarColor:'#222 transparent'}}>
            <div style={{background:'#fff',width:'100%',maxWidth:'680px',minHeight:'880px',borderRadius:'4px',boxShadow:'0 8px 40px rgba(0,0,0,.6)',padding:'72px 80px'}}>
              <div style={{fontFamily:'Georgia,serif',fontSize:'28px',fontWeight:'700',color:'#111',marginBottom:'20px',lineHeight:1.2}}>
                Capítulo {ebook.capitulos[capAtivo]?.num} — {cap?.titulo}
              </div>
              {cap?.texto.split('\n\n').map((p, i) => (
                <p key={i} style={{fontSize:'14px',color:'#444',lineHeight:1.85,marginBottom:'18px',fontFamily:'Georgia,serif'}}>
                  {p}
                </p>
              ))}
              {capAtivo === 4 && (
                <div style={{background:'#fff8e1',borderLeft:'3px solid #f0a500',padding:'14px 18px',borderRadius:'0 6px 6px 0',margin:'20px 0',fontSize:'13px',color:'#666',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
                  💡 "A promessa é o coração da sua copy. Se ela não for forte o suficiente para fazer o leitor querer continuar lendo, todo o resto não importa."
                </div>
              )}
              <div style={{marginTop:'48px',paddingTop:'20px',borderTop:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:'#aaa',fontFamily:'Georgia,serif'}}>Copy Expert 2025</span>
                <span style={{fontSize:'11px',color:'#aaa',fontFamily:'Georgia,serif'}}>Página {ebook.capitulos[capAtivo]?.pagina}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{width:'260px',background:'#0d0d0d',borderLeft:`1px solid ${s.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`}}>
            <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'}}>Sumário</div>
            <div style={{fontSize:'12px',color:s.green,marginTop:'4px',fontWeight:'600'}}>{ebook.nome}</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
              <div style={{flex:1,height:'3px',background:'#222',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${ebook.progresso}%`,background:s.green,borderRadius:'2px'}}></div>
              </div>
              <span style={{fontSize:'10px',color:s.muted}}>{ebook.progresso}% lido</span>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#1a1a1a transparent'}}>
            {ebook.capitulos.map((cap, i) => (
              <div key={i} onClick={() => setCapAtivo(i)}
                style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',borderLeft:`2px solid ${capAtivo===i?s.green:'transparent'}`,background:capAtivo===i?'rgba(34,217,122,.06)':'transparent',transition:'all .15s'}}
                onMouseEnter={e=>{ if(capAtivo!==i) e.currentTarget.style.background='#111' }}
                onMouseLeave={e=>{ if(capAtivo!==i) e.currentTarget.style.background='transparent' }}>
                <span style={{fontSize:'9px',color:s.muted,width:'22px',flexShrink:0}}>{cap.num}</span>
                <span style={{fontSize:'11px',flex:1,color:capAtivo===i?s.green:s.text}}>{cap.nome}</span>
                <span style={{fontSize:'9px',color:s.muted}}>p.{cap.pagina}</span>
              </div>
            ))}
          </div>
          <div style={{padding:'14px 16px',borderTop:`1px solid ${s.border}`}}>
            <button style={{width:'100%',background:`linear-gradient(90deg,#15803d,${s.green})`,color:'#000',fontSize:'11px',fontWeight:'700',padding:'10px',borderRadius:'6px',border:'none',cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase'}}>
              ⬇ Baixar PDF completo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}