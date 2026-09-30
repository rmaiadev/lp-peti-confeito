import { createContext } from 'react'
import { readTable, norm, num } from './sheet.js'

// Valores padrão (usados se a aba "config" estiver vazia ou não carregar)
export const SITE_DEFAULT = {
  whatsapp: '5511999999999',
  titulo: 'Feito hoje.',
  destaque: 'Até acabar.',
  subtitulo: 'A vitrine de {data}. Cada doce sai uma única vez, e o que acabou só volta amanhã.',
  hora: 18,
  rodape: 'Toque na tela para soltar um pouco de chocolate.',
  boloTitulo: 'Um bolo para a sua festa',
  boloTexto: 'Monte o seu e veja o bolo ficar pronto aqui. Depois é só enviar o pedido, e a gente confirma valor e data com você.',
}

export const SiteContext = createContext(SITE_DEFAULT)

// chave na planilha -> campo usado pelo site
const CHAVES = {
  whatsapp: 'whatsapp', titulo: 'titulo', destaque: 'destaque', subtitulo: 'subtitulo',
  hora: 'hora', rodape: 'rodape', bolo_titulo: 'boloTitulo', bolo_texto: 'boloTexto',
}

export async function loadSite(url) {
  const { head, rows } = await readTable(url, 'chave')
  const ci = head.indexOf('chave'), vi = head.indexOf('valor')
  const out = { ...SITE_DEFAULT }
  for (const r of rows) {
    const campo = CHAVES[norm(r[ci] ?? '')]
    const valor = (r[vi] ?? '').trim()
    if (!campo || !valor) continue
    if (campo === 'whatsapp') {
      let d = valor.replace(/\D/g, '')
      if (d.length === 10 || d.length === 11) d = '55' + d // sem código do país
      if (d) out.whatsapp = d
    } else if (campo === 'hora') {
      const h = Math.round(num(valor))
      if (h >= 0 && h <= 23) out.hora = h
    } else out[campo] = valor
  }
  return out
}