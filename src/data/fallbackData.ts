import type {
  GitHubRepository,
  GitHubPullRequest,
  GitHubIssue,
  GitHubCommitItem,
  GitHubRelease,
  GitHubContributor
} from '@/types'

export const FALLBACK_REPO: GitHubRepository = {
  id: 11730342,
  name: 'core',
  full_name: 'vuejs/core',
  owner: {
    id: 6128107,
    login: 'vuejs',
    avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
    html_url: 'https://github.com/vuejs'
  },
  description: '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
  stargazers_count: 48920,
  forks_count: 8140,
  open_issues_count: 482,
  default_branch: 'main',
  language: 'TypeScript',
  license: {
    key: 'mit',
    name: 'MIT License',
    spdx_id: 'MIT'
  },
  pushed_at: '2025-10-05T14:10:00Z',
  created_at: '2018-09-18T16:12:01Z',
  updated_at: '2025-10-05T14:22:00Z',
  html_url: 'https://github.com/vuejs/core',
  homepage: 'https://vuejs.org',
  topics: ['vue', 'frontend', 'framework', 'typescript', 'compiler', 'reactivity']
}

export const FALLBACK_PULL_REQUESTS: GitHubPullRequest[] = [
  {
    id: 12401,
    number: 12401,
    title: 'fix(reactivity): trigger shallowReactive effects on nested property access with deep watch',
    state: 'open',
    merged_at: null,
    created_at: '2025-10-04T18:22:10Z',
    updated_at: '2025-10-05T11:05:00Z',
    closed_at: null,
    user: {
      id: 499550,
      login: 'yyx990803',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      html_url: 'https://github.com/yyx990803'
    },
    labels: [
      { id: 1, name: 'scope: reactivity', color: 'c2e0c6', description: 'Reactivity subsystem' },
      { id: 2, name: 'has PR', color: '0075ca' }
    ],
    html_url: 'https://github.com/vuejs/core/pull/12401',
    draft: false,
    comments: 4,
    body: 'Resolves issue with deep watcher tracking on shallow reactive instances when custom ref unwrapping occurs in runtime core.',
    head: { ref: 'fix/shallow-reactive-deep' },
    base: { ref: 'main' }
  },
  {
    id: 12398,
    number: 12398,
    title: 'feat(compiler-sfc): support import attributes with syntax in script setup blocks',
    state: 'closed',
    merged_at: '2025-10-04T14:30:00Z',
    created_at: '2025-10-03T09:15:00Z',
    updated_at: '2025-10-04T14:30:00Z',
    closed_at: '2025-10-04T14:30:00Z',
    user: {
      id: 664177,
      login: 'antfu',
      avatar_url: 'https://avatars.githubusercontent.com/u/664177?v=4',
      html_url: 'https://github.com/antfu'
    },
    labels: [
      { id: 3, name: 'scope: compiler-sfc', color: 'fef2c0', description: 'SFC compiler' },
      { id: 4, name: 'feature', color: 'a2eeef' }
    ],
    html_url: 'https://github.com/vuejs/core/pull/12398',
    draft: false,
    comments: 8,
    body: 'Aligns compiler-sfc with the ECMAScript import attributes stage 3 proposal.',
    head: { ref: 'feat/sfc-import-attrs' },
    base: { ref: 'main' }
  },
  {
    id: 12394,
    number: 12394,
    title: 'perf(runtime-core): avoid redundant vnode normalization in keyed v-for lists',
    state: 'closed',
    merged_at: '2025-10-02T19:40:00Z',
    created_at: '2025-10-01T16:20:00Z',
    updated_at: '2025-10-02T19:40:00Z',
    closed_at: '2025-10-02T19:40:00Z',
    user: {
      id: 3277634,
      login: 'sodatea',
      avatar_url: 'https://avatars.githubusercontent.com/u/3277634?v=4',
      html_url: 'https://github.com/sodatea'
    },
    labels: [
      { id: 5, name: 'scope: runtime-core', color: 'd4c5f9' },
      { id: 6, name: 'performance', color: 'bfdadc' }
    ],
    html_url: 'https://github.com/vuejs/core/pull/12394',
    draft: false,
    comments: 6,
    body: 'Reduces GC allocations during bulk list reordering by caching normalized child keys.',
    head: { ref: 'perf/keyed-vfor-alloc' },
    base: { ref: 'main' }
  },
  {
    id: 12390,
    number: 12390,
    title: 'fix(ssr): preserve teleport target attributes during hydration mismatch recovery',
    state: 'closed',
    merged_at: '2025-09-29T11:10:00Z',
    created_at: '2025-09-28T14:40:00Z',
    updated_at: '2025-09-29T11:10:00Z',
    closed_at: '2025-09-29T11:10:00Z',
    user: {
      id: 841294,
      login: 'HaozhenXu',
      avatar_url: 'https://avatars.githubusercontent.com/u/841294?v=4',
      html_url: 'https://github.com/HaozhenXu'
    },
    labels: [
      { id: 7, name: 'scope: ssr', color: 'fbca04' },
      { id: 8, name: 'bug', color: 'd73a4a' }
    ],
    html_url: 'https://github.com/vuejs/core/pull/12390',
    draft: false,
    comments: 3,
    body: 'Ensures Teleport elements correctly re-anchor when client-side hydration recovers from mismatch.',
    head: { ref: 'fix/ssr-teleport-hydrate' },
    base: { ref: 'main' }
  },
  {
    id: 12385,
    number: 12385,
    title: 'docs: clarify custom element shadowRoot delegation in defineCustomElement',
    state: 'closed',
    merged_at: '2025-09-27T08:50:00Z',
    created_at: '2025-09-26T17:10:00Z',
    updated_at: '2025-09-27T08:50:00Z',
    closed_at: '2025-09-27T08:50:00Z',
    user: {
      id: 142857,
      login: 'eddyerburgh',
      avatar_url: 'https://avatars.githubusercontent.com/u/142857?v=4',
      html_url: 'https://github.com/eddyerburgh'
    },
    labels: [
      { id: 9, name: 'documentation', color: '0075ca' }
    ],
    html_url: 'https://github.com/vuejs/core/pull/12385',
    draft: false,
    comments: 2,
    body: 'Updates documentation on shadowRoot mode option and custom element slot distribution.',
    head: { ref: 'docs/custom-elements-shadow' },
    base: { ref: 'main' }
  }
]

export const FALLBACK_ISSUES: GitHubIssue[] = [
  {
    id: 19842,
    number: 19842,
    title: 'Custom Ref getter called multiple times during computed property evaluation in dev mode',
    state: 'open',
    created_at: '2025-10-04T12:30:00Z',
    updated_at: '2025-10-05T09:12:00Z',
    closed_at: null,
    user: {
      id: 918231,
      login: 'kazupon',
      avatar_url: 'https://avatars.githubusercontent.com/u/918231?v=4',
      html_url: 'https://github.com/kazupon'
    },
    labels: [
      { id: 1, name: 'scope: reactivity', color: 'c2e0c6' },
      { id: 8, name: 'bug', color: 'd73a4a' }
    ],
    html_url: 'https://github.com/vuejs/core/issues/19842',
    comments: 5,
    body: 'When combining customRef with computed values in Vue 3.5+, the custom getter is evaluated twice on initial trigger.'
  },
  {
    id: 19839,
    number: 19839,
    title: 'TypeScript 5.6 inference failure when using generic defineProps with default destructuring',
    state: 'open',
    created_at: '2025-10-03T16:04:00Z',
    updated_at: '2025-10-04T18:20:00Z',
    closed_at: null,
    user: {
      id: 284102,
      login: 'brillout',
      avatar_url: 'https://avatars.githubusercontent.com/u/284102?v=4',
      html_url: 'https://github.com/brillout'
    },
    labels: [
      { id: 3, name: 'scope: compiler-sfc', color: 'fef2c0' },
      { id: 10, name: 'typescript', color: '2c8bb9' }
    ],
    html_url: 'https://github.com/vuejs/core/issues/19839',
    comments: 9,
    body: 'Under TS 5.6 strict mode, destructured generic props lose contextual type narrowing in sub-expressions.'
  },
  {
    id: 19831,
    number: 19831,
    title: 'Hydration error when v-html content contains comments matching template nodes',
    state: 'closed',
    created_at: '2025-09-30T10:14:00Z',
    updated_at: '2025-10-02T14:00:00Z',
    closed_at: '2025-10-02T14:00:00Z',
    user: {
      id: 512019,
      login: 'Akryum',
      avatar_url: 'https://avatars.githubusercontent.com/u/512019?v=4',
      html_url: 'https://github.com/Akryum'
    },
    labels: [
      { id: 7, name: 'scope: ssr', color: 'fbca04' },
      { id: 8, name: 'bug', color: 'd73a4a' }
    ],
    html_url: 'https://github.com/vuejs/core/issues/19831',
    comments: 4,
    body: 'HTML comments injected via v-html were being treated as virtual DOM anchor nodes during hydration reconciliation.'
  },
  {
    id: 19825,
    number: 19825,
    title: 'TransitionGroup with leave-active class causes layout shift on fast list updates',
    state: 'closed',
    created_at: '2025-09-26T08:45:00Z',
    updated_at: '2025-09-28T16:20:00Z',
    closed_at: '2025-09-28T16:20:00Z',
    user: {
      id: 712014,
      login: 'LinusBorg',
      avatar_url: 'https://avatars.githubusercontent.com/u/712014?v=4',
      html_url: 'https://github.com/LinusBorg'
    },
    labels: [
      { id: 5, name: 'scope: runtime-core', color: 'd4c5f9' }
    ],
    html_url: 'https://github.com/vuejs/core/issues/19825',
    comments: 7,
    body: 'FLIP animation calculation did not subtract bounding box delta when leave hook interrupted active transition.'
  }
]

export const FALLBACK_COMMITS: GitHubCommitItem[] = [
  {
    sha: '9a8b1c4e2f3d5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    commit: {
      message: 'fix(reactivity): trigger shallowReactive effects on nested property access (#12401)',
      author: {
        name: 'Evan You',
        email: 'yyx990803@gmail.com',
        date: '2025-10-05T13:40:00Z'
      }
    },
    author: {
      id: 499550,
      login: 'yyx990803',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      html_url: 'https://github.com/yyx990803'
    },
    html_url: 'https://github.com/vuejs/core/commit/9a8b1c4e2f3d5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
  },
  {
    sha: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    commit: {
      message: 'feat(compiler-sfc): support import attributes in script setup (#12398)',
      author: {
        name: 'Anthony Fu',
        email: 'anthonyfu117@hotmail.com',
        date: '2025-10-04T14:30:00Z'
      }
    },
    author: {
      id: 664177,
      login: 'antfu',
      avatar_url: 'https://avatars.githubusercontent.com/u/664177?v=4',
      html_url: 'https://github.com/antfu'
    },
    html_url: 'https://github.com/vuejs/core/commit/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
  },
  {
    sha: '1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e',
    commit: {
      message: 'perf(runtime-core): avoid redundant vnode normalization in keyed v-for (#12394)',
      author: {
        name: 'Haoqun Jiang',
        email: 'haoqunjiang+dev@gmail.com',
        date: '2025-10-02T19:40:00Z'
      }
    },
    author: {
      id: 3277634,
      login: 'sodatea',
      avatar_url: 'https://avatars.githubusercontent.com/u/3277634?v=4',
      html_url: 'https://github.com/sodatea'
    },
    html_url: 'https://github.com/vuejs/core/commit/1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e'
  },
  {
    sha: '8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b',
    commit: {
      message: 'chore: release v3.5.12',
      author: {
        name: 'Evan You',
        email: 'yyx990803@gmail.com',
        date: '2025-10-01T15:20:00Z'
      }
    },
    author: {
      id: 499550,
      login: 'yyx990803',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      html_url: 'https://github.com/yyx990803'
    },
    html_url: 'https://github.com/vuejs/core/commit/8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b'
  },
  {
    sha: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    commit: {
      message: 'fix(ssr): preserve teleport target attributes during hydration mismatch (#12390)',
      author: {
        name: 'Haozhen Xu',
        email: 'haozhen.xu@example.com',
        date: '2025-09-29T11:10:00Z'
      }
    },
    author: {
      id: 841294,
      login: 'HaozhenXu',
      avatar_url: 'https://avatars.githubusercontent.com/u/841294?v=4',
      html_url: 'https://github.com/HaozhenXu'
    },
    html_url: 'https://github.com/vuejs/core/commit/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
  }
]

export const FALLBACK_RELEASES: GitHubRelease[] = [
  {
    id: 1782014,
    tag_name: 'v3.5.12',
    name: 'v3.5.12',
    body: '### Bug Fixes\n\n* **reactivity:** shallowReactive nested access triggering watchers (#12401)\n* **compiler-sfc:** preserve comments when transforming script setup macros\n* **ssr:** correct teleport hydration fallbacks in SSR mode (#12390)\n\n### Performance Improvements\n\n* **runtime-core:** keyed list normalization optimizations (#12394)',
    published_at: '2025-10-01T15:20:00Z',
    author: {
      id: 499550,
      login: 'yyx990803',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      html_url: 'https://github.com/yyx990803'
    },
    html_url: 'https://github.com/vuejs/core/releases/tag/v3.5.12',
    prerelease: false,
    draft: false
  },
  {
    id: 1774012,
    tag_name: 'v3.5.11',
    name: 'v3.5.11',
    body: '### Features\n\n* **compiler-sfc:** support import attributes syntax in script setup (#12398)\n\n### Bug Fixes\n\n* **types:** improve PropType unwrapping in complex union types',
    published_at: '2025-09-24T18:00:00Z',
    author: {
      id: 499550,
      login: 'yyx990803',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      html_url: 'https://github.com/yyx990803'
    },
    html_url: 'https://github.com/vuejs/core/releases/tag/v3.5.11',
    prerelease: false,
    draft: false
  },
  {
    id: 1761008,
    tag_name: 'v3.5.10',
    name: 'v3.5.10',
    body: '### Bug Fixes\n\n* **reactivity:** memory cleanup on unobserved computed properties\n* **runtime-dom:** fix SVG style namespace rendering on Safari 17',
    published_at: '2025-09-10T12:45:00Z',
    author: {
      id: 499550,
      login: 'yyx990803',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      html_url: 'https://github.com/yyx990803'
    },
    html_url: 'https://github.com/vuejs/core/releases/tag/v3.5.10',
    prerelease: false,
    draft: false
  }
]

export const FALLBACK_CONTRIBUTORS: GitHubContributor[] = [
  {
    id: 499550,
    login: 'yyx990803',
    avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
    contributions: 4210,
    html_url: 'https://github.com/yyx990803'
  },
  {
    id: 3277634,
    login: 'sodatea',
    avatar_url: 'https://avatars.githubusercontent.com/u/3277634?v=4',
    contributions: 890,
    html_url: 'https://github.com/sodatea'
  },
  {
    id: 664177,
    login: 'antfu',
    avatar_url: 'https://avatars.githubusercontent.com/u/664177?v=4',
    contributions: 412,
    html_url: 'https://github.com/antfu'
  },
  {
    id: 712014,
    login: 'LinusBorg',
    avatar_url: 'https://avatars.githubusercontent.com/u/712014?v=4',
    contributions: 318,
    html_url: 'https://github.com/LinusBorg'
  },
  {
    id: 841294,
    login: 'HaozhenXu',
    avatar_url: 'https://avatars.githubusercontent.com/u/841294?v=4',
    contributions: 194,
    html_url: 'https://github.com/HaozhenXu'
  },
  {
    id: 142857,
    login: 'eddyerburgh',
    avatar_url: 'https://avatars.githubusercontent.com/u/142857?v=4',
    contributions: 142,
    html_url: 'https://github.com/eddyerburgh'
  }
]
