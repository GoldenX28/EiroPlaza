<template>
  <div id="app">
    <NavBar />
    <CountrySearch />
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import CountrySearch from './components/CountrySearch.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    CountrySearch
  },
  setup() {
    const isLoggedIn = ref(false)
    
    const login = () => {
      console.log('Login called')
      isLoggedIn.value = true
      localStorage.setItem('isLoggedIn', 'true')
      console.log('isLoggedIn after login:', isLoggedIn.value)
    }

    const logout = () => {
      console.log('Logout called')
      isLoggedIn.value = false
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('token')
      console.log('isLoggedIn after logout:', isLoggedIn.value)
    }

    onMounted(() => {
      console.log('App mounted')
      if (localStorage.getItem('isLoggedIn') === 'true') {
        isLoggedIn.value = true
        console.log('User was previously logged in')
      } else {
        console.log('User was not previously logged in')
      }
      console.log('Initial isLoggedIn state:', isLoggedIn.value)
    })

    provide('auth', {
      isLoggedIn,
      login,
      logout
    })

    return { isLoggedIn }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>