import { useEffect, useState } from 'react'
import Rain from './components/Rain.jsx'
import Clock from './components/Clock.jsx'
import Card from './components/Card.jsx'
import CakeOrder from './components/CakeOrder.jsx'
import { DATA } from './data.js'
import { SHEET_CSV_URL, CAKES_CSV_URL, CONFIG_CSV_URL } from './config.js'
import { SITE_DEFAULT, SiteContext, loadSite } from './site.js'
import { CAKES_DEFAULT, loadCakes } from './cakes.js'
import { loadProducts } from './sheet.js'

const NOMES = ['Maria', 'João', 'Ana', 'Camila', 'Lucas', 'Bia', 'Rafa']

export default function App() {
  const [items, setItems] = useState(SHEET_CSV_URL ? [] : DATA)
  const [status, setStatus] = useState(SHEET_CSV_URL ? 'loading' : 'ok')
  const [toast, setToast] = useState(null)
  const [idx, setIdx] = useState(0)
  const [cakes, setCakes] = useState(CAKES_DEFAULT)
  const [site, setSite] = useState(SITE_DEFAULT)

  // Com planilha configurada: lê ao abrir e atualiza a cada 60 segundos.
  useEffect(() => {
    if (!SHEET_CSV_URL) return
    let vivo = true
    const carregar = () =>
      loadProducts(SHEET_CSV_URL)
        .then((lista) => { if (vivo) { setItems(lista); setStatus('ok') } })
        .catch((e) => { console.error('[vitrine]', e); if (vivo) setStatus((s) => (s === 'loading' ? 'erro' : s)) })
    carregar()
    const t = setInterval(carregar, 60000)
    return () => { vivo = false; clearInterval(t) }
  }, [])

  // Opções e preços dos bolos de festa: lê a aba de bolos e atualiza a cada 60 segundos.
  useEffect(() => {
    if (!CAKES_CSV_URL) return
    let vivo = true
    const carregar = () => loadCakes(CAKES_CSV_URL).then((c) => vivo && setCakes(c)).catch((e) => console.error('[planilha]', e))
    carregar()
    const t = setInterval(carregar, 60000)
    return () => { vivo = false; clearInterval(t) }
  }, [])

  // Textos do topo, WhatsApp e horário: lê a aba config e atualiza a cada 60 segundos.
  useEffect(() => {
    if (!CONFIG_CSV_URL) return
    let vivo = true
    const carregar = () => loadSite(CONFIG_CSV_URL).then((c) => vivo && setSite(c)).catch((e) => console.error('[planilha]', e))
    carregar()
    const t = setInterval(carregar, 60000)
    return () => { vivo = false; clearInterval(t) }
  }, [])

  // Sem planilha (modo demonstração): simula vendas ao vivo.
  useEffect(() => {
    if (SHEET_CSV_URL) return
    let to
    const tick = () => {
      setItems((cur) => {
        const ok = cur.map((x, i) => (x.l > (x.l < 3 ? 1 : 0) ? i : -1)).filter((i) => i >= 0)
        if (!ok.length) return cur
        const i = ok[Math.floor(Math.random() * ok.length)]
        setToast(`${NOMES[Math.floor(Math.random() * NOMES.length)]} acabou de reservar ${cur[i].n.toLowerCase()}`)
        setTimeout(() => setToast(null), 3200)
        return cur.map((x, k) => (k === i ? { ...x, l: x.l - 1 } : x))
      })
      to = setTimeout(tick, 5000 + Math.random() * 5000)
    }
    to = setTimeout(tick, 3500)
    return () => clearTimeout(to)
  }, [])

  const onScroll = (e) => {
    const el = e.currentTarget
    const c = el.children[0]
    if (c) setIdx(Math.round(el.scrollLeft / (c.offsetWidth + 14)))
  }

  const day = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const aviso =
    status === 'loading' ? 'Preparando a vitrine…'
    : status === 'erro' ? 'Não conseguimos carregar a vitrine agora. Tente de novo em instantes.'
    : !items.length ? 'A fornada de hoje ainda não saiu. Volte daqui a pouco.'
    : null

  return (
    <SiteContext.Provider value={site}>
      <Rain />
      <header>
        <img className="logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="Peti Confeito" />
        <h1>{site.titulo}<em>{site.destaque}</em></h1>
        <p className="sub">{site.subtitulo.replace('{data}', day)}</p>
        <Clock />
        <a className="jump" href="#encomendas">Encomendar bolo de festa</a>
      </header>
      <main>
        {aviso ? (
          <p className="vazio">{aviso}</p>
        ) : (
          <>
            <div className="track" onScroll={onScroll}>
              {items.map((p, i) => <Card key={p.n + i} p={p} />)}
            </div>
            <div className="dots">
              {items.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}
            </div>
          </>
        )}
      </main>
      <CakeOrder cfg={cakes} />
      <footer>{site.rodape}</footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </SiteContext.Provider>
  )
}