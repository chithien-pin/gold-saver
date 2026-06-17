const GOLD_RATE_ITEMS_CACHE_KEY = 'gold_rate_items'

export function readGoldRateItemsCache() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GOLD_RATE_ITEMS_CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeGoldRateItemsCache(items) {
  if (typeof window === 'undefined') return
  try {
    const list = Array.isArray(items) ? items : []
    window.localStorage.setItem(GOLD_RATE_ITEMS_CACHE_KEY, JSON.stringify(list))
  } catch {
    // Ignore cache errors (quota/private mode).
  }
}
