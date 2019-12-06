import Vue from 'vue'
import Router from 'vue-router'

import Login from './views/Login.vue'
import CAs from './views/CAs.vue'
import CADetails from './views/CADetails.vue'
import APIService from "./services/APIService.js";

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'cas' }
    },
    {
      path: '/cas',
      name: 'cas',
      component: CAs
    },
    {
      path: '/cas/:handle',
      name: 'caDetails',
      component: CADetails
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
  ]
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedInOnFrontend = localStorage.getItem('user');

  if (authRequired) {
    APIService.isAuthorized().then(loggedInOnBackend => {
      if (!loggedInOnFrontend || !loggedInOnBackend) {
        return next({
          path: '/login',
          query: {
            returnUrl: to.path
          }
        });
      }
      next();
    });
  } else {
    next();
  }
});

export default router;
