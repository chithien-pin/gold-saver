import { useState, useEffect, useCallback } from 'react'
import { GOLD_RATE_API_URL, GOLD_RATE_CODES, PRICE_REFRESH_INTERVAL_MS } from '../constants'

const GOLD_RATES_QUERY = `
  query GetGoldRates {
    goldRates {
      items {
        code
        name
        buy_price
        sell_price
        last_updated
      }
    }
  }
`

function parsePrice(value) {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const digitsOnly = String(value).replace(/[^\d.-]/g, '')
  const num = Number(digitsOnly)
  return Number.isFinite(num) ? num : null
}

function parseLastUpdated(value) {
  if (!value) return null
  const dt = new Date(value)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function normalizeCode(item) {
  const rawCode = String(item?.code || '').trim().toUpperCase()
  const rawName = String(item?.name || '').trim().toUpperCase()
  if (rawCode.includes('SJC') || rawName.includes('SJC')) return 'SJC'
  if (rawCode === '999' || rawCode === '9999') return '999'
  if (rawName.includes('999')) return '999'
  return rawCode
}

export function useGoldPrice() {
  const [pricesByCode, setPricesByCode] = useState({})
  const [pricesByCodeSell, setPricesByCodeSell] = useState({})
  const [rateItems, setRateItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPrice = useCallback(async () => {
    setLoading(true)
    setError(null)
    const nextBuy = {}
    const nextSell = {}
    const nextItems = []
    let latestDate = null
    try {
      const res = await fetch(GOLD_RATE_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/graphql-response+json, application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GOLD_RATES_QUERY,
          operationName: 'GetGoldRates',
        }),
      })
      if (!res.ok) throw new Error(`Gold API ${res.status}`)
      const payload = await res.json()
      if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
        throw new Error(payload.errors[0]?.message || 'GraphQL error')
      }
      const items = Array.isArray(payload?.data?.goldRates?.items) ? payload.data.goldRates.items : []

      for (const item of items) {
        const mappedCode = normalizeCode(item)
        if (!GOLD_RATE_CODES.includes(mappedCode)) continue
        const buy = parsePrice(item?.buy_price)
        const sell = parsePrice(item?.sell_price)
        nextItems.push({
          code: mappedCode,
          name: String(item?.name || mappedCode),
          buyPrice: buy,
          sellPrice: sell,
        })
        if (buy != null) nextBuy[mappedCode] = buy
        if (sell != null) nextSell[mappedCode] = sell
        const dt = parseLastUpdated(item?.last_updated)
        if (dt && (!latestDate || dt > latestDate)) latestDate = dt
      }
      setPricesByCode(nextBuy)
      setPricesByCodeSell(nextSell)
      setRateItems(nextItems)
      setLastUpdated(latestDate || new Date())
    } catch (e) {
      setError(e.message)
      setRateItems([])
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
    pricesByCodeSell,
    rateItems,
    loading,
    error,
    lastUpdated,
    refresh: fetchPrice,
  }
}
