/** Gold type options for forms and display */
export const GOLD_TYPES = [
  { value: 'SJC', label: 'SJC', multiplier: 1.08 },
  { value: '999', label: 'Vàng 999 (24K)', multiplier: 1 },
  { value: '9999', label: 'Vàng 9999', multiplier: 1 },
  { value: 'Nhan18K', label: 'Nhẫn Vàng 18K', multiplier: 0.75 },
  { value: 'Nhan14K', label: 'Nhẫn Vàng 14K', multiplier: 0.585 },
  { value: 'KimCuongVang', label: 'Kim Cương Vàng', multiplier: 1 },
  { value: 'BachKim950', label: 'Bạch Kim 950', multiplier: 0.5 },
  { value: 'Khac', label: 'Khác', multiplier: 1 },
]

export const USD_VND_RATE = 25400
export const CHI_PER_OZ = 3.75 / 31.1 // 1 chỉ = 3.75g, 1 troy oz = 31.1g
/** Mihong API: trả về giá VNĐ/chỉ, dùng trực tiếp */
export const MIHONG_API_BASE = 'https://api.mihong.vn/v1/gold-prices'
export const MIHONG_GOLD_CODES = ['SJC', '999']
export const STORAGE_KEY = 'gold_transactions'
export const PRICE_REFRESH_INTERVAL_MS = 60000

export function getMultiplierForGoldType(goldType) {
  const found = GOLD_TYPES.find((t) => t.value === goldType)
  return found ? found.multiplier : 1
}

export function getLabelForGoldType(goldType) {
  const found = GOLD_TYPES.find((t) => t.value === goldType)
  return found ? found.label : goldType
}
