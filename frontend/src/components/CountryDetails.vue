<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-white text-center">Loading...</div>
    <div v-else-if="error" class="text-white text-center">
      <p>{{ error }}</p>
      <button @click="goBack" class="mt-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500">Go Back</button>
    </div>
    <div v-else-if="country" class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div class="md:flex">
        <div class="p-8 w-full">
          <h2 class="text-2xl font-bold mb-2">{{ country.name }}</h2>
          <p><strong>Capital:</strong> {{ country.capital }}</p>
          <p><strong>Population:</strong> {{ country.population }}</p>
          <p><strong>Languages:</strong> {{ country.languages.join(', ') }}</p>
          <p><strong>Timezone:</strong> {{ country.timezone }}</p>
          <button @click="goBack" class="mt-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500">Go Back</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CountryDetails',
  props: ['id'],
  data() {
    return {
      country: null,
      loading: true,
      error: null
    }
  },
  async created() {
    if (!this.id) {
      this.error = 'No country ID provided';
      this.loading = false;
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/countries/${this.id}`);
      this.country = response.data;
    } catch (error) {
      console.error('Error fetching country details:', error);
      this.error = 'Failed to fetch country details. Please try again later.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>