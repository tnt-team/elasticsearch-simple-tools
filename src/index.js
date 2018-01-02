'use strict';

import Vue from 'vue';
import Router from 'vue-router';

// install router
Vue.use(Router);

Vue.config.errorHandler = function(err, vm) {
    console.error(err.message + ' ' + err.stack);
};

// routing
let router = new Router({linkActiveClass:'active'});

router.map({
    '/':{
        name:'index',
        component: require('./views/typeExport.vue')
    },
    '/typeExport': {
        name: 'index',
        component: require('./views/typeExport.vue')
    },
    '/dataImport': {
        name: 'dataImport',
        component: require('./views/DataImport.vue')
    },
    '/dataMigration': {
        name: 'dataMigration',
        component: require('./views/DataMigration.vue')
    },
    '/bulkDelete': {
        name: 'bulkDelete',
        component: require('./views/bulkDelete.vue')
    },
    '/dataEdit': {
        name: 'dataEdit',
        component: require('./views/dataEdit.vue')
    },
    '/flyway': {
        name: 'flyway',
        component: require('./views/flyway.vue')
    },
    '/routerDelete':{
        name:'routerDelete',
        component: require('./views/RouterDelete.vue')
    },
    '/dataMultiExport':{
        name:'dataMultiExport',
        component: require('./views/dataExport.vue')
    },
    '*': {
        component: require('./views/404.vue')
    },
});

router.redirect({'/':'/typeExport'});

router.beforeEach(() => {
    window.scrollTo(0, 0);
});

router.start(require('./main.vue'), '#app');