import Vue from 'vue'
import Router from 'vue-router'
import TypeExport from '@/components/TypeExport'
import DataImport from '@/components/DataImport'
import DataMigration from '@/components/DataMigration'
import BulkDelete from '@/components/BulkDelete'
import Flyway from '@/components/Flyway'
import DataExport from '@/components/DataExport'
import DataEdit from '@/components/DataEdit'
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
      path: '/dataMigration',
      name: 'DataMigration',
      component: DataMigration
    },
    {
      path: '/bulkDelete',
      name: 'BulkDelete',
      component: BulkDelete
    },
    {
      path: '/flyway',
      name: 'Flyway',
      component: Flyway
    },
    {
      path: '/dataMultiExport',
      name: 'DataExport',
      component: DataExport
    },
    {
      path: '/dataEdit',
      name: 'DataEdit',
      component: DataEdit
    },
    {
      path: '*',
      name: '404',
      component: NotFound
    }
  ]
})
