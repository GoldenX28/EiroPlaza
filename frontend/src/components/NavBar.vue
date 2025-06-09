<template>
  <nav class="bg-blue-600 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-white font-bold text-xl">EiroPlaza</div>
      <div class="space-x-4">
        <router-link to="/" class="text-white hover:text-blue-200">Home</router-link>
        <router-link to="/about" class="text-white hover:text-blue-200">About</router-link>
        <router-link to="/contact" class="text-white hover:text-blue-200">Contact</router-link>
        <router-link v-if="isLoggedIn" to="/profile" class="text-white hover:text-blue-200">Profile</router-link>
        <template v-if="!isLoggedIn">
          <router-link to="/register" class="text-white hover:text-blue-200">Register</router-link>
          <router-link to="/login" class="text-white hover:text-blue-200">Login</router-link>
        </template>
        <a v-else href="#" @click.prevent="handleLogout" class="text-white hover:text-blue-200">Logout</a>
        <router-link v-if="isAdmin" to="/admin" class="text-white hover:text-blue-200">Admin Panel</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'NavBar',
  setup() {
    const store = useStore();
    const router = useRouter();

    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const isAdmin = computed(() => store.state.isAdmin);

    const handleLogout = () => {
      store.dispatch('logout');
      router.push('/');
    };

    return {
      isLoggedIn,
      isAdmin,
      handleLogout
    };
  }
};
</script>