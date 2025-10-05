import { githubFetch } from './client'
import type { GitHubRepository } from '@/types'

export async function fetchRepository(owner: string, repo: string): Promise<GitHubRepository> {
  const result = await githubFetch<GitHubRepository>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
  return result.data
}
