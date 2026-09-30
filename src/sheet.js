// Lê a planilha do Google publicada como CSV e converte em produtos da vitrine.
const GLOW = {
    brig: 'rgba(201,138,75,.5)', mor: 'rgba(240,69,91,.45)', coo: 'rgba(227,176,115,.45)',
    pot: 'rgba(255,150,170,.4)', tru: 'rgba(212,162,76,.4)',
  }
  // nomes amigáveis usados na coluna "desenho" da planilha
  const DESENHO = { brigadeiro: 'brig', morango: 'mor', cookie: 'coo', pote: 'pot', trufa: 'tru' }
  
  export function parseCsv(text) {
    const rows = []; let row = [], cell = '', q = false
    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
        else if (c === '"') q = false
        else cell += c
      } else if (c === '"') q = true
      else if (c === ',') { row.push(cell); cell = '' }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++
        row.push(cell); rows.push(row); row = []; cell = ''
      } else cell += c
    }
    if (cell || row.length) { row.push(cell); rows.push(row) }
    return rows
  }
  
  export const norm = (s) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  export const num = (v) => {
    v = String(v).replace(/[^\d,.-]/g, '')
    const n = v.includes(',') ? parseFloat(v.replace(/\./g, '').replace(',', '.')) : parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  
  // Aceita link de compartilhamento do Google Drive e converte para link direto da imagem.
  // (o arquivo precisa estar como "Qualquer pessoa com o link")
  export const fotoUrl = (u = '') => {
    const value = String(u).trim()
  
    if (!value) return ''
  
    const m = value.match(
      /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/
    )
  
    if (m) return `https://lh3.googleusercontent.com/d/${m[1]}=w900`
    if (u.startsWith('/') && !u.startsWith('//')) return import.meta.env.BASE_URL + u.slice(1)
    return u
  }
  
  // Lê a aba em CSV e localiza a linha de cabeçalho (o Google às vezes "engole" ou desloca o cabeçalho).
  export async function readTable(url, chave) {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now())
    if (!res.ok) throw new Error('Falha ao ler a planilha (' + res.status + '). Confira se ela está compartilhada como "Qualquer pessoa com o link".')
    const rows = parseCsv(await res.text())
    const i = rows.slice(0, 3).findIndex((r) => r.map(norm).includes(chave))
    if (i < 0) throw new Error(`Não achei a coluna "${chave}". Primeira linha lida: ${JSON.stringify((rows[0] || []).slice(0, 8))}. Confira o nome da aba no link (sheet=...) e os títulos das colunas.`)
    return { head: rows[i].map(norm), rows: rows.slice(i + 1) }
  }
  
  export async function loadProducts(url) {
    const { head, rows } = await readTable(url, 'restantes')
    const col = (r, k) => (r[head.indexOf(k)] ?? '').trim()
   
    return rows
      .filter((r) => col(r, 'nome') && !['nao', 'n', '0', 'false'].includes(norm(col(r, 'ativo'))))
      .map((r) => {
        const l = Math.max(0, Math.round(num(col(r, 'restantes'))))
        const t = Math.max(l, Math.round(num(col(r, 'total'))) || l, 1)
        const k = DESENHO[norm(col(r, 'desenho'))] || 'tru'
        return { n: col(r, 'nome'), d: col(r, 'descricao'), p: num(col(r, 'preco')), t, l, k, c: GLOW[k], foto: fotoUrl(col(r, 'foto')) }
      })
  }