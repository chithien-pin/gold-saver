const GOLD_GRAPHQL_URL = 'https://baotinmanhhai.vn/api/graphql'
import https from 'node:https'
import { URL } from 'node:url'

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
    const upstream = await postJsonWithHttpsAgent(GOLD_GRAPHQL_URL, body)
    return res.status(upstream.ok ? 200 : upstream.status).json(upstream.data)
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Proxy error' })
  }
}

function postJsonWithHttpsAgent(url, payload) {
  const parsed = new URL(url)
  const body = JSON.stringify(payload)

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        // Upstream có thể trả chain cert thiếu trung gian ở một số runtime.
        // Chỉ dùng trong proxy server-side để tránh lỗi TLS khi deploy.
        rejectUnauthorized: false,
        headers: {
          Accept: 'application/graphql-response+json, application/json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Origin: 'https://baotinmanhhai.vn',
          Referer: 'https://baotinmanhhai.vn/vi/bang-gia-vang',
          'User-Agent': 'Mozilla/5.0 (compatible; GoldCalc/1.0)',
        },
      },
      (resp) => {
        let raw = ''
        resp.setEncoding('utf8')
        resp.on('data', (chunk) => {
          raw += chunk
        })
        resp.on('end', () => {
          let data = {}
          try {
            data = raw ? JSON.parse(raw) : {}
          } catch {
            data = { error: 'Invalid JSON from upstream', raw: raw.slice(0, 500) }
          }
          resolve({
            ok: (resp.statusCode || 500) >= 200 && (resp.statusCode || 500) < 300,
            status: resp.statusCode || 500,
            data,
          })
        })
      }
    )

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}
