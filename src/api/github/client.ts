export interface RateLimitState {
  remaining: number
  limit: number
  resetTime: Date
}

let lastRateLimit: RateLimitState = {
  remaining: 60,
  limit: 60,
  resetTime: new Date(Date.now() + 3600000)
}

export const getStoredToken = (): string => {
  try {
    return localStorage.getItem('opslens-github-token') || ''
  } catch {
    return ''
  }
}

export const setStoredToken = (token: string): void => {
  try {
    if (token) {
      localStorage.setItem('opslens-github-token', token)
    } else {
      localStorage.removeItem('opslens-github-token')
    }
  } catch {}
}

export const getLastRateLimit = (): RateLimitState => ({ ...lastRateLimit })

export class GitHubApiError extends Error {
  status: number
  isRateLimit: boolean
  isNotFound: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.isRateLimit = status === 403 || status === 429
    this.isNotFound = status === 404
  }
}

export async function githubFetch<T>(endpoint: string): Promise<{ data: T; rateLimit: RateLimitState }> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'OpsLens-Engineering-Console'
  }

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`

  const response = await fetch(url, { headers })

  // Read rate limit headers if present
  const remainingHeader = response.headers.get('x-ratelimit-remaining')
  const limitHeader = response.headers.get('x-ratelimit-limit')
  const resetHeader = response.headers.get('x-ratelimit-reset')

  if (remainingHeader && limitHeader) {
    const remaining = parseInt(remainingHeader, 10)
    const limit = parseInt(limitHeader, 10)
    const resetTime = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000) : new Date(Date.now() + 3600000)

    lastRateLimit = { remaining, limit, resetTime }
  }

  if (!response.ok) {
    let errorMessage = `GitHub API request failed with status ${response.status}`
    try {
      const errorBody = await response.json()
      if (errorBody && errorBody.message) {
        errorMessage = errorBody.message
      }
    } catch {}

    throw new GitHubApiError(errorMessage, response.status)
  }

  const data = (await response.json()) as T
  return { data, rateLimit: { ...lastRateLimit } }
}
