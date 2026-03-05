/**
 * Format number as VNĐ with thousand separators
 * @param {number} value
 * @returns {string} e.g. "8,500,000 đ"
 */
export function formatVND(value) {
  if (value == null || Number.isNaN(value)) return '— đ'
  return (
    Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ'
  )
}

/**
 * Format number with optional decimals
 */
export function formatNumber(value, decimals = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  return Number(value).toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format percent (e.g. +12.5% or -3.2%)
 */
export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

/**
 * Format date for display (DD/MM/YYYY)
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
