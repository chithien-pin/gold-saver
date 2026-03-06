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
 */
export async function getTransactions() {
  const res = await fetch(SHEETS_API_BASE)
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : []
  return list.map(normalizeTransaction)
}

/**
 * POST: add one transaction
 */
export async function addTransaction(tx) {
  const res = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: tx.id,
      type: tx.type,
      goldType: tx.goldType,
      quantity: tx.quantity,
      pricePerChi: tx.pricePerChi,
      date: tx.date,
      note: tx.note || '',
    }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json().catch(() => ({}))
  return data
}

/**
 * POST: delete one transaction by id
 */
export async function deleteTransaction(id) {
  const res = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json().catch(() => ({}))
  return data
}
