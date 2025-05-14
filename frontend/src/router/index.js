import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import CountryDetails from '../components/CountryDetails.vue'
import AboutPage from '@/components/AboutPage.vue'
import ContactPage from '@/components/ContactPage.vue'
import RegisterForm from '@/components/Register.vue'  // Import the RegisterForm component
import LoginForm from '@/components/Login.vue'  // Assuming you have a LoginForm component

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/country/:id',
    name: 'CountryDetails',
    component: CountryDetails,
    props: true
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router