<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-white text-center">Loading...</div>
    <div v-else-if="error" class="text-white text-center">
      <p>{{ error }}</p>
      <button @click="goBack" class="mt-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500">Go Back</button>
    </div>
    <div v-else-if="country" class="country-details max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <h2 class="text-2xl font-bold mb-2">{{ country.name }}</h2>
      <p><strong>Capital:</strong> {{ country.capital }}</p>
      <p><strong>Population:</strong> {{ country.population }}</p>
      <p><strong>Languages:</strong> {{ country.languages.join(', ') }}</p>
      <p><strong>Timezone:</strong> {{ country.timezone }}</p>
      <button @click="goBack" class="mt-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500">Back to Search</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'CountryDetails',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const country = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchCountryDetails = async (id) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(`http://localhost:3000/api/countries/${id}`);
        country.value = response.data;
      } catch (err) {
        error.value = 'Failed to fetch country details';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => fetchCountryDetails(route.params.id));

    watch(() => route.params.id, (newId) => {
      fetchCountryDetails(newId);
    });

    const goBack = () => {
      router.push('/');
    };

    return {
      country,
      loading,
      error,
      goBack
    };
  }
};
</script>

<style scoped>
.country-details {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>