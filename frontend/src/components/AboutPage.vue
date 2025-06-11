<template>
  <div class="about-page min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-3xl font-extrabold text-gray-900 text-center mb-6">About EiroPlaza</h1>
        
        <div class="prose prose-indigo max-w-none">
          <p class="text-lg text-gray-700 mb-4">
            EiroPlaza is your gateway to exploring the diverse and fascinating countries of Europe. Our platform provides comprehensive information about European nations, including general facts, languages, time zones, and much more.
          </p>
          
          <p class="text-lg text-gray-700 mb-4">
            Whether you're planning a trip, conducting research, or simply curious about European cultures, EiroPlaza offers a wealth of knowledge at your fingertips.
          </p>
          
          <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Features</h2>
          <ul class="list-disc pl-5 space-y-2 text-gray-700">
            <li>Detailed country profiles</li>
            <li>Up-to-date information on languages and time zones</li>
            <li>Cultural insights and travel tips</li>
            <li>User-friendly interface for easy navigation</li>
          </ul>
          
          <p class="text-lg text-gray-700 mt-6">
            We're constantly working to improve and expand our database. Stay tuned for exciting updates, including real-time data integration and API access for developers.
          </p>
        </div>

        <DbHealthCheck v-if="isAdmin" class="mt-8" />

        <div class="mt-8 border-t border-gray-200 pt-6">
          <button @click="goBack" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import DbHealthCheck from './DbHealthCheck.vue';

export default {
  name: 'AboutPage',
  components: {
    DbHealthCheck
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAdmin = computed(() => store.state.isAdmin);

    const goBack = () => {
      router.push('/');
    };

    return {
      isAdmin,
      goBack
    };
  }
}
</script>