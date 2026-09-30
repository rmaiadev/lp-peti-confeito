import { useEffect, useState } from 'react'

// Pré-carrega a foto e informa o estado: 'none' | 'loading' | 'ok' | 'erro'.
// Se falhar (ex.: o Google limitou os acessos), tenta de novo algumas vezes antes de desistir.
export function useFoto(url, tentativas = 3) {
  const [st, setSt] = useState(url ? 'loading' : 'none')

  useEffect(() => {
    if (!url) { setSt('none'); return }
    let vivo = true, t, n = 0
    setSt('loading')
    const tenta = () => {
      const img = new Image()
      img.onload = () => vivo && setSt('ok')
      img.onerror = () => {
        if (!vivo) return
        if (++n < tentativas) t = setTimeout(tenta, 1200 * n)
        else setSt('erro')
      }
      img.src = url
    }
    tenta()
    return () => { vivo = false; clearTimeout(t) }
  }, [url])

  return st
}