<template>
  <nav class="nav-shell">
    <div class="container mx-auto px-4 py-3">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-shrink-0 pr-4 text-center lg:text-left">
          <router-link to="/" class="brand-link">EiroPlaza</router-link>
        </div>
        
        <div class="flex-grow flex justify-center px-4">
          <CountrySearch class="w-full max-w-md" />
        </div>
        
        <div class="flex flex-wrap items-center justify-center lg:justify-end gap-2 pl-4">
          <router-link to="/" class="nav-link">Sākums</router-link>
          <router-link to="/compare" class="nav-link">Salīdzinātājs</router-link>
          <router-link to="/about" class="nav-link">Par mums</router-link>
          <router-link to="/contact" class="nav-link">Kontakti</router-link>
          <router-link to="/posts" class="nav-link">Ieraksti</router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="nav-link">Reģistrēties</router-link>
          <router-link v-if="!isLoggedIn" to="/login" class="nav-link nav-link-strong">Pieslēgties</router-link>
          <router-link v-if="isLoggedIn" to="/profile" class="nav-link">Profils</router-link>
          <button v-if="isLoggedIn" @click="logout" class="nav-link nav-link-danger">Izrakstīties</button>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">Administratora panelis</router-link>
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

<style scoped>
.nav-shell {
  background: rgba(15, 23, 42, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.16);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(168, 85, 247, 0.95));
  color: white;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.5rem 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.nav-link-strong {
  background: rgba(255, 255, 255, 0.12);
}

.nav-link-danger {
  background: rgba(239, 68, 68, 0.15);
}
</style>