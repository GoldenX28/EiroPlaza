<template>
  <div class="home-page min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_32%),linear-gradient(135deg,_#2563eb_0%,_#4f46e5_52%,_#7c3aed_100%)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="hero-shell mb-8 text-white">
        <p class="hero-kicker">EiroPlaza</p>
        <h1 class="text-4xl sm:text-5xl font-black mb-3">Laipni lūgti EiroPlaza</h1>
        <p class="max-w-3xl text-white/85 text-lg">Pārlūko Eiropas valstis ar sakārtotām kartītēm, galveno informāciju un pilno profilu vienā klikšķī.</p>
      </div>
      
      <div class="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/60">
        <div class="p-6 sm:p-8">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Izpēti valstis</h2>
              <p class="text-sm text-gray-500">Kartītēs redzi galveno informāciju, detaļās — visu pārējo.</p>
            </div>
          </div>

          <div v-if="isLoggedIn && favoriteCountryCards.length" class="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <button
              @click="toggleFavoritesDropdown"
              class="flex w-full items-center justify-between gap-3 rounded-xl bg-white/90 px-4 py-3 text-left border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <div>
                <p class="text-sm font-semibold text-amber-800">Favorīti</p>
                <p class="text-xs text-amber-700">{{ favoriteCountryCards.length }} atzīmētas valstis</p>
              </div>
              <span class="text-lg font-black text-amber-800 transition-transform duration-200" :class="showFavoritesDropdown ? 'rotate-180' : ''">⌄</span>
            </button>

            <div v-if="showFavoritesDropdown" class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="country in favoriteCountryCards"
                :key="country._id"
                @click="goToCountryDetails(country)"
                class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <span>★</span>
                <span>{{ getCountryDisplayName(country) }}</span>
              </button>
            </div>
          </div>

          <div class="mb-6 grid gap-3 lg:grid-cols-5">
            <label class="filter-field">
              <span class="filter-label">{{ t('searchCountry') }}</span>
              <input v-model.trim="searchQuery" type="text" :placeholder="t('searchCountryPlaceholder')" class="filter-input">
            </label>

            <label class="filter-field">
              <span class="filter-label">{{ t('continent') }}</span>
              <select v-model="continentFilter" class="filter-input">
                <option value="">Visi</option>
                <option v-for="continent in availableContinents" :key="continent" :value="continent">{{ continent }}</option>
              </select>
            </label>

            <label class="filter-field">
              <span class="filter-label">{{ t('sortBy') }}</span>
              <select v-model="sortBy" class="filter-input">
                <option value="name">{{ t('name') }}</option>
                <option value="capital">{{ t('capital') }}</option>
                <option value="population">{{ t('population') }}</option>
              </select>
            </label>

            <label class="filter-field">
              <span class="filter-label">{{ t('order') }}</span>
              <select v-model="sortDirection" class="filter-input">
                <option value="asc">{{ t('ascending') }}</option>
                <option value="desc">{{ t('descending') }}</option>
              </select>
            </label>

            <label class="filter-field">
              <span class="filter-label">{{ t('timezone') }}</span>
              <select v-model="timezoneFilter" class="filter-input">
                <option value="">{{ t('all') }}</option>
                <option v-for="timezone in availableTimezones" :key="timezone" :value="timezone">{{ timezone }}</option>
              </select>
            </label>
          </div>

          <div class="mb-6">
            <p class="filter-label mb-2">Ātrie tagi</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tagOption in availableTagOptions"
                :key="tagOption.key"
                @click="toggleTag(tagOption.key)"
                :class="['tag-chip', selectedTags.includes(tagOption.key) ? 'tag-chip-active' : 'tag-chip-inactive']"
              >
                {{ tagOption.label }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between mb-4 text-sm text-gray-500">
            <p>{{ t('resultsShown') }} {{ filteredCountries.length }} {{ t('of') }} {{ countries.length }} {{ t('countries') }}</p>
            <button v-if="hasActiveFilters" @click="clearFilters" class="text-indigo-600 font-semibold hover:text-indigo-700">{{ t('clearFilters') }}</button>
          </div>
          
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p class="mt-4 text-gray-600">Notiek valstu ielāde...</p>
          </div>

          <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p class="font-bold">Kļūda</p>
            <p>{{ error }}</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="country in filteredCountries" :key="country._id" 
                 class="country-card relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <button
                v-if="isLoggedIn"
                @click.stop="toggleFavorite(country)"
                :class="['absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all', isFavorite(country) ? 'bg-amber-400 border-amber-300 text-white' : 'bg-white/95 border-gray-200 text-gray-500 hover:text-amber-500']"
                :aria-label="isFavorite(country) ? 'Noņemt no favorītiem' : 'Pievienot favorītiem'"
                :title="isFavorite(country) ? 'Noņemt no favorītiem' : 'Pievienot favorītiem'"
              >
                ★
              </button>
              <div class="p-4">
                <img
                  v-if="country.flags?.png || country.flag"
                  :src="country.flags?.png || country.flag"
                  :alt="getCountryFlagDescription(country)"
                  class="w-full h-32 object-cover rounded-xl mb-4 bg-white"
                >
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ getCountryDisplayName(country) }}</h3>
                <p v-if="getCountryOfficialDisplayName(country)" class="text-sm text-gray-500 mb-2">{{ getCountryOfficialDisplayName(country) }}</p>
                <div class="space-y-1.5 text-sm text-gray-600">
                  <p>Galvaspilsēta: <span class="font-medium text-gray-800">{{ country.capital }}</span></p>
                  <p v-if="country.continent">Kontinents: <span class="font-medium text-gray-800">{{ country.continent }}</span></p>
                  <p v-if="country.region">Reģions: <span class="font-medium text-gray-800">{{ country.region }}</span></p>
                  <p v-if="country.population">Iedzīvotāji: <span class="font-medium text-gray-800">{{ formatNumber(country.population) }}</span></p>
                </div>
                <div class="mt-4 flex flex-wrap gap-2" v-if="country.currency?.code || country.primaryUtcOffset || country.borders?.length">
                  <span v-if="country.currency?.code" class="chip">{{ country.currency.code }}</span>
                  <span v-if="country.primaryUtcOffset" class="chip">{{ country.primaryUtcOffset }}</span>
                  <span v-if="isFavorite(country)" class="chip chip-favorite">Favorīts</span>
                  <span v-if="country.borders?.length" class="chip">{{ country.borders.length }} robežas</span>
                </div>
                <button @click="goToCountryDetails(country)" 
                        class="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300">
                  Skatīt informāciju
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import { t } from '../utils/translate';
import { getCountryDisplayName, getCountryOfficialDisplayName, getCountryNameForFlag, getCountryFlagDescription } from '../utils/countryLabels';

const TAG_TRANSLATIONS = {
  Europe: 'Eiropa',
  'Northern Europe': 'Ziemeļ Eiropa',
  'Southern Europe': 'Dienvid Eiropa',
  'Western Europe': 'Rietum Eiropa',
  'Eastern Europe': 'Austrum Eiropa',
  'Central Europe': 'Centrāl Eiropa',
  'Southeast Europe': 'Dienvidaustrum Eiropa',
  English: 'Angļu',
  French: 'Franču',
  German: 'Vācu',
  Spanish: 'Spāņu',
  Portuguese: 'Portugāļu',
  Italian: 'Itāļu',
  Dutch: 'Nīderlandiešu',
  Swedish: 'Zviedru',
  Norwegian: 'Norvēģu',
  Danish: 'Dāņu',
  Finnish: 'Somu',
  Icelandic: 'Islandiešu',
  Irish: 'Īru',
  Welsh: 'Velsiešu',
  Polish: 'Poļu',
  Czech: 'Čehu',
  Slovak: 'Slovāku',
  Slovenian: 'Slovēņu',
  Croatian: 'Horvātu',
  Serbian: 'Serbu',
  Bosnian: 'Bosniešu',
  Montenegrin: 'Melnkalniešu',
  Albanian: 'Albāņu',
  Macedonian: 'Maķedoniešu',
  Greek: 'Grieķu',
  Romanian: 'Rumāņu',
  Bulgarian: 'Bulgāru',
  Hungarian: 'Ungāru',
  Latvian: 'Latviešu',
  Lithuanian: 'Lietuviešu',
  Estonian: 'Igauņu',
  Russian: 'Krievu',
  Ukrainian: 'Ukraiņu',
  Belarusian: 'Baltkrievu',
  Turkish: 'Turku'
};

export default {
  name: 'HomePage',
  data() {
    return {
      countries: [],
      loading: true,
      error: null,
      searchQuery: '',
      continentFilter: '',
      timezoneFilter: '',
      selectedTags: [],
      showFavoritesDropdown: false,
      sortBy: 'name',
      sortDirection: 'asc'
    }
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:3000/api/countries');
      this.countries = response.data;
    } catch (error) {
      console.error('Kļūda, ielādējot valstis:', error);
      this.error = 'Neizdevās ielādēt valstis. Lūdzu, mēģini vēlreiz vēlāk.';
    } finally {
      this.loading = false;
    }
  },
  setup() {
    const store = useStore();
    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const favoriteCountryIds = computed(() => (store.state.user?.favoriteCountries || []).map(String));

    return {
      isLoggedIn,
      favoriteCountryIds,
      store
    };
  },
  methods: {
    t,
    getCountryDisplayName,
    getCountryOfficialDisplayName,
    getCountryNameForFlag,
    getCountryFlagDescription,
    formatNumber(value) {
      return new Intl.NumberFormat('lv-LV').format(Number(value || 0));
    },
    goToCountryDetails(country) {
      if (country && country._id) {
        this.$router.push({ name: 'CountryDetails', params: { id: country._id } });
      } else {
        console.error('Nederīgs valsts objekts:', country);
      }
    },
    isFavorite(country) {
      return this.favoriteCountryIds.includes(String(country?._id));
    },
    async toggleFavorite(country) {
      if (!country?._id || !this.isLoggedIn) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/api/auth/favorites/${country._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.store.commit('SET_USER', {
          ...this.store.state.user,
          favoriteCountries: response.data.favoriteCountries || []
        });
      } catch (error) {
        console.error('Kļūda, mainot favorītu:', error);
      }
    },
    toggleFavoritesDropdown() {
      this.showFavoritesDropdown = !this.showFavoritesDropdown;
    },
    clearFilters() {
      this.searchQuery = '';
      this.continentFilter = '';
      this.timezoneFilter = '';
      this.selectedTags = [];
      this.sortBy = 'name';
      this.sortDirection = 'asc';
    },
    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = this.selectedTags.filter((selectedTag) => selectedTag !== tag);
        return;
      }

      this.selectedTags = [...this.selectedTags, tag];
    },
    getCountryTags(country) {
      return [
        country.continent,
        country.region,
        country.subregion,
        country.currency?.code,
        country.capital,
        ...(Array.isArray(country.languages) ? country.languages.slice(0, 2) : [])
      ]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean);
    },
    getTagLabel(tag) {
      if (TAG_TRANSLATIONS[tag]) {
        return TAG_TRANSLATIONS[tag];
      }

      if (/^[A-Z]{3}$/.test(tag)) {
        return tag;
      }

      return tag
        .replace('Northern', 'Ziemeļu')
        .replace('Southern', 'Dienvidu')
        .replace('Western', 'Rietumu')
        .replace('Eastern', 'Austrumu')
        .replace('Central', 'Centrāl')
        .replace('Europe', 'Eiropa');
    },
    compareValues(leftValue, rightValue) {
      const left = leftValue ?? '';
      const right = rightValue ?? '';
      if (typeof left === 'number' && typeof right === 'number') return left - right;
      return String(left).localeCompare(String(right), 'lv', { sensitivity: 'base' });
    }
  },
  computed: {
    availableContinents() {
      return [...new Set(this.countries.map((country) => country.continent).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'lv', { sensitivity: 'base' }));
    },
    availableTimezones() {
      const timezoneSet = new Set();

      this.countries.forEach((country) => {
        // Prefer primaryUtcOffset (computed from capital coords). Fallback to existing timezone fields.
        if (country.primaryUtcOffset) {
          timezoneSet.add(String(country.primaryUtcOffset).trim());
        } else if (Array.isArray(country.timezones) && country.timezones.length) {
          country.timezones.filter(Boolean).forEach((tz) => timezoneSet.add(String(tz).trim()));
        } else if (country.timezone) {
          timezoneSet.add(String(country.timezone).trim());
        }
      });

      return [...timezoneSet].filter(Boolean).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    },
    availableTags() {
      const frequency = new Map();

      this.countries.forEach((country) => {
        const uniqueTags = [...new Set(this.getCountryTags(country))];
        uniqueTags.forEach((tag) => {
          frequency.set(tag, (frequency.get(tag) || 0) + 1);
        });
      });

      return [...frequency.entries()]
        .sort((left, right) => {
          if (right[1] !== left[1]) {
            return right[1] - left[1];
          }
          return left[0].localeCompare(right[0], 'lv', { sensitivity: 'base' });
        })
        .slice(0, 20)
        .map(([tag]) => tag);
    },
    availableTagOptions() {
      return this.availableTags.map((tag) => ({
        key: tag,
        label: this.getTagLabel(tag)
      }));
    },
    favoriteCountryCards() {
      const favoriteIds = new Set(this.favoriteCountryIds);
      return this.countries.filter((country) => favoriteIds.has(String(country._id)));
    },
    hasActiveFilters() {
      return Boolean(this.searchQuery || this.continentFilter || this.timezoneFilter || this.selectedTags.length || this.sortBy !== 'name' || this.sortDirection !== 'asc');
    },
    filteredCountries() {
      const query = this.searchQuery.toLowerCase();
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      const favoriteIds = new Set(this.favoriteCountryIds);

      return [...this.countries]
        .filter((country) => {
          const matchesQuery = !query || [
            getCountryDisplayName(country),
            getCountryOfficialDisplayName(country),
            country.capital,
            country.region,
            country.continent,
            country.currency?.code
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));

          const matchesContinent = !this.continentFilter || country.continent === this.continentFilter;
          // determine country's primary UTC offset for filtering
          const countryPrimaryOffsets = [];
          if (country.primaryUtcOffset) countryPrimaryOffsets.push(country.primaryUtcOffset);
          if (Array.isArray(country.timezones) && country.timezones.length) countryPrimaryOffsets.push(...country.timezones.filter(Boolean));
          if (country.timezone) countryPrimaryOffsets.push(country.timezone);
          const matchesTimezone = !this.timezoneFilter || countryPrimaryOffsets.map(String).filter(Boolean).includes(this.timezoneFilter);
          const countryTags = this.getCountryTags(country);
          const matchesTags = this.selectedTags.length === 0
            || this.selectedTags.every((selectedTag) => countryTags.includes(selectedTag));

          return matchesQuery && matchesContinent && matchesTimezone && matchesTags;
        })
        .sort((left, right) => {
          const leftFavorite = favoriteIds.has(String(left._id));
          const rightFavorite = favoriteIds.has(String(right._id));

          if (leftFavorite !== rightFavorite) {
            return leftFavorite ? -1 : 1;
          }

          let comparison = 0;

          if (this.sortBy === 'population') {
            comparison = this.compareValues(Number(left.population || 0), Number(right.population || 0));
          } else if (this.sortBy === 'capital') {
            comparison = this.compareValues(left.capital, right.capital);
          } else {
            comparison = this.compareValues(left.name, right.name);
          }

          return comparison * direction;
        });
    }
  }
}
</script>

<style scoped>
.hero-shell {
  padding: 1.25rem 0.25rem 0.5rem;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.16);
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.country-card:hover {
  transform: translateY(-2px);
}

.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: #eef2ff;
  color: #4338ca;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.chip-favorite {
  background: #fef3c7;
  color: #92400e;
}

.tag-chip {
  border-radius: 9999px;
  padding: 0.42rem 0.78rem;
  font-size: 0.78rem;
  font-weight: 700;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tag-chip-active {
  background: #4f46e5;
  color: #fff;
  border-color: #4338ca;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.2);
}

.tag-chip-inactive {
  background: #eef2ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.tag-chip-inactive:hover {
  background: #e0e7ff;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4f46e5;
}

.filter-input {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid #e5e7eb;
  background: white;
  padding: 0.8rem 0.95rem;
  color: #111827;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
</style>