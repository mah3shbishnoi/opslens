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

  // Fetch real GitHub API data
  const loadRepository = async (repoString?: string) => {
    const target = (repoString || currentRepo.value).trim()
    if (!target) return

    const parts = target.split('/')
    if (parts.length !== 2) {
      errorMessage.value = 'Invalid repository format. Please use "owner/repository" (e.g. vuejs/core).'
      return
    }

    const [owner, repo] = parts
    isLoading.value = true
    errorMessage.value = null

    try {
      // Fetch repo metadata first
      const repoData = await fetchRepository(owner, repo)
      repository.value = repoData
      currentRepo.value = `${owner}/${repo}`
      localStorage.setItem('opslens-active-repo', currentRepo.value)
      isFallback.value = false

      // Fetch operational activity sub-resources in parallel
      const [prsRes, issuesRes, commitsRes, releasesRes, contribsRes] = await Promise.allSettled([
        fetchPullRequests(owner, repo, 'all', 60),
        fetchIssues(owner, repo, 'all', 60),
        fetchCommits(owner, repo, 60),
        fetchReleases(owner, repo, 20),
        fetchContributors(owner, repo, 30)
      ])

      pullRequests.value = prsRes.status === 'fulfilled' ? prsRes.value : []
      issues.value = issuesRes.status === 'fulfilled' ? issuesRes.value : []
      commits.value = commitsRes.status === 'fulfilled' ? commitsRes.value : []
      releases.value = releasesRes.status === 'fulfilled' ? releasesRes.value : []
      contributors.value = contribsRes.status === 'fulfilled' ? contribsRes.value : []

      rateLimit.value = getLastRateLimit()
      lastRefreshedAt.value = new Date()
    } catch (err: any) {
      console.warn('OpsLens: GitHub API failed, using curated demo dataset.', err)
      errorMessage.value = err.message || 'GitHub API unreachable.'
      loadFallbackData()
      rateLimit.value = getLastRateLimit()
    } finally {
      isLoading.value = false
    }
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
