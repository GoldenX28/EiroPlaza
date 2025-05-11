<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-white text-center">Loading...</div>
    <div v-else-if="error" class="text-white text-center">{{ error }}</div>
    <div v-else class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div class="p-8">
        <h1 class="text-2xl font-bold mb-4">Countries</h1>
        <ul>
          <li v-for="country in countries" :key="country._id" class="mb-2">
            <button @click="goToCountryDetails(country)" class="text-blue-600 hover:underline">
              {{ country.name }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      countries: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:3000/api/countries');
      this.countries = response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      this.error = 'Failed to load countries. Please try again later.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    goToCountryDetails(country) {
      if (country && country._id) {
        this.$router.push({ name: 'CountryDetails', params: { id: country._id } });
      } else {
        console.error('Invalid country object:', country);
        // Optionally, show an error message to the user
      }
    }
  }
}
</script>