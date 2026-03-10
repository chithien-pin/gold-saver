/**
 * Proxy URL để tránh CORS (gọi qua Vercel serverless hoặc Vite proxy trong dev)
 */
const SHEETS_API_BASE = '/api/sheets'

/**
 * Normalize row from Sheet (numbers may come as strings)
 */
function normalizeTransaction(row) {
  return {
    id: row.id != null ? String(row.id) : '',
    type: row.type === 'sell' || row.type === 'buy' ? row.type : 'buy',
    goldType: row.goldType != null ? String(row.goldType) : '',
    quantity: Number(row.quantity) || 0,
    pricePerChi: Number(row.pricePerChi) || 0,
    date: row.date != null ? String(row.date) : '',
    note: row.note != null ? String(row.note) : '',
  }
}

/**
 * GET: fetch all transactions from Google Sheet (qua proxy)
 * @param {string} sheet - Tên sheet (tab) trong Google Sheet, e.g. 'Vàng Con', 'Vàng Mẹ'
 */
export async function getTransactions(sheet) {
  const url = sheet ? `${SHEETS_API_BASE}?sheet=${encodeURIComponent(sheet)}` : SHEETS_API_BASE
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : []
  return list.map(normalizeTransaction)
}

/**
 * POST: add one transaction
 * @param {object} tx - Transaction data
 * @param {string} sheet - Tên sheet (tab)
 */
export async function addTransaction(tx, sheet) {
  const body = {
    id: tx.id,
    type: tx.type,
    goldType: tx.goldType,
    quantity: tx.quantity,
    pricePerChi: tx.pricePerChi,
    date: tx.date,
    note: tx.note || '',
  }
  if (sheet) body.sheet = sheet
  const res = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json().catch(() => ({}))
  return data
}

/**
 * POST: delete one transaction by id
 * @param {string} id
 * @param {string} sheet - Tên sheet (tab)
 */
export async function deleteTransaction(id, sheet) {
  const body = { action: 'delete', id }
  if (sheet) body.sheet = sheet
  const res = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json().catch(() => ({}))
  return data
}
