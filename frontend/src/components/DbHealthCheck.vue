<template>
  <div v-if="isAdmin" class="db-health-check bg-gray-100 p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Database Health Check</h2>
    <button @click="checkDbHealth" class="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Check Database Health
    </button>
    <div v-if="loading" class="text-gray-600">Checking database health...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="dbStatus" class="space-y-4">
      <div v-for="(status, dbName) in dbStatus" :key="dbName" class="bg-white p-4 rounded-md shadow">
        <h3 class="font-semibold text-lg mb-2 capitalize">{{ dbName }} Database:</h3>
        <p class="mb-1">
          Connection: 
          <span :class="status.connected ? 'text-green-600' : 'text-red-600'">
            {{ status.connected ? 'Connected' : 'Not Connected' }}
          </span>
        </p>
        <p v-if="status.error" class="text-red-600">Error: {{ status.error }}</p>
      </div>
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