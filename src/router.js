import Vue from "vue";
import Router from "vue-router";

import Login from "./views/Login.vue";
import CAs from "./views/CAs.vue";
import CADetails from "./views/CADetails.vue";
import Interstitial from "./views/Interstitial.vue";
import CreateCA from "./views/CreateCA.vue";
import PageNotFound from "./views/404.vue";
import APIService from "./services/APIService.js";
import { LOCALSTORAGE_NAME } from "./auth-header";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      redirect: { name: "interstitial" }
    },
    {
      path: "/interstitial",
      name: "interstitial",
      component: Interstitial
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: CreateCA
    },
    {
      path: "/createca",
      name: "createca",
      component: CreateCA
    },
    {
      path: "/cas",
      name: "cas",
      component: CAs
    },
    {
      path: "/cas/:handle/:tab?",
      name: "caDetails",
      component: CADetails
    },
    {
      path: "/login",
      name: "login",
      component: Login
    },
    { path: "*", component: PageNotFound }
  ]
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const loggedInOnFrontend = localStorage.getItem(LOCALSTORAGE_NAME);

  if (authRequired) {
    APIService.isAuthorized().then(loggedInOnBackend => {
      if (!loggedInOnFrontend || !loggedInOnBackend) {
        return next({
          path: "/login",
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
