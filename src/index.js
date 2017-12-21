'use strict'

import Vue from 'vue';
import Router from 'vue-router';

// install router
Vue.use(Router);

Vue.config.errorHandler = function (err, vm) {
  console.error(err.message + ' ' + err.stack);
};

// routing
let router = new Router();

router.map({
  '/': {
    name: 'index',
    component: require('./views/typeExport.vue')
  },
  '/typeExport': {
    name: 'index',
    component: require('./views/typeExport.vue')
  },
  /*'*': {
    component: require('./views/404.vue')
  }*/
  '*': {
      component: require('./views/404.vue')
  }
});

router.beforeEach(() => {
  window.scrollTo(0, 0);
});

router.start(require('./main.vue'), '#app');