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

interface CachedApiResponse<T> {
  data: T
  rateLimit: RateLimitState
  timestamp: number
}

const API_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const apiResponseCache = new Map<string, CachedApiResponse<any>>()
const inFlightRequests = new Map<string, Promise<{ data: any; rateLimit: RateLimitState }>>()

export const clearApiCache = (): void => {
  apiResponseCache.clear()
  inFlightRequests.clear()
}

export async function githubFetch<T>(endpoint: string, force = false): Promise<{ data: T; rateLimit: RateLimitState }> {
  const token = getStoredToken()
  const cacheKey = `${token ? token.substring(0, 8) : 'anon'}:${endpoint}`

  if (!force) {
    const cached = apiResponseCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < API_CACHE_TTL_MS)) {
      return { data: cached.data as T, rateLimit: { ...lastRateLimit } }
    }

    const inFlight = inFlightRequests.get(cacheKey)
    if (inFlight) {
      return inFlight as Promise<{ data: T; rateLimit: RateLimitState }>
    }
  }

  const fetchPromise = (async () => {
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
    const result = { data, rateLimit: { ...lastRateLimit } }
    apiResponseCache.set(cacheKey, { data, rateLimit: { ...lastRateLimit }, timestamp: Date.now() })
    return result
  })()

  inFlightRequests.set(cacheKey, fetchPromise)

  try {
    return await fetchPromise
  } finally {
    inFlightRequests.delete(cacheKey)
  }
}
