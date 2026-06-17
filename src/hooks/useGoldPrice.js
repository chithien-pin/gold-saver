import { useState, useEffect, useCallback } from 'react'
import { GOLD_RATE_API_URL, PRICE_REFRESH_INTERVAL_MS } from '../constants'
import { readGoldRateItemsCache, writeGoldRateItemsCache } from '../utils/goldRateCache'
import { processGoldRateItems } from '../utils/goldPrice'

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

function parseLastUpdated(value) {
  if (!value) return null
  const dt = new Date(value)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function processCachedItems(items) {
  return processGoldRateItems(
    (Array.isArray(items) ? items : []).map((item) => ({
      code: item?.code,
      name: item?.name,
      buy_price: item?.buyPrice,
      sell_price: item?.sellPrice,
    }))
  )
}

export function useGoldPrice() {
  const initialCache = processCachedItems(readGoldRateItemsCache())
  const [pricesByCode, setPricesByCode] = useState(initialCache.pricesByCode)
  const [pricesByCodeSell, setPricesByCodeSell] = useState(initialCache.pricesByCodeSell)
  const [rateItems, setRateItems] = useState(initialCache.rateItems)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPrice = useCallback(async () => {
    setLoading(true)
    setError(null)
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
      const rawItems = Array.isArray(payload?.data?.goldRates?.items) ? payload.data.goldRates.items : []
      const { rateItems: nextItems, pricesByCode: nextBuy, pricesByCodeSell: nextSell } = processGoldRateItems(rawItems)

      for (const item of rawItems) {
        const dt = parseLastUpdated(item?.last_updated)
        if (dt && (!latestDate || dt > latestDate)) latestDate = dt
      }

      setPricesByCode(nextBuy)
      setPricesByCodeSell(nextSell)
      setRateItems(nextItems)
      writeGoldRateItemsCache(nextItems)
      setLastUpdated(latestDate || new Date())
    } catch (e) {
      setError(e.message)
      const cached = processCachedItems(readGoldRateItemsCache())
      setPricesByCode(cached.pricesByCode)
      setPricesByCodeSell(cached.pricesByCodeSell)
      setRateItems(cached.rateItems)
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
