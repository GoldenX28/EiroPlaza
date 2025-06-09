<template>
  <div v-if="isAdmin" class="db-health-check">
    <h2 class="text-2xl font-bold mb-4">Database Health Check</h2>
    <button @click="checkDbHealth" class="check-button mb-4">
      Check Database Health
    </button>
    <div v-if="loading" class="text-gray-600">Checking database health...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="dbStatus" class="status-display">
      <h3 class="font-semibold">Main Connection: 
        <span :class="dbStatus.main?.connected ? 'text-green-600' : 'text-red-600'">
          {{ dbStatus.main?.connected ? 'Connected' : 'Not Connected' }}
        </span>
      </h3>
      <p v-if="dbStatus.main?.error" class="error text-red-600">Error: {{ dbStatus.main.error }}</p>
      
      <h3 class="font-semibold mt-2">Countries Collection: 
        <span :class="dbStatus.countries?.connected ? 'text-green-600' : 'text-red-600'">
          {{ dbStatus.countries?.connected ? 'Connected' : 'Not Connected' }}
        </span>
      </h3>
      <p v-if="dbStatus.countries?.error" class="error text-red-600">Error: {{ dbStatus.countries.error }}</p>
      
      <h3 class="font-semibold mt-2">Users Collection: 
        <span :class="dbStatus.users?.connected ? 'text-green-600' : 'text-red-600'">
          {{ dbStatus.users?.connected ? 'Connected' : 'Not Connected' }}
        </span>
      </h3>
      <p v-if="dbStatus.users?.error" class="error text-red-600">Error: {{ dbStatus.users.error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'DbHealthCheck',
  setup() {
    const store = useStore();
    const isAdmin = computed(() => store.state.isAdmin);

    const dbStatus = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const checkDbHealth = async () => {
      loading.value = true;
      error.value = null;
      dbStatus.value = null;

      try {
        const response = await axios.get('http://localhost:3000/api/db-health');
        console.log('DB Health Check Response:', response.data);
        dbStatus.value = response.data;
      } catch (err) {
        console.error('Error checking database health:', err);
        error.value = 'Failed to check database health';
      } finally {
        loading.value = false;
      }
    };

    return {
      isAdmin,
      dbStatus,
      loading,
      error,
      checkDbHealth
    };
  }
};
</script>

<style scoped>
.db-health-check {
  @apply p-6 bg-white rounded-lg shadow-md;
}

.check-button {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}

.status-display {
  @apply mt-4;
}
</style>