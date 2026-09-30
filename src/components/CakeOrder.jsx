import { useContext, useState } from 'react'
import { SiteContext } from '../site.js'
import { useFoto } from '../useFoto.js'

const brl = (v) => 'R$ ' + v.toLocaleString('pt-BR')

function Group({ label, items, value, set, sw, extra }) {
  if (!items.length) return null
  return (
    <fieldset className="grp">
      <legend>{label}</legend>
      <div className="chips">
        {items.map((o) => (
          <button key={o.k} type="button" className="chip" aria-pressed={value?.k === o.k} onClick={() => set(o.k)}>
            {sw && <span className="sw" style={{ background: o.c }} />}
            {o.n}{extra && extra(o) && <small>{extra(o)}</small>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default function CakeOrder({ cfg }) {
  const { whatsapp, boloTitulo, boloTexto } = useContext(SiteContext)
  const [themeKey, setThemeKey] = useState('classico')
  const [sk, setSk] = useState(null)
  const [fk, setFk] = useState(null)
  const [msg, setMsg] = useState('')
  const [date, setDate] = useState('')
  const [referencia, setReferencia] = useState('')

  const themes = cfg.themes
  const theme = themes.find((t) => t.k === themeKey) || themes[0]

  // opções do tema; se o tema não tiver opções próprias, usa as do Clássico
  const pick = (items) => {
    const proprias = items.filter((o) => o.tema === theme.k)
    if (proprias.length) return proprias
    const classicas = items.filter((o) => o.tema === 'classico')
    return classicas.length ? classicas : items
  }
  const sizes = pick(cfg.sizes), fills = pick(cfg.fills)

  const mudarTema = (key) => {
    setThemeKey(key); setSk(null); setFk(null)
  }

  const size = sizes.find((o) => o.k === sk) || sizes[Math.min(1, sizes.length - 1)]
  const fill = fills.find((o) => o.k === fk) || fills[0]

  const fotoSt = useFoto(theme.foto)
  const foto = fotoSt === 'ok' ? theme.foto : ''

  const min = new Date(Date.now() + cfg.dias * 864e5)
  const minISO = new Date(min.getTime() - min.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
  const total = (size?.p || 0) + (fill?.p || 0)

  const enviar = () => {
    const [a, m, d] = date.split('-')
    const txt = [
      'Oi, Peti! Quero encomendar um bolo de festa:',
      `- Tema: ${theme.n}`,
      theme.d ? `- Estilo: ${theme.d}` : null,
      `- Tamanho: ${size.n}${size.s ? ` (${size.s})` : ''}`,
      `- Recheio: ${fill.n}`,
      msg ? `- Mensagem no bolo: "${msg}"` : null,
      referencia ? `- Referência: ${referencia}` : null,
      `- Data da festa: ${d}/${m}/${a}`,
      `Valor estimado: ${brl(total)}`,
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener')
  }

  return (
    <section className="enc" id="encomendas"
      style={{ '--bolo-accent': theme.c, '--bolo-accent-2': theme.c2, '--bolo-bg': theme.c3 }}>
      <div className="enc-in">
        <div className="head">
          <h2>{boloTitulo}</h2>
          <p className="lead">{boloTexto}</p>
        </div>

        <div className="bolo-layout">
          {/* FOTO do bolo do tema */}
          <div className="prev">
            {foto ? (
              <>
                <img className="bolo-foto" src={foto} alt={`Bolo ${theme.n}`} />
                <small className="foto-nota">Foto ilustrativa. O bolo final pode variar.</small>
              </>
            ) : (
              <div className="bolo-foto vazio">{fotoSt === 'loading' ? 'Carregando a foto…' : `Foto do bolo ${theme.n} em breve`}</div>
            )}
          </div>

          <div className="form">
            <fieldset className="grp theme-group">
              <legend>Estilo do bolo</legend>
              <div className="theme-buttons">
                {themes.slice(0, 3).map((t) => (
                  <button key={t.k} type="button" className={`theme-btn ${theme.k === t.k ? 'active' : ''}`}
                    style={{ '--theme-color': t.c, '--theme-color-2': t.c2 }} onClick={() => mudarTema(t.k)}>
                    <strong>{t.n}</strong>
                    {t.d && <small>{t.d}</small>}
                  </button>
                ))}
              </div>
            </fieldset>

            <Group label="Tamanho" items={sizes} value={size} set={setSk} extra={(o) => o.s} />
            <Group label="Recheio" items={fills} value={fill} set={setFk} sw />

            <fieldset className="grp">
              <legend>Referência <small>(opcional)</small></legend>
              <input className="inp" type="url" value={referencia} onChange={(e) => setReferencia(e.target.value)}
                placeholder="Cole o link do bolo que você gostou" />
              <small className="ref-help">Pinterest, Instagram, Google ou outro site.</small>
            </fieldset>

            <fieldset className="grp">
              <legend>Nome</legend>
              <input className="inp" maxLength={18} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ex.: Priscila" />
            </fieldset>

            <fieldset className="grp">
              <legend>Data da festa</legend>
              <input className="inp" type="date" min={minISO} value={date} onChange={(e) => setDate(e.target.value)} />
            </fieldset>

            <div className="total"><span>Valor estimado</span><b>{brl(total)}</b></div>
            <button className="btn" disabled={!date} onClick={enviar}>
              {date ? 'Enviar pedido pelo WhatsApp' : 'Escolha a data para continuar'}
            </button>
            <p className="note">Encomendas com {cfg.dias} dias de antecedência. O valor final é confirmado no WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  )
}