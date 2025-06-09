import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import CountryDetails from '../components/CountryDetails.vue'
import AboutPage from '@/components/AboutPage.vue'
import ContactPage from '@/components/ContactPage.vue'
import RegisterForm from '@/components/Register.vue' 
import LoginForm from '@/components/Login.vue'  
import UserProfile from '@/components/UserProfile.vue'
import AdminPanel from '@/components/AdminPanel.vue';
import store from '../store' // Add this import

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Add navigation guard to check for authentication
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.state.isLoggedIn;
  const isAdmin = store.state.isAdmin;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAdmin) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router