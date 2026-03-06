const SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbzPWngdu72Q2Ge2xHRNZUmQlszrc3smRI0qEeiti7FqCNGt9ibsaqpTgTGiB7QvFgLj3g/exec'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(SHEETS_URL)
      const data = await r.json()
      return res.status(200).json(data)
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const r = await fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json().catch(() => ({}))
    return res.status(r.ok ? 200 : r.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
