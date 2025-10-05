import { githubFetch } from './client'
import type { GitHubPullRequest } from '@/types'

export async function fetchPullRequests(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
  perPage = 60
): Promise<GitHubPullRequest[]> {
  const result = await githubFetch<GitHubPullRequest[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=${state}&per_page=${perPage}&sort=updated&direction=desc`
  )
  return result.data
}
