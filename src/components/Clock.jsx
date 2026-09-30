import { useContext, useEffect, useState } from 'react'
import { SiteContext } from '../site.js'

export default function Clock() {
  const { hora } = useContext(SiteContext)
  const [t, setT] = useState('')

  useEffect(() => {
    const f = () => {
      const n = new Date(), e = new Date(n)
      e.setHours(hora, 0, 0, 0)
      if (e <= n) e.setDate(e.getDate() + 1)
      const s = Math.floor((e - n) / 1e3), p = (v) => String(v).padStart(2, '0')
      setT(`${p((s / 3600) | 0)}:${p(((s % 3600) / 60) | 0)}:${p(s % 60)}`)
    }
    f()
    const i = setInterval(f, 1000)
    return () => clearInterval(i)
  }, [hora])

  return <div className="clock"><i />Encerra às {hora}h, faltam {t}</div>
}