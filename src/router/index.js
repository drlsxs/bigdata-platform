import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/center',
    component: (resolve) => require(['@/views/Center'], resolve),
    name: 'Center',
    meta: { title: '个人中心', icon: 'user' }
  },
  {
    path: '/test',
    component: (resolve) => require(['@/views/test'], resolve),
    name: 'Test',
    meta: { title: '个人中心', icon: 'user' }
  },

]

const router = new VueRouter({
  mode: 'history', // 去掉url中的#
  routes
})

export default router
