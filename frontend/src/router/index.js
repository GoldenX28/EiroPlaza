import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import CountryDetails from '../components/CountryDetails.vue'
import AboutPage from '@/components/AboutPage.vue'
import ContactPage from '@/components/ContactPage.vue'
import RegisterForm from '@/components/Register.vue' 
import LoginForm from '@/components/Login.vue'  
import UserProfile from '@/components/UserProfile.vue'
import AdminPanel from '@/components/AdminPanel.vue';
import store from '../store'
import PostList from '../components/PostList.vue';
import PostDetail from '../components/PostDetail.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/country/:id',
    name: 'CountryDetails',
    component: CountryDetails
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm  // Use RegisterForm here
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAdmin: true }
  },
  {
    path: '/posts',
    name: 'Posts',
    component: PostList
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Wait for auth to initialize before proceeding
  if (!store.state.authInitialized) {
    await store.dispatch('initializeAuth')
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.isLoggedIn) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!store.state.isAdmin) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router