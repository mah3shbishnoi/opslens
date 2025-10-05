import { githubFetch } from './client'
import type { GitHubCommitItem } from '@/types'

export async function fetchCommits(
  owner: string,
  repo: string,
  perPage = 60
): Promise<GitHubCommitItem[]> {
  const result = await githubFetch<GitHubCommitItem[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`
  )
  return result.data
}
