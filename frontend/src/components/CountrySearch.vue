<template>
  <div class="country-search">
    <input 
      v-model="searchQuery" 
      @input="debounceSearch"
      type="text" 
      placeholder="Search for a country..."
      class="search-input"
    >
    <div v-if="loading">Searching...</div>
    <ul v-else-if="searchResults.length > 0" class="search-results">
      <li 
        v-for="country in searchResults" 
        :key="country._id" 
        class="search-result-item"
        @click="goToCountryDetails(country)"
      >
        {{ country.name }} - {{ country.capital }}
      </li>
    </ul>
    <div v-else-if="searchQuery && !loading">No results found</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'CountrySearch',
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const loading = ref(false);
    let debounceTimer;
    const router = useRouter();

    const searchCountries = async () => {
      if (!searchQuery.value) {
        searchResults.value = [];
        return;
      }

      loading.value = true;
      try {
        const response = await axios.get(`http://localhost:3000/api/countries/search?query=${searchQuery.value}`);
        searchResults.value = response.data;
      } catch (error) {
        console.error('Error searching countries:', error);
      } finally {
        loading.value = false;
      }
    };

    const debounceSearch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(searchCountries, 300);
    };

    const goToCountryDetails = (country) => {
      router.push({ name: 'CountryDetails', params: { id: country._id } });
    };

    onMounted(() => {
      // You can add any initialization logic here if needed
    });

    return {
      searchQuery,
      searchResults,
      loading,
      debounceSearch,
      goToCountryDetails
    };
  }
};
</script>

<style scoped>
.country-search {
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-results {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
}

.search-result-item {
  padding: 10px;
  border: 1px solid #eee;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.search-result-item:hover {
  background-color: #f0f0f0;
}
</style>