// 路由守卫
import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
import { roterPre } from '@/settings'
import { getMenus } from '@/utils/auth'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = [`${roterPre}/login`, '/auth-redirect'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()
  // 设置page title
  document.title = getPageTitle(to.meta.title)
  const hasToken = store.getters.token
  if (hasToken) {
    if (to.path === `${roterPre}/login`) {
      next({ path: '/' })
    } else {
      // 强制刷新获取菜单逻辑
      if (store.getters.menuList.length <= 0) {
        await getMenus()
        next(to.fullPath)
      } else {
        next()
      }
    }
    NProgress.done()
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // 没有token时，清空token以及其他缓存
      await store.dispatch('user/resetToken')
      next(`${roterPre}/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
