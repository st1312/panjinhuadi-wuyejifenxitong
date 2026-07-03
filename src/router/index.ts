import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Permission from '../views/Permission.vue'
import Merchant from '../views/Merchant.vue'
import Points from '../views/Points.vue'
import Resident from '../views/Resident.vue'
import Param from '../views/Param.vue'
import Notice from '../views/Notice.vue'
import Delivery from '../views/Delivery.vue'
import Placeholder from '../views/Placeholder.vue'
import Login from '../views/Login.vue'


const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { title: '数据大盘' }
  },
  {
    path: '/resident',
    name: 'resident',
    component: Resident,
    meta: { title: '住户管理' }
  },
  {
    path: '/merchant',
    name: 'merchant',
    component: Merchant,
    meta: { title: '商家管理' }
  },
  {
    path: '/permission',
    name: 'permission',
    component: Permission,
    meta: { title: '权限配置' }
  },
  {
    path: '/param',
    name: 'param',
    component: Param,
    meta: { title: '参数配置' }
  },
  {
    path: '/points',
    name: 'points',
    component: Points,
    meta: { title: '积分管理' }
  },

  {
    path: '/notice',
    name: 'notice',
    component: Notice,
    meta: { title: '通告发布' }
  },
  {
    path: '/delivery',
    name: 'delivery',
    component: Delivery,
    meta: { title: '送货管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isLoggedIn && to.name === 'login') return '/'
    return true
  }

  if (!auth.isLoggedIn) return '/login'
  return true
})

export default router
