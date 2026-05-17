const DEMO_EMAIL = 'user@example.com'
const DEMO_PASSWORD = 'string'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const DEMO_KEY = 'docintel_demo'

type Callback = () => void
let onActivated: Callback | null = null

export function onDemoActivated(cb: Callback) {
  onActivated = cb
}

// Deduplicates concurrent calls — only one fetch in flight at a time
let pending: Promise<string> | null = null

export async function getDemoToken(): Promise<string> {
  const existing = localStorage.getItem('access_token')
  if (existing) return existing

  if (!pending) {
    pending = fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: DEMO_EMAIL, password: DEMO_PASSWORD }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Demo login failed')
        return r.json() as Promise<{ access_token: string }>
      })
      .then(({ access_token }) => {
        localStorage.setItem('access_token', access_token)
        localStorage.setItem(DEMO_KEY, '1')
        pending = null
        onActivated?.()
        return access_token
      })
      .catch((err) => {
        pending = null
        throw err
      })
  }

  return pending
}

export function isDemoStored(): boolean {
  return localStorage.getItem(DEMO_KEY) === '1'
}

export function clearDemoMode(): void {
  localStorage.removeItem(DEMO_KEY)
}
