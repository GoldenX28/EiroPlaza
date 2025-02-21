<template>
  <div class="p-6 max-w-lg mx-auto bg-white rounded-2xl shadow-lg mt-10">
    <h1 class="text-3xl font-extrabold text-center text-blue-600 mb-6">European Country Info</h1>
    <input v-model="searchQuery" placeholder="Search for a country" class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
    <button @click="searchCountry" class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg w-full shadow hover:shadow-lg transition duration-300">Search</button>
    <div v-if="countryInfo" class="mt-6 p-4 bg-blue-50 rounded-lg shadow">
      <h2 class="text-2xl font-semibold text-blue-700">{{ countryInfo.name }}</h2>
      <p class="mt-2"><strong>Capital:</strong> {{ countryInfo.capital }}</p>
      <p><strong>Population:</strong> {{ countryInfo.population }}</p>
      <p><strong>Languages:</strong> {{ countryInfo.languages.join(', ') }}</p>
      <p><strong>Timezone:</strong> {{ countryInfo.timezone }}</p>
    </div>
    <div v-else-if="searchQuery && !countryInfo" class="mt-6 text-red-500 text-center">
      <p>Country not found. Please try again.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      countryInfo: null,
      countries: [
        { name: 'France', capital: 'Paris', population: '67 million', languages: ['French'], timezone: 'CET (UTC+1)' },
        { name: 'Germany', capital: 'Berlin', population: '83 million', languages: ['German'], timezone: 'CET (UTC+1)' },
        { name: 'Spain', capital: 'Madrid', population: '47 million', languages: ['Spanish'], timezone: 'CET (UTC+1)' },
        { name: 'Italy', capital: 'Rome', population: '60 million', languages: ['Italian'], timezone: 'CET (UTC+1)' },
        { name: 'Portugal', capital: 'Lisbon', population: '10 million', languages: ['Portuguese'], timezone: 'WET (UTC+0)' }
      ]
    };
  },
  methods: {
    searchCountry() {
      this.countryInfo = this.countries.find(country => 
        country.name.toLowerCase() === this.searchQuery.trim().toLowerCase()
      );
    }
  }
};
</script>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to right, #83a4d4, #b6fbff);
  min-height: 100vh;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>