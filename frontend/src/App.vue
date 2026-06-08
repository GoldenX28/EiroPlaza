<template>
  <div id="app" class="app-shell">
    <div class="app-topbar">
      <NavBar />
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  },
  setup() {
    const isLoggedIn = ref(false)
    
    const login = () => {
      console.log('Pieteikšanās izsaukta')
      isLoggedIn.value = true
      localStorage.setItem('isLoggedIn', 'true')
      console.log('isLoggedIn pēc pieteikšanās:', isLoggedIn.value)
    }

    const logout = () => {
      console.log('Izrakstīšanās izsaukta')
      isLoggedIn.value = false
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('token')
      console.log('isLoggedIn pēc izrakstīšanās:', isLoggedIn.value)
    }

    onMounted(() => {
      console.log('Lietotne ir ielādēta')
      if (localStorage.getItem('isLoggedIn') === 'true') {
        isLoggedIn.value = true
        console.log('Lietotājs iepriekš bija pieslēdzies')
      } else {
        console.log('Lietotājs iepriekš nebija pieslēdzies')
      }
      console.log('Sākotnējais isLoggedIn stāvoklis:', isLoggedIn.value)
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

.app-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 28%, #f8fafc 100%);
}

.app-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(16px);
}
</style>