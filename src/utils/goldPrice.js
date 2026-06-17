import { getMultiplierForGoldType, GOLD_RATE_CODES } from '../constants'

/** Giá > ngưỡng này là VNĐ/chỉ; ngược lại là VNĐ/0.1 chỉ */
export const CHI_PRICE_THRESHOLD_VND = 5_000_000

export function normalizeRateText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function isSilverRateItem(item) {
  const text = normalizeRateText(`${item?.name || ''} ${item?.code || ''}`)
  return text.includes('bac') || text.includes('silver')
}

export function parseApiPrice(value) {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const digitsOnly = String(value).replace(/[^\d.-]/g, '')
  const num = Number(digitsOnly)
  return Number.isFinite(num) ? num : null
}

/** Chuẩn hóa giá API về VNĐ/chỉ */
export function normalizeToPricePerChi(price) {
  if (price == null || !Number.isFinite(price)) return null
  if (price > CHI_PRICE_THRESHOLD_VND) return price
  return price * 10
}

function normalizeMappedCode(item) {
  const rawCode = String(item?.code || '').trim().toUpperCase()
  const rawName = String(item?.name || '').trim().toUpperCase()
  if (rawCode.includes('SJC') || rawName.includes('SJC')) return 'SJC'
  if (rawCode === '999' || rawCode === '9999') return '999'
  if (rawName.includes('999')) return '999'
  return rawCode
}

export function processGoldRateItems(rawItems) {
  const nextBuy = {}
  const nextSell = {}
  const nextItems = []

  for (const item of Array.isArray(rawItems) ? rawItems : []) {
    if (isSilverRateItem(item)) continue

    const rawCode = String(item?.code || '').trim()
    const rawName = String(item?.name || '').trim()
    const mappedCode = normalizeMappedCode(item)
    const buy = normalizeToPricePerChi(parseApiPrice(item?.buy_price))
    const sell = normalizeToPricePerChi(parseApiPrice(item?.sell_price))

    nextItems.push({
      code: rawCode || mappedCode,
      name: rawName || mappedCode,
      buyPrice: buy,
      sellPrice: sell,
    })

    if (rawCode) {
      if (buy != null) nextBuy[rawCode] = buy
      if (sell != null) nextSell[rawCode] = sell
    }
    if (rawName) {
      if (buy != null) nextBuy[rawName] = buy
      if (sell != null) nextSell[rawName] = sell
    }
    if (GOLD_RATE_CODES.includes(mappedCode)) {
      if (buy != null) nextBuy[mappedCode] = buy
      if (sell != null) nextSell[mappedCode] = sell
    }
  }

  return { rateItems: nextItems, pricesByCode: nextBuy, pricesByCodeSell: nextSell }
}

export function pickTieuKimCatPricePerChi(rateItems) {
  const found = (Array.isArray(rateItems) ? rateItems : []).find((item) => {
    const text = `${item?.name || ''} ${item?.code || ''}`
    return normalizeRateText(text).includes('tieu kim cat')
  })
  if (!found) return null
  return found.sellPrice ?? found.buyPrice ?? null
}

/**
 * Get current price per chỉ in VNĐ for a gold type.
 * Prefer live API prices when available (pricesByCode), else use spot base × multiplier.
 * @param {number} spotVndPerChi - base price (e.g. 999 from API)
 * @param {string} goldType - e.g. 'SJC', '999', 'Nhan18K'
 * @param {{ SJC?: number, '999'?: number }} [pricesByCode] - optional map from gold-rate API (price per chỉ)
 */
export function getPricePerChiForType(spotVndPerChi, goldType, pricesByCode = null) {
  if (pricesByCode) {
    if (pricesByCode[goldType] != null) return pricesByCode[goldType]
    if (goldType === 'SJC' && pricesByCode.SJC != null) return pricesByCode.SJC
    if ((goldType === '999' || goldType === '9999' || goldType === 'KimCuongVang' || goldType === 'Khac') && pricesByCode['999'] != null)
      return pricesByCode['999']
  }
  const mult = getMultiplierForGoldType(goldType)
  return (spotVndPerChi || 0) * mult
}

/**
 * Get current sell price per chỉ in VNĐ for a gold type.
 * Uses pricesByCodeSell from gold-rate API when available, else fallback to spot × multiplier.
 */
export function getSellPricePerChiForType(spotVndPerChi, goldType, pricesByCodeSell = null) {
  if (pricesByCodeSell) {
    if (pricesByCodeSell[goldType] != null) return pricesByCodeSell[goldType]
    if (goldType === 'SJC' && pricesByCodeSell.SJC != null) return pricesByCodeSell.SJC
    if ((goldType === '999' || goldType === '9999' || goldType === 'KimCuongVang' || goldType === 'Khac') && pricesByCodeSell['999'] != null)
      return pricesByCodeSell['999']
  }
  const mult = getMultiplierForGoldType(goldType)
  return (spotVndPerChi || 0) * mult
}
