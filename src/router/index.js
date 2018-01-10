import Vue from 'vue'
import Router from 'vue-router'
import TypeExport from '@/components/TypeExport'
import NotFound from '@/components/404'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TypeExport',
      component: TypeExport
    },
    {
      path: '/typeExport',
      name: 'TypeExport',
      component: TypeExport
    },
    {
      path: '*',
      name: '404',
      component: NotFound
    }
  ]
})
