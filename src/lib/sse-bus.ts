type Subscriber = (payload: string) => void

const subscribers = new Set<Subscriber>()

export function subscribe(fn: Subscriber) {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

export function broadcast(event: string, data: any) {
  const payload = `event: ${event}\n` +
                  `data: ${JSON.stringify(data)}\n\n`
  for (const fn of Array.from(subscribers)) {
    try {
      fn(payload)
    } catch {
      // ignore broken subscribers
    }
  }
}