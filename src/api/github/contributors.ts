import { githubFetch } from './client'
import type { GitHubContributor } from '@/types'

export async function fetchContributors(
  owner: string,
  repo: string,
  perPage = 30
): Promise<GitHubContributor[]> {
  const result = await githubFetch<GitHubContributor[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=${perPage}`
  )
  return result.data
}
