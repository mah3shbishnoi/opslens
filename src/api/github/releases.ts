import { githubFetch } from './client'
import type { GitHubRelease } from '@/types'

export async function fetchReleases(
  owner: string,
  repo: string,
  perPage = 25
): Promise<GitHubRelease[]> {
  const result = await githubFetch<GitHubRelease[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=${perPage}`
  )
  return result.data
}
