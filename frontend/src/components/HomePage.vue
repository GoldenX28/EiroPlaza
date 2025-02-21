<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div class="md:flex">
        <div class="p-8 w-full">
          <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">EiroPlaza</div>
          <h1 class="block mt-1 text-lg leading-tight font-medium text-black">Explore Countries</h1>
          <p class="mt-2 text-gray-500">Search for country information</p>
          <div class="mt-4">
            <input 
              v-model="searchQuery" 
              @input="filterCountries"
              class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Search for a country..."
            />
            <ul v-if="filteredCountries.length > 0" class="mt-2 bg-white border border-gray-200 rounded-md shadow-sm">
              <li 
                v-for="country in filteredCountries" 
                :key="country.name"
                @click="selectCountry(country.name)"
                class="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition duration-150 ease-in-out"
              >
                {{ country.name }}
              </li>
            </ul>
            <button 
              @click="searchCountry" 
              class="w-full mt-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 transition duration-150 ease-in-out"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      searchQuery: '',
      countries: [
        { name: 'France', capital: 'Paris', population: '67 million', languages: ['French'], timezone: 'CET (UTC+1)' },
        { name: 'Germany', capital: 'Berlin', population: '83 million', languages: ['German'], timezone: 'CET (UTC+1)' },
        { name: 'Spain', capital: 'Madrid', population: '47 million', languages: ['Spanish'], timezone: 'CET (UTC+1)' },
        { name: 'Italy', capital: 'Rome', population: '60 million', languages: ['Italian'], timezone: 'CET (UTC+1)' },
        { name: 'Portugal', capital: 'Lisbon', population: '10 million', languages: ['Portuguese'], timezone: 'WET (UTC+0)' }
      ],
      filteredCountries: []
    }
  },
  methods: {
    filterCountries() {
      const query = this.searchQuery.toLowerCase()
      this.filteredCountries = this.countries.filter(country =>
        country.name.toLowerCase().startsWith(query)
      )
    },
    selectCountry(countryName) {
      this.searchQuery = countryName
      this.filteredCountries = []
    },
    searchCountry() {
      const country = this.countries.find(c => c.name.toLowerCase() === this.searchQuery.toLowerCase())
      if (country) {
        this.$router.push({ name: 'CountryDetails', params: { countryData: JSON.stringify(country) } })
      } else {
        alert('Country not found')
      }
    }
  }
}
</script>