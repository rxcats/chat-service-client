
const routes = [
  // {
  //   path: '/',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('pages/Index.vue') }
  //   ]
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  },

  {
    path: '/test',
    component: () => import('pages/Test')
  },

  // Chat Service
  {
    path: '/',
    component: () => import('pages/Login')
  },
  {
    path: '/login',
    component: () => import('pages/Login')
  },
  {
    path: '/lobby',
    component: () => import('pages/Lobby')
  },
  {
    path: '/room',
    component: () => import('pages/Room')
  }
]

export default routes
