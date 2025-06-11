<template>
  <div class="home-page min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-extrabold text-white text-center mb-8">Welcome to EiroPlaza</h1>
      
      <div class="bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Explore Countries</h2>
          
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading countries...</p>
          </div>

          <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p class="font-bold">Error</p>
            <p>{{ error }}</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="country in countries" :key="country._id" 
                 class="bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ country.name }}</h3>
                <p class="text-sm text-gray-600 mb-2">Capital: {{ country.capital }}</p>
                <button @click="goToCountryDetails(country)" 
                        class="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-300">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
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