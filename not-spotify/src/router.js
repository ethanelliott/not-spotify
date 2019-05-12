import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landing',
      components: {
        default: () => import('./views/Landing.vue')
      },
    },
    {
      path: '/login',
      name: 'login',
      components: {
        default: () => import('./views/Login.vue')
      },
    },
    {
      path: '/logout',
      name: 'logout',
      components: {
        default: () => import('./views/Logout.vue')
      },
    },
    {
      path: '/auth-callback',
      name: 'Callback',
      props: route => {
        return { code: route.query.code, state: route.query.state }
      },
      components: {
        default: () => import('./views/Callback.vue')
      },
    },
    {
      path: '/m',
      name: 'm',
      components: {
        default: () => import('./views/Layout.vue'),
        content: () => import('./views/Home.vue')
      },
      redirect: '/m/home',
      children: [
        {
          path: 'home',
          name: 'Home',
          props: {default: false, content: true},
          components: {
            default: () => import('./views/Layout.vue'),
            content: () => import('./views/Home.vue')
          }
        },
        {
          path: 'search',
          name: 'Search',
          props: {default: false, content: true},
          components: {
            default: () => import('./views/Layout.vue'),
            content: () => import('./views/Search.vue')
          }
        },
        {
          path: 'playlist/:id',
          name: 'Playlist',
          props: {default: true, content: true},
          components: {
            default: () => import('./views/Layout.vue'),
            content: () => import('./views/Playlist.vue')
          }
        },
        {
          path: 'artist/:id',
          name: 'Artist',
          props: {default: true, content: true},
          components: {
            default: () => import('./views/Layout.vue'),
            content: () => import('./views/Artist.vue')
          }
        },
      ]
    }
  ]
})
