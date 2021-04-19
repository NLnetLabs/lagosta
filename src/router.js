import Vue from "vue";
import Router from "vue-router";

import Login from "./views/Login.vue";
import CAs from "./views/CAs.vue";
import CADetails from "./views/CADetails.vue";
import Interstitial from "./views/Interstitial.vue";
import CreateCA from "./views/CreateCA.vue";
import TestBed from "./views/TestBed.vue";
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
      path: "/testbed",
      name: "testbed",
      component: TestBed
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
  const publicPages = ["/login", "/testbed"];
  const authRequired = !publicPages.includes(to.path);
  const loggedInOnFrontend = localStorage.getItem(LOCALSTORAGE_NAME);

  if (authRequired) {
    APIService.isAuthorized().then(loggedInOnBackend => {
      if (!loggedInOnFrontend || !loggedInOnBackend) {
        localStorage.removeItem(LOCALSTORAGE_NAME);
        APIService.getLoginURL().then(response => {
          var login_url = response.data;
          // Detect whether the URL we should direct the user to login at is
          // part of our single page application (is a relative URL) or is
          // outside our single page application (is an absolute URL), as the
          // way to redirect to them differs.

          // Ideally an external login page would only be available via HTTPS,
          // but permit plain HTTP for the case when using a local OpenID
          // Connect provider for testing purposes that is exposed over plain
          // unencrypted HTTP.
          if (login_url.indexOf('http') === 0) {
            // tell the browser to send the user to an external login page
            // served by the OpenID Connect provider as the vue router cannot do
            // such a redirect for us.
            window.location.href = login_url;
          } else {
            // use the Vue router to "redirect" to an internal login page.
            return next({
              path: login_url,
              query: {
                returnUrl: to.path
              }
            });
          }
        })
        .catch(error => {
          return next({
            path: "/login",
            query: {
              returnUrl: to.path,
              error: error.data
            }
          });
        });
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

export default router;
