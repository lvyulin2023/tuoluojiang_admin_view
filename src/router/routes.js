import { roterPre } from '@/settings'
import Layout from '@/layout'

const defaultRoutes = [
  {
    path: roterPre,
    component: Layout,
    redirect: `${roterPre}/user/work`,
    children: [
      {
        path: `${roterPre}/user/work`,
        component: () => import('@/views/user/workbench/index'),
        name: 'dashboard-admin',
        meta: { title: '工作台', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: `${roterPre}/user/work`,
    children: [
      {
        path: `${roterPre}/user/work`,
        component: () => import('@/views/user/workbench/index'),
        name: 'dashboard',
        meta: { title: '工作台', icon: 'dashboard', affix: true }
      },
      {
        path: `${roterPre}/search`,
        name: 'search',
        component: () => import('@/views/search/index'),
        meta: { title: '搜索' }
      }
    ]
  },
  {
    path: `${roterPre}/login`,
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: roterPre + '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: roterPre + '/setting/icons',
    component: () => import('@/components/form-common/select-icon.vue'),
    name: 'icons'
  },


  {
    path: roterPre + '/setting/uploadPicture',
    component: () => import('@/components/uploadPicture/index.vue'),
    name: 'uploadPicture'
  },

  {
    path: roterPre + '/openFile',
    component: () => import('@/components/openFile/index.vue'),
    name: 'previewPage',
    meta: { title: '文件预览' }
  },
 
  
  {
    path: roterPre + '/process',
    component: () => import('@/views/develop/crud/process.vue'),
    name: 'process'
  },
  {
    path: roterPre + '/dashboard-design',
    component: () => import('@/views/system/dashboard-design/charts/index.vue'),
    name: 'dashboardDesign',
    meta: { title: '图表设计' }
  },
  {
    path: roterPre + '/event',
    component: () => import('@/views/develop/crud/event.vue'),
    name: 'event'
  },
  {
    path: roterPre + '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  }
]
export default defaultRoutes
