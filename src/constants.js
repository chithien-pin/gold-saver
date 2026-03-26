/** Gold type options for forms and display */
export const GOLD_TYPES = [
  { value: '999', label: 'Vàng 999 (24K)', multiplier: 1 },
  { value: 'SJC', label: 'SJC', multiplier: 1.08 },
]

export const USD_VND_RATE = 25400
export const CHI_PER_OZ = 3.75 / 31.1 // 1 chỉ = 3.75g, 1 troy oz = 31.1g
/** Mihong API: trả về giá VNĐ/chỉ, dùng trực tiếp */
export const MIHONG_API_BASE = 'https://api.mihong.vn/v1/gold-prices'
export const MIHONG_GOLD_CODES = ['SJC', '999']
export const STORAGE_KEY = 'gold_transactions'

/** Tên tab/sheet trong Google Sheet để chuyển đổi */
export const SHEET_TABS = ['GoldChild', 'GoldMom']
export const DEFAULT_SHEET = 'GoldChild'
export const PRICE_REFRESH_INTERVAL_MS = 60000

/** Google Apps Script Web App URL (read/write Google Sheet) */
export const SHEETS_API_URL =
  'https://script.google.com/macros/s/AKfycbweCyrU5njzy38octPH8a7QvIR8h3UrKcY21KPz7k_RyaAQqM0SXEJDFzoHtANUykCy3w/exec'

export function getMultiplierForGoldType(goldType) {
  const found = GOLD_TYPES.find((t) => t.value === goldType)
  return found ? found.multiplier : 1
}

export function getLabelForGoldType(goldType) {
  const found = GOLD_TYPES.find((t) => t.value === goldType)
  return found ? found.label : goldType
}
