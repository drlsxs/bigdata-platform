import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }, {
    path: '/center',
    component: (resolve) => require(['@/views/Center'], resolve),
    name: 'Center',
    meta: { title: '个人中心', icon: 'user' }
  }, {
    path: '/test',
    component: (resolve) => require(['@/views/test'], resolve),
    name: 'Test',
    meta: { title: '测试', icon: 'user' }
  }, {
    path: '/1',
    component: (resolve) => require(['@/views/showData'], resolve),
    name: 'showData',
    meta: {title: '展示数据', icon: 'user'}
  },{
    path: '/2',
    component: (resolve) => require(['@/views/mock'], resolve),
    name: 'moni',
    meta: {title: '模拟', icon: 'user'}
  },

]

const router = new VueRouter({
  mode: 'history', // 去掉url中的#
  routes
})

export default router
