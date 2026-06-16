const GOLD_GRAPHQL_URL = 'https://baotinmanhhai.vn/api/graphql'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const r = await fetch(GOLD_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/graphql-response+json, application/json',
        'Content-Type': 'application/json',
        Origin: 'https://baotinmanhhai.vn',
        Referer: 'https://baotinmanhhai.vn/vi/bang-gia-vang',
        'User-Agent': 'Mozilla/5.0 (compatible; GoldCalc/1.0)',
      },
      body: JSON.stringify(body),
    })

    const data = await r.json().catch(() => ({}))
    return res.status(r.ok ? 200 : r.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
