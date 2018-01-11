import Vue from 'vue'
import Router from 'vue-router'
import TypeExport from '@/components/TypeExport'
import DataImport from '@/components/DataImport'
import NotFound from '@/components/404'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      redirect: '/typeExport'
    },
    {
      path: '/typeExport',
      name: 'TypeExport',
      component: TypeExport
    },
    {
      path: '/dataImport',
      name: 'DataImport',
      component: DataImport
    },
    {
      path: '*',
      name: '404',
      component: NotFound
    }
  ]
})
