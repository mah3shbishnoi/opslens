import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchRepository } from '@/api/github/repositories'
import { fetchPullRequests } from '@/api/github/pullRequests'
import { fetchIssues } from '@/api/github/issues'
import { fetchCommits } from '@/api/github/commits'
import { fetchReleases } from '@/api/github/releases'
import { fetchContributors } from '@/api/github/contributors'
import { getLastRateLimit, type RateLimitState } from '@/api/github/client'
import {
  FALLBACK_REPO,
  FALLBACK_PULL_REQUESTS,
  FALLBACK_ISSUES,
  FALLBACK_COMMITS,
  FALLBACK_RELEASES,
  FALLBACK_CONTRIBUTORS
} from '@/data/fallbackData'
import type {
  GitHubRepository,
  GitHubPullRequest,
  GitHubIssue,
  GitHubCommitItem,
  GitHubRelease,
  GitHubContributor,
  ActivityItem,
  CommitDayStat
} from '@/types'

export const useRepositoryStore = defineStore('repository', () => {
  const currentRepo = ref<string>('vuejs/core')
  try {
    const saved = localStorage.getItem('opslens-active-repo')
    if (saved) currentRepo.value = saved
  } catch {}

  const repository = ref<GitHubRepository | null>(null)
  const pullRequests = ref<GitHubPullRequest[]>([])
  const issues = ref<GitHubIssue[]>([])
  const commits = ref<GitHubCommitItem[]>([])
  const releases = ref<GitHubRelease[]>([])
  const contributors = ref<GitHubContributor[]>([])

  const isLoading = ref<boolean>(false)
  const isFallback = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)
  const rateLimit = ref<RateLimitState>(getLastRateLimit())
  const lastRefreshedAt = ref<Date>(new Date())
  const activeRoute = ref<string>('overview')

  // In-Memory Cache with 5-Minute TTL (300,000 ms)
  interface CacheEntry<T> {
    data: T
    timestamp: number
  }

  const CACHE_TTL_MS = 5 * 60 * 1000
  const cache = new Map<string, CacheEntry<any>>()

  const getCached = <T>(key: string): T | null => {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key)
      return null
    }
    return entry.data as T
  }

  const setCached = <T>(key: string, data: T) => {
    cache.set(key, { data, timestamp: Date.now() })
  }

  const clearCache = (prefix?: string) => {
    if (prefix) {
      for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key)
      }
    } else {
      cache.clear()
    }
  }

  // Load fallback data
  const loadFallbackData = () => {
    repository.value = FALLBACK_REPO
    pullRequests.value = FALLBACK_PULL_REQUESTS
    issues.value = FALLBACK_ISSUES
    commits.value = FALLBACK_COMMITS
    releases.value = FALLBACK_RELEASES
    contributors.value = FALLBACK_CONTRIBUTORS
    isFallback.value = true
    lastRefreshedAt.value = new Date()
  }

  type ResourceType = 'repo' | 'prs' | 'issues' | 'commits' | 'releases' | 'contributors'

  const ROUTE_RESOURCE_MAP: Record<string, ResourceType[]> = {
    overview: ['repo', 'prs', 'issues', 'commits', 'releases'],
    'pull-requests': ['repo', 'prs'],
    issues: ['repo', 'issues'],
    commits: ['repo', 'commits'],
    releases: ['repo', 'releases'],
    contributors: ['repo', 'contributors'],
    settings: ['repo']
  }

  // Route-aware on-demand lazy loader
  const loadForRoute = async (routeName: string, force = false) => {
    activeRoute.value = routeName || 'overview'
    const target = currentRepo.value.trim()
    if (!target) return

    const parts = target.split('/')
    if (parts.length !== 2) {
      errorMessage.value = 'Invalid repository format. Please use "owner/repository" (e.g. vuejs/core).'
      return
    }

    const [owner, repo] = parts
    const resourcesToLoad = ROUTE_RESOURCE_MAP[activeRoute.value] || ['repo', 'prs', 'issues', 'commits', 'releases']

    isLoading.value = true
    errorMessage.value = null

    try {
      const promises: Promise<any>[] = []

      // 1. Repo metadata (required across views)
      const repoKey = `${owner}/${repo}:meta`
      const cachedRepo = getCached<GitHubRepository>(repoKey)
      if (!force && cachedRepo) {
        repository.value = cachedRepo
      } else {
        promises.push(
          fetchRepository(owner, repo)
            .then((data) => {
              repository.value = data
              setCached(repoKey, data)
              isFallback.value = false
            })
            .catch((err) => {
              console.warn('OpsLens: Failed to fetch repository metadata', err)
              if (!repository.value) repository.value = FALLBACK_REPO
              isFallback.value = true
            })
        )
      }

      // 2. Pull Requests
      if (resourcesToLoad.includes('prs')) {
        const prsKey = `${owner}/${repo}:prs`
        const cachedPRs = getCached<GitHubPullRequest[]>(prsKey)
        if (!force && cachedPRs) {
          pullRequests.value = cachedPRs
        } else {
          promises.push(
            fetchPullRequests(owner, repo, 'all', 60)
              .then((data) => {
                pullRequests.value = data
                setCached(prsKey, data)
              })
              .catch((err) => {
                console.warn('OpsLens: Failed to fetch pull requests', err)
                if (pullRequests.value.length === 0) pullRequests.value = FALLBACK_PULL_REQUESTS
              })
          )
        }
      }

      // 3. Issues
      if (resourcesToLoad.includes('issues')) {
        const issuesKey = `${owner}/${repo}:issues`
        const cachedIssues = getCached<GitHubIssue[]>(issuesKey)
        if (!force && cachedIssues) {
          issues.value = cachedIssues
        } else {
          promises.push(
            fetchIssues(owner, repo, 'all', 60)
              .then((data) => {
                issues.value = data
                setCached(issuesKey, data)
              })
              .catch((err) => {
                console.warn('OpsLens: Failed to fetch issues', err)
                if (issues.value.length === 0) issues.value = FALLBACK_ISSUES
              })
          )
        }
      }

      // 4. Commits
      if (resourcesToLoad.includes('commits')) {
        const commitsKey = `${owner}/${repo}:commits`
        const cachedCommits = getCached<GitHubCommitItem[]>(commitsKey)
        if (!force && cachedCommits) {
          commits.value = cachedCommits
        } else {
          promises.push(
            fetchCommits(owner, repo, 60)
              .then((data) => {
                commits.value = data
                setCached(commitsKey, data)
              })
              .catch((err) => {
                console.warn('OpsLens: Failed to fetch commits', err)
                if (commits.value.length === 0) commits.value = FALLBACK_COMMITS
              })
          )
        }
      }

      // 5. Releases
      if (resourcesToLoad.includes('releases')) {
        const releasesKey = `${owner}/${repo}:releases`
        const cachedReleases = getCached<GitHubRelease[]>(releasesKey)
        if (!force && cachedReleases) {
          releases.value = cachedReleases
        } else {
          promises.push(
            fetchReleases(owner, repo, 20)
              .then((data) => {
                releases.value = data
                setCached(releasesKey, data)
              })
              .catch((err) => {
                console.warn('OpsLens: Failed to fetch releases', err)
                if (releases.value.length === 0) releases.value = FALLBACK_RELEASES
              })
          )
        }
      }

      // 6. Contributors
      if (resourcesToLoad.includes('contributors')) {
        const contribsKey = `${owner}/${repo}:contribs`
        const cachedContribs = getCached<GitHubContributor[]>(contribsKey)
        if (!force && cachedContribs) {
          contributors.value = cachedContribs
        } else {
          promises.push(
            fetchContributors(owner, repo, 30)
              .then((data) => {
                contributors.value = data
                setCached(contribsKey, data)
              })
              .catch((err) => {
                console.warn('OpsLens: Failed to fetch contributors', err)
                if (contributors.value.length === 0) contributors.value = FALLBACK_CONTRIBUTORS
              })
          )
        }
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises)
      }

      rateLimit.value = getLastRateLimit()
      lastRefreshedAt.value = new Date()
    } catch (err: any) {
      console.warn('OpsLens: GitHub API failed during route load', err)
      errorMessage.value = err.message || 'GitHub API unreachable.'
      loadFallbackData()
      rateLimit.value = getLastRateLimit()
    } finally {
      isLoading.value = false
    }
  }

  // Load or switch repository
  const loadRepository = async (repoString?: string, force = false) => {
    if (repoString && repoString.trim() && repoString.trim() !== currentRepo.value) {
      currentRepo.value = repoString.trim()
      localStorage.setItem('opslens-active-repo', currentRepo.value)
    }
    return loadForRoute(activeRoute.value, force)
  }

  const refreshActiveView = async (routeName?: string) => {
    return loadForRoute(routeName || activeRoute.value, true)
  }

  // Computed Derived Operational Metrics
  const openPRsCount = computed(() => pullRequests.value.filter(pr => pr.state === 'open').length)
  const mergedPRsCount = computed(() => pullRequests.value.filter(pr => pr.merged_at !== null).length)
  const closedPRsCount = computed(() => pullRequests.value.filter(pr => pr.state === 'closed' && !pr.merged_at).length)

  const openIssuesCount = computed(() => {
    if (repository.value) return repository.value.open_issues_count
    return issues.value.filter(i => i.state === 'open').length
  })
  const closedIssuesCount = computed(() => issues.value.filter(i => i.state === 'closed').length)

  const openWorkCount = computed(() => openPRsCount.value + openIssuesCount.value)

  // PR Merge Velocity (Average time between created_at and merged_at)
  const avgMergeTimeHours = computed<number | null>(() => {
    const mergedList = pullRequests.value.filter(pr => pr.merged_at !== null)
    if (mergedList.length === 0) return null

    let totalDurationMs = 0
    let validCount = 0

    mergedList.forEach(pr => {
      const created = new Date(pr.created_at).getTime()
      const merged = new Date(pr.merged_at!).getTime()
      if (merged > created) {
        totalDurationMs += (merged - created)
        validCount++
      }
    })

    if (validCount === 0) return null
    const avgMs = totalDurationMs / validCount
    return Number((avgMs / (1000 * 60 * 60)).toFixed(1))
  })

  const avgMergeTimeFormatted = computed<string>(() => {
    if (avgMergeTimeHours.value === null) return 'N/A'
    if (avgMergeTimeHours.value < 24) {
      return `${avgMergeTimeHours.value} hrs`
    }
    const days = (avgMergeTimeHours.value / 24).toFixed(1)
    return `${days} days`
  })

  // Release Cadence (Average days between releases)
  const releaseCadenceDays = computed<number | null>(() => {
    if (releases.value.length < 2) return null
    const sorted = [...releases.value].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )

    const newest = new Date(sorted[0].published_at).getTime()
    const oldest = new Date(sorted[sorted.length - 1].published_at).getTime()
    const diffDays = (newest - oldest) / (1000 * 60 * 60 * 24)

    return Number((diffDays / (sorted.length - 1)).toFixed(1))
  })

  const releaseCadenceFormatted = computed<string>(() => {
    if (releaseCadenceDays.value === null) return 'Periodic'
    return `Every ${releaseCadenceDays.value} days`
  })

  // Commits in last 30 days
  const commitsLast30Days = computed(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return commits.value.filter(c => new Date(c.commit.author.date).getTime() >= cutoff).length
  })

  // Issue Resolution Ratio
  const issueResolutionRatio = computed(() => {
    const total = openIssuesCount.value + closedIssuesCount.value
    if (total === 0) return 0
    return Math.round((closedIssuesCount.value / total) * 100)
  })

  // Engineering Velocity Index (Transparent formula: commits * 1.5 + mergedPRs * 3 + closedIssues * 2)
  const velocityIndex = computed(() => {
    const score = Math.round(
      commits.value.length * 1.5 +
      mergedPRsCount.value * 3.0 +
      closedIssuesCount.value * 2.0
    )
    return score
  })

  // Commit Trend Data (Past 30 days daily buckets)
  const commitActivityTrend = computed<CommitDayStat[]>(() => {
    const buckets: Record<string, number> = {}
    const now = new Date()

    // Initialize 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000)
      const key = d.toISOString().split('T')[0]
      buckets[key] = 0
    }

    // Populate from commits
    commits.value.forEach(c => {
      const dateKey = c.commit.author.date.split('T')[0]
      if (buckets[dateKey] !== undefined) {
        buckets[dateKey]++
      }
    })

    return Object.entries(buckets).map(([date, count]) => {
      const d = new Date(date)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return { date, label, count }
    })
  })

  // Chronological Unified Activity Feed
  const activityFeed = computed<ActivityItem[]>(() => {
    const feed: ActivityItem[] = []

    // PRs
    pullRequests.value.forEach(pr => {
      if (pr.merged_at) {
        feed.push({
          id: `pr-merged-${pr.id}`,
          type: 'pr_merged',
          title: `Merged PR #${pr.number}: ${pr.title}`,
          timestamp: pr.merged_at,
          author: { login: pr.user.login, avatar_url: pr.user.avatar_url },
          url: pr.html_url,
          meta: pr.head.ref
        })
      } else {
        feed.push({
          id: `pr-opened-${pr.id}`,
          type: 'pr_opened',
          title: `Opened PR #${pr.number}: ${pr.title}`,
          timestamp: pr.created_at,
          author: { login: pr.user.login, avatar_url: pr.user.avatar_url },
          url: pr.html_url,
          meta: pr.head.ref
        })
      }
    })

    // Commits
    commits.value.slice(0, 15).forEach(c => {
      const authorLogin = c.author?.login || c.commit.author.name
      const avatar = c.author?.avatar_url || 'https://github.com/github.png'
      feed.push({
        id: `commit-${c.sha}`,
        type: 'commit_pushed',
        title: `Pushed commit ${c.sha.substring(0, 7)}: ${c.commit.message.split('\n')[0]}`,
        timestamp: c.commit.author.date,
        author: { login: authorLogin, avatar_url: avatar },
        url: c.html_url,
        meta: c.sha.substring(0, 7)
      })
    })

    // Releases
    releases.value.forEach(rel => {
      feed.push({
        id: `release-${rel.id}`,
        type: 'release_published',
        title: `Published milestone release ${rel.tag_name}`,
        timestamp: rel.published_at,
        author: { login: rel.author.login, avatar_url: rel.author.avatar_url },
        url: rel.html_url,
        meta: rel.tag_name
      })
    })

    // Sort descending by timestamp
    return feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 25)
  })

  return {
    currentRepo,
    repository,
    pullRequests,
    issues,
    commits,
    releases,
    contributors,
    isLoading,
    isFallback,
    errorMessage,
    rateLimit,
    lastRefreshedAt,
    loadRepository,
    loadForRoute,
    refreshActiveView,
    clearCache,
    loadFallbackData,
    openWorkCount,
    openPRsCount,
    mergedPRsCount,
    closedPRsCount,
    openIssuesCount,
    closedIssuesCount,
    avgMergeTimeHours,
    avgMergeTimeFormatted,
    releaseCadenceDays,
    releaseCadenceFormatted,
    commitsLast30Days,
    issueResolutionRatio,
    velocityIndex,
    commitActivityTrend,
    activityFeed
  }
})
