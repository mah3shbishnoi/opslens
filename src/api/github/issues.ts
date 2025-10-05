import { githubFetch } from './client'
import type { GitHubIssue } from '@/types'

export async function fetchIssues(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
  perPage = 60
): Promise<GitHubIssue[]> {
  const result = await githubFetch<GitHubIssue[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?state=${state}&per_page=${perPage}&sort=updated&direction=desc`
  )
  // Filter out pull requests which GitHub includes in issues response
  return result.data.filter(item => !item.pull_request)
}
