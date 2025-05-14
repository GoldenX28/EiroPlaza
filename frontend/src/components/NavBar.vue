<template>
  <nav class="bg-blue-600 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-white font-bold text-xl">EiroPlaza</div>
      <div class="space-x-4">
        <router-link to="/" class="text-white hover:text-blue-200">Home</router-link>
        <router-link to="/about" class="text-white hover:text-blue-200">About</router-link>
        <router-link to="/contact" class="text-white hover:text-blue-200">Contact</router-link>
        <template v-if="!isLoggedIn">
          <router-link to="/register" class="text-white hover:text-blue-200">Register</router-link>
          <router-link to="/login" class="text-white hover:text-blue-200">Login</router-link>
        </template>
        <a v-else href="#" @click.prevent="handleLogout" class="text-white hover:text-blue-200">Logout</a>
      </div>
    </div>
  </nav>
</template>

<script>
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'NavBar',
  setup() {
    const auth = inject('auth')
    const router = useRouter()

    const isLoggedIn = computed(() => {
      console.log('NavBar: isLoggedIn computed', auth.isLoggedIn.value)
      return auth.isLoggedIn.value
    })

    const handleLogout = () => {
      console.log('Logout clicked')
      auth.logout()
      router.push('/')
    }

    return {
      isLoggedIn,
      handleLogout
    }
  }
}
</script>