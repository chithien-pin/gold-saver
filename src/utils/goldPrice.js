import { getMultiplierForGoldType } from '../constants'

/**
 * Get current price per chỉ in VNĐ for a gold type.
 * Prefer Mihong prices when available (pricesByCode), else use spot base × multiplier.
 * @param {number} spotVndPerChi - base price (e.g. 999 from API)
 * @param {string} goldType - e.g. 'SJC', '999', 'Nhan18K'
 * @param {{ SJC?: number, '999'?: number }} [pricesByCode] - optional map from Mihong API (price per chỉ)
 */
export function getPricePerChiForType(spotVndPerChi, goldType, pricesByCode = null) {
  if (pricesByCode) {
    if (goldType === 'SJC' && pricesByCode.SJC != null) return pricesByCode.SJC
    if ((goldType === '999' || goldType === '9999' || goldType === 'KimCuongVang' || goldType === 'Khac') && pricesByCode['999'] != null)
      return pricesByCode['999']
  }
  const mult = getMultiplierForGoldType(goldType)
  return (spotVndPerChi || 0) * mult
}

/**
 * Get current sell price per chỉ in VNĐ for a gold type.
 * Uses pricesByCodeSell from Mihong when available, else fallback to spot × multiplier.
 */
export function getSellPricePerChiForType(spotVndPerChi, goldType, pricesByCodeSell = null) {
  if (pricesByCodeSell) {
    if (goldType === 'SJC' && pricesByCodeSell.SJC != null) return pricesByCodeSell.SJC
    if ((goldType === '999' || goldType === '9999' || goldType === 'KimCuongVang' || goldType === 'Khac') && pricesByCodeSell['999'] != null)
      return pricesByCodeSell['999']
  }
  const mult = getMultiplierForGoldType(goldType)
  return (spotVndPerChi || 0) * mult
}
