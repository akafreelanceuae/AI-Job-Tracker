import { NextResponse } from 'next/server'
import { subscribe } from '@/lib/sse-bus'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!config.NOTIFICATIONS_SSE_ENABLED) {
    return NextResponse.json({ error: 'SSE disabled' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  let timer: any
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Initial retry directive
      controller.enqueue(encoder.encode('retry: 15000\n\n'))

      // Subscribe to bus
      const unsub = subscribe((payload) => {
        controller.enqueue(encoder.encode(payload))
      })

      // Heartbeat
      timer = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'))
      }, 20000)

      // Close handler
      const close = () => {
        try { clearInterval(timer) } catch {}
        unsub()
        controller.close()
      }
      // @ts-ignore - not available in type but supported
      controller.signal?.addEventListener?.('abort', close)
    },
    cancel() {
      try { clearInterval(timer) } catch {}
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}