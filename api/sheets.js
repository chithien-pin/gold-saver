const SHEETS_URL_BASE =
  'https://script.google.com/macros/s/AKfycbweCyrU5njzy38octPH8a7QvIR8h3UrKcY21KPz7k_RyaAQqM0SXEJDFzoHtANUykCy3w/exec'
const API_VERSION = '1'

function buildSheetsUrl(extraParams = '') {
  const versionParam = `version=${API_VERSION}`
  const qs = extraParams ? `${extraParams}&${versionParam}` : versionParam
  return `${SHEETS_URL_BASE}?${qs}`
}

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

  const fetchOpts = {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GoldCalc/1.0)',
      Accept: 'application/json',
    },
  }

  try {
    if (req.method === 'GET') {
      const sheet = req.query?.sheet
      const extra = sheet ? `sheet=${encodeURIComponent(sheet)}` : ''
      const url = buildSheetsUrl(extra)
      const r = await fetch(url, fetchOpts)
      const data = await r.json()
      return res.status(200).json(data)
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const r = await fetch(buildSheetsUrl(), {
      ...fetchOpts,
      method: 'POST',
      headers: { ...fetchOpts.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json().catch(() => ({}))
    return res.status(r.ok ? 200 : r.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
