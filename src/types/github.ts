export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  html_url: string
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
  description?: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: GitHubUser
  description: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  language: string | null
  license: {
    key: string
    name: string
    spdx_id: string
  } | null
  pushed_at: string
  created_at: string
  updated_at: string
  html_url: string
  homepage: string | null
  topics?: string[]
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  merged_at: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  user: GitHubUser
  labels: GitHubLabel[]
  html_url: string
  draft: boolean
  comments: number
  body: string | null
  head: {
    ref: string
  }
  base: {
    ref: string
  }
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  closed_at: string | null
  user: GitHubUser
  labels: GitHubLabel[]
  html_url: string
  comments: number
  body: string | null
  pull_request?: {
    url: string
  }
}

export interface GitHubCommitItem {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: GitHubUser | null
  html_url: string
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  published_at: string
  author: GitHubUser
  html_url: string
  prerelease: boolean
  draft: boolean
}

export interface GitHubContributor {
  id: number
  login: string
  avatar_url: string
  contributions: number
  html_url: string
}

export interface ActivityItem {
  id: string
  type: 'pr_merged' | 'pr_opened' | 'commit_pushed' | 'issue_opened' | 'issue_closed' | 'release_published'
  title: string
  timestamp: string
  author: {
    login: string
    avatar_url: string
  }
  url: string
  meta?: string
}

export interface CommitDayStat {
  date: string
  label: string
  count: number
}

export interface DerivedMetrics {
  openWorkCount: number
  openPRsCount: number
  mergedPRsCount: number
  closedPRsCount: number
  openIssuesCount: number
  closedIssuesCount: number
  avgMergeTimeHours: number | null
  avgMergeTimeFormatted: string
  releaseCadenceDays: number | null
  releaseCadenceFormatted: string
  commitsLast30Days: number
  issueResolutionRatio: number
  velocityIndex: number
  commitActivity: CommitDayStat[]
  activityFeed: ActivityItem[]
}
