<template>
  <nav class="bg-blue-500 p-2">
    <div class="container mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex-shrink-0 pr-4">
          <router-link to="/" class="text-white text-xl font-bold">EiroPlaza</router-link>
        </div>
        
        <div class="flex-grow flex justify-center px-4">
          <CountrySearch class="w-full max-w-md" />
        </div>
        
        <div class="flex-shrink-0 space-x-4 pl-4">
          <router-link to="/" class="text-white hover:text-blue-200 text-sm">Home</router-link>
          <router-link to="/about" class="text-white hover:text-blue-200 text-sm">About</router-link>
          <router-link to="/contact" class="text-white hover:text-blue-200 text-sm">Contact</router-link>
          <router-link to="/posts" class="text-white hover:text-blue-200 text-sm">Posts</router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="text-white hover:text-blue-200 text-sm">Register</router-link>
          <router-link v-if="!isLoggedIn" to="/login" class="text-white hover:text-blue-200 text-sm">Login</router-link>
          <router-link v-if="isLoggedIn" to="/profile" class="text-white hover:text-blue-200 text-sm">Profile</router-link>
          <button v-if="isLoggedIn" @click="logout" class="text-white hover:text-blue-200 text-sm">Logout</button>
          <router-link v-if="isAdmin" to="/admin" class="text-white hover:text-blue-200 text-sm">Admin Panel</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import CountrySearch from './CountrySearch.vue';

export default {
  name: 'NavBar',
  components: {
    CountrySearch
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const isAdmin = computed(() => store.state.isAdmin);

    const logout = async () => {
      await store.dispatch('logout');
      router.push('/login');
    };

    return {
      isLoggedIn,
      isAdmin,
      logout
    };
  }
};
</script>