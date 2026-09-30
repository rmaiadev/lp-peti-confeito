import { readTable, norm, num, fotoUrl } from './sheet.js'

// O tamanho é por quilo: o desenho do bolo é sempre o mesmo (um bolo só, sem andares)
const W = { unico: [170] }

export const CAKES_DEFAULT = {
  dias: 3,

  themes: [
    { k: 'classico', n: 'Clássico', c: '#d4a24c', c2: '#ff9131', c3: '#fffaf7', foto: '' },
    { k: 'menino', n: 'Menino', c: '#e3262e', c2: '#1769aa', c3: '#07111f', foto: '' },
    // d: 'Princesa',
    { k: 'menina', n: 'Menina', c: '#ff9db1', c2: '#b57edc', c3: '#fff4fb', foto: '' },
  ],

  sizes: [
    { k: 'Pequeno', n: 'Pequeno', s: '1 kilo', p: 100, w: W.unico, foto: '', tema: 'classico' },
    { k: 'Médio', n: 'Médio', s: '1,5 kilo', p: 240, w: W.unico, foto: '', tema: 'classico' },
    { k: 'Grande', n: 'Grande', s: '2 kilo', p: 420, w: W.unico, foto: '', tema: 'classico' },
  ],

  covers: [
    { k: 'Chocolate', n: 'Chocolate', c: '#5a2410', d: '#3b170b', t: '#ffddd4', p: 0, foto: '', tema: 'classico' },
    { k: 'Ninho', n: 'Ninho', c: '#fff1e6', d: '#ffddd4', t: '#6b2e17', p: 0, foto: '', tema: 'classico' },
    { k: 'Rosa', n: 'Rosa', c: '#ff9db1', d: '#f0708c', t: '#4a1f0e', p: 0, foto: '', tema: 'classico' },
  ],

  fills: [
    { k: 'Brigadeiro', n: 'Brigadeiro', c: '#3b170b', p: 0, foto: '', tema: 'classico' },
    { k: 'Ninho com morango', n: 'Ninho com morango', c: '#f0455b', p: 20, foto: '', tema: 'classico' },
    { k: 'Doce de leite', n: 'Doce de leite', c: '#c98a4b', p: 0, foto: '', tema: 'classico' },
    { k: 'Maracujá', n: 'Maracujá', c: '#ffcc4d', p: 10, foto: '', tema: 'classico' },
  ],
}

export async function loadCakes(url) {
  const { head, rows } = await readTable(url, 'tipo')

  const col = (r, key) => {
    const index = head.indexOf(key)
    return index >= 0 ? (r[index] ?? '').trim() : ''
  }

  const out = {
    dias: CAKES_DEFAULT.dias,
    themes: [],
    sizes: [],
    covers: [],
    fills: [],
  }

  // Cópia dos temas padrão: a planilha preenche a foto (e a descrição, se houver) de cada um
  const themes = CAKES_DEFAULT.themes.map((t) => ({ ...t }))

  for (const r of rows) {
    const ativo = norm(col(r, 'ativo'))
    const tipo = norm(col(r, 'tipo'))
    const nome = col(r, 'nome')
    const detalhe = col(r, 'detalhe')
    const preco = num(col(r, 'preco'))
    const foto = fotoUrl(col(r, 'foto'))

    if (!nome) continue

    if (['nao', 'n', '0', 'false'].includes(ativo)) {
      continue
    }

    /*
     * TEMAS
     *
     * Cores e nomes continuam em CAKES_DEFAULT.
     * Da planilha vêm a foto e, opcionalmente, a descrição.
     * A foto é lida da coluna "foto" ou, se ela não existir,
     * de qualquer link que estiver na linha do tema.
     */
    if (tipo === 'tema') {
      const t = themes.find((x) => x.k === norm(nome))
      if (t) {
        const link = col(r, 'foto') || r.map((c) => (c ?? '').trim()).find((c) => /^https?:\/\//i.test(c)) || ''
        t.foto = fotoUrl(link)
        if (detalhe && !/^https?:\/\//i.test(detalhe)) t.d = detalhe
      }
    }

    /*
     * TAMANHOS
     *
     * O tamanho é por quilo e só muda o valor e o texto do pedido.
     * Não existe coluna de andares: o desenho é sempre o mesmo.
     */
    if (tipo === 'tamanho') {
      out.sizes.push({
        k: nome,
        n: nome,
        s: detalhe,
        p: preco,
        w: W.unico,
        foto,
        tema: 'classico',
      })
    }

    if (tipo === 'cobertura') {
      out.covers.push({
        k: nome,
        n: nome,
        c: col(r, 'cor') || '#5a2410',
        d: col(r, 'cor2') || '#3b170b',
        t: col(r, 'cor3') || '#ffddd4',
        p: preco,
        foto,
        tema: 'classico',
      })
    }

    if (tipo === 'recheio') {
      out.fills.push({
        k: nome,
        n: nome,
        c: col(r, 'cor') || '#3b170b',
        p: preco,
        foto,
        tema: 'classico',
      })
    }

    if (
      tipo === 'config' &&
      norm(nome) === 'antecedencia_dias'
    ) {
      out.dias = preco || num(detalhe) || CAKES_DEFAULT.dias
    }
  }

  /*
   * Fallbacks
   */

  if (!out.sizes.length) {
    out.sizes = CAKES_DEFAULT.sizes
  }

  if (!out.covers.length) {
    out.covers = CAKES_DEFAULT.covers
  }

  if (!out.fills.length) {
    out.fills = CAKES_DEFAULT.fills
  }

  out.themes = themes

  return out
}