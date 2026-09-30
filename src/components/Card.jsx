import { useContext } from 'react'
import { ART } from '../data.js'
import { SiteContext } from '../site.js'
import { useFoto } from '../useFoto.js'

export default function Card({ p }) {
  const { whatsapp } = useContext(SiteContext)
  const fotoSt = useFoto(p.foto)
  const reservaFoto = fotoSt === 'loading' || fotoSt === 'ok' // reserva o espaço da foto desde o início
  const pct = p.l / p.t
  const filled = Math.ceil(pct * 12)
  const hot = pct <= 0.25 && p.l > 0
  const out = p.l === 0
  const msg = out ? 'Esgotou. Volta amanhã.' : pct > 0.5 ? 'Saindo com calma.' : hot ? `Últimas ${p.l} unidades.` : 'Saindo rápido.'
  const reservar = () =>
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent('Oi, Peti! Quero reservar 1 ' + p.n + ' de hoje.')}`, '_blank', 'noopener')

  return (
    <article className={'card' + (hot ? ' hot' : '') + (out ? ' out' : '')}>
      {out && <div className="stamp">Esgotado</div>}
      <div className={'stage' + (reservaFoto ? ' ph' : '')} style={{ '--c': p.c }}>
        {/* o desenho fica visível enquanto a foto carrega (ou se ela falhar) */}
        <div className="art" dangerouslySetInnerHTML={{ __html: ART[p.k] || ART.tru }} />
        {fotoSt === 'ok' && <img className="foto" src={p.foto} alt={p.n} />}
      </div>
      <h2>{p.n}</h2>
      <p className="d">{p.d}</p>
      <div className="meta">
        <div>
          <span className="num">{p.l}</span>
          <span className="of">restam de {p.t} feitos hoje</span>
        </div>
        <span className="price">R$ {p.p.toFixed(2).replace('.', ',')}</span>
      </div>
      <div className="bar" role="img" aria-label={`Restam ${p.l} de ${p.t}`}>
        {Array.from({ length: 12 }, (_, i) => <i key={i} className={i < filled && !out ? 'on' : ''} />)}
      </div>
      <p className="msg">{msg}</p>
      <button className="btn" disabled={out} onClick={reservar}>
        {out ? 'Avise-me amanhã' : 'Reservar pelo WhatsApp'}
      </button>
    </article>
  )
}