<template>
  <div class="about-page p-6 bg-blue-50 rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">About This Project</h1>
    <p class="mt-4">This website provides information about European countries, including general facts, languages, time zones, and more. Future updates will integrate real-time data and APIs.</p>
    
    <DbHealthCheck v-if="isAdmin" class="mt-8" />

    <button @click="goBack" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
      Back to Home
    </button>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import DbHealthCheck from './DbHealthCheck.vue';

export default {
  name: 'AboutPage',
  components: {
    DbHealthCheck
  },
  setup() {
    const store = useStore();
    const isAdmin = computed(() => store.state.isAdmin);

    return {
      isAdmin
    };
  },
  methods: {
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>