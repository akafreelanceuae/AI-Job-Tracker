type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function maskValue(v: any): any {
  if (v == null) return v
  const s = String(v)
  if (s.length <= 4) return '****'
  return s.slice(0, 2) + '****' + s.slice(-2)
}

function redact(obj: any): any {
  if (obj == null) return obj
  if (Array.isArray(obj)) return obj.map(redact)
  if (typeof obj !== 'object') return obj
  const SENSITIVE_KEYS = new Set([
    'token', 'access_token', 'refresh_token', 'id_token', 'apiKey', 'authorization', 'password', 'email'
  ])
  const out: any = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (SENSITIVE_KEYS.has(k)) {
      out[k] = maskValue(v)
    } else if (typeof v === 'object' && v !== null) {
      out[k] = redact(v)
    } else {
      out[k] = v
    }
  })
  return out
}

function log(level: LogLevel, message: string, meta?: any) {
  const payload = meta ? redact(meta) : undefined
  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, payload)
      break
    case 'info':
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, payload)
      break
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, payload)
      break
    case 'error':
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, payload)
      break
  }
}

export const logger = {
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
  info: (msg: string, meta?: any) => log('info', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
  redact,
}