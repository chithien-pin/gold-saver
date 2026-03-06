import { useState, useEffect, useCallback } from 'react'
import { MIHONG_API_BASE, MIHONG_GOLD_CODES, PRICE_REFRESH_INTERVAL_MS } from '../constants'

const MIHONG_HEADERS = {
  Referer: 'https://www.mihong.vn/',
  'Content-Type': 'application/json',
  'x-market': 'mihong',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
}

/** API Mihong trả về giá theo chỉ (VNĐ/chỉ) — dùng trực tiếp, không chia 10 */
function parseLatestPricePerChi(data) {
  if (!Array.isArray(data) || data.length === 0) return null
  const latest = data[data.length - 1]
  const buying = latest?.buyingPrice
  if (buying == null) return null
  return buying
}

function parseLatestDateTime(data) {
  if (!Array.isArray(data) || data.length === 0) return null
  const latest = data[data.length - 1]
  const dt = latest?.dateTime
  if (!dt) return null
  const [d, t] = String(dt).trim().split(/\s+/)
  const [day, month, year] = (d || '').split('/')
  let hour = 0
  let minute = 0
  if (t) {
    const [h, m] = t.split(':')
    if (h != null) hour = parseInt(h, 10) || 0
    if (m != null) minute = parseInt(m, 10) || 0
  }
  if (day && month && year) return new Date(+year, +month - 1, +day, hour, minute, 0)
  return new Date()
}

export function useGoldPrice() {
  const [pricesByCode, setPricesByCode] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPrice = useCallback(async () => {
    setLoading(true)
    setError(null)
    const next = {}
    let latestDate = null
    try {
      for (const code of MIHONG_GOLD_CODES) {
        const url = `${MIHONG_API_BASE}?market=domestic&goldCode=${encodeURIComponent(code)}&last=24h`
        const res = await fetch(url, { headers: MIHONG_HEADERS })
        if (!res.ok) throw new Error(`Mihong API ${res.status}`)
        const data = await res.json()
        if (data?.success === false) throw new Error(data?.messages?.[0] || 'API error')
        const arr = Array.isArray(data) ? data : data?.data
        const perChi = parseLatestPricePerChi(arr)
        if (perChi != null) next[code] = perChi
        const dt = parseLatestDateTime(arr)
        if (dt && (!latestDate || dt > latestDate)) latestDate = dt
      }
      setPricesByCode(next)
      setLastUpdated(latestDate || new Date())
    } catch (e) {
      setError(e.message)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrice()
    const id = setInterval(fetchPrice, PRICE_REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchPrice])

  const spotVndPerChi = pricesByCode['999'] ?? pricesByCode['SJC'] ?? null

  return {
    spotVndPerChi,
    pricesByCode,
    loading,
    error,
    lastUpdated,
    refresh: fetchPrice,
  }
}
