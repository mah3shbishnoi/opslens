import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: () => import('@/views/OverviewView.vue'),
      meta: { title: 'Engineering Operations — OpsLens' }
    },
    {
      path: '/pull-requests',
      name: 'pull-requests',
      component: () => import('@/views/PullRequestsView.vue'),
      meta: { title: 'Pull Requests — OpsLens' }
    },
    {
      path: '/issues',
      name: 'issues',
      component: () => import('@/views/IssuesView.vue'),
      meta: { title: 'Issue Resolution — OpsLens' }
    },
    {
      path: '/commits',
      name: 'commits',
      component: () => import('@/views/CommitsView.vue'),
      meta: { title: 'Commit Activity — OpsLens' }
    },
    {
      path: '/releases',
      name: 'releases',
      component: () => import('@/views/ReleasesView.vue'),
      meta: { title: 'Releases & Milestones — OpsLens' }
    },
    {
      path: '/contributors',
      name: 'contributors',
      component: () => import('@/views/ContributorsView.vue'),
      meta: { title: 'Contributor Directory — OpsLens' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Console Settings — OpsLens' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router
