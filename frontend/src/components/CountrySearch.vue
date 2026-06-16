<template>
  <div class="country-search">
    <input 
      v-model="searchQuery" 
      @input="debounceSearch"
      type="text" 
      placeholder="Meklēt valsti..."
      class="w-full p-2 rounded-md text-gray-800 bg-white"
    >
    <div v-if="loading" class="absolute bg-white p-2 rounded-md mt-1 w-full text-gray-800 z-10">Notiek meklēšana...</div>
    <ul v-else-if="searchResults.length > 0" class="absolute bg-white p-2 rounded-md mt-1 w-full max-h-60 overflow-y-auto z-10">
      <li 
        v-for="country in searchResults" 
        :key="country._id" 
        class="p-2 hover:bg-gray-100 cursor-pointer text-gray-800"
        @click="goToCountryDetails(country)"
      >
        <div class="font-medium">{{ getCountryDisplayName(country) }}</div>
        <div v-if="getCountryOfficialDisplayName(country)" class="text-xs text-gray-500">{{ getCountryOfficialDisplayName(country) }}</div>
        <div class="text-xs text-gray-500">
          {{ country.capital }}<span v-if="country.continent"> • {{ country.continent }}</span><span v-if="country.region"> • {{ country.region }}</span>
        </div>
      </li>
    </ul>
    <div v-else-if="searchQuery && !loading" class="absolute bg-white p-2 rounded-md mt-1 w-full text-gray-800 z-10">Rezultāti netika atrasti</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { getCountryDisplayName, getCountryOfficialDisplayName } from '../utils/countryLabels';

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
        const response = await axios.get(`/api/countries/search?query=${searchQuery.value}`);
        searchResults.value = response.data;
      } catch (error) {
        console.error('Kļūda, meklējot valstis:', error);
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
      // Šeit vari pievienot jebkuru inicializācijas loģiku, ja tā vajadzīga
    });

    return {
      getCountryDisplayName,
      getCountryOfficialDisplayName,
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
  position: relative;
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