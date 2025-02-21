<template>
  <div class="country-details p-6 bg-blue-50 rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">{{ country.name }}</h1>
    <p class="mb-2"><strong>Capital:</strong> {{ country.capital }}</p>
    <p class="mb-2"><strong>Population:</strong> {{ country.population }}</p>
    <p class="mb-2"><strong>Languages:</strong> {{ country.languages.join(', ') }}</p>
    <p class="mb-2"><strong>Timezone:</strong> {{ country.timezone }}</p>
    <button @click="goBack" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Back to Search
    </button>
  </div>
</template>

<script>
export default {
  name: 'CountryDetails',
  data() {
    return {
      country: null
    }
  },
  created() {
    // Retrieve the country data from the route params
    this.country = JSON.parse(this.$route.params.countryData);
  },
  methods: {
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>