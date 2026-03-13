import { createHmac } from 'crypto'

const BASE_URL = 'https://open-api.bingx.com'

function getConfig() {
  const apiKey = process.env.BINGX_API_KEY
  const secretKey = process.env.BINGX_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw createError({ statusCode: 500, statusMessage: 'BingX API keys not configured' })
  }

  return { apiKey, secretKey }
}

function sign(params: Record<string, string>, secretKey: string): string {
  const sorted = Object.keys(params).sort()
  const queryString = sorted.map((k) => `${k}=${params[k]}`).join('&')
  return createHmac('sha256', secretKey).update(queryString).digest('hex')
}

export async function bingxRequest<T>(method: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const { apiKey, secretKey } = getConfig()

  params.timestamp = Date.now().toString()
  const signature = sign(params, secretKey)

  const queryString = Object.keys(params).sort().map((k) => `${k}=${encodeURIComponent(params[k])}`).join('&')
  const url = `${BASE_URL}${path}?${queryString}&signature=${signature}`

  const response = await fetch(url, {
    method,
    headers: {
      'X-BX-APIKEY': apiKey,
    },
  })

  const json = await response.json() as { code: number; msg: string; data: T }

  if (json.code !== 0) {
    throw createError({ statusCode: 502, statusMessage: `BingX API error: ${json.msg}` })
  }

  return json.data
}
