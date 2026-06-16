<template>
  <div class="min-h-screen overflow-x-auto bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_32%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_48%,_#7c3aed_100%)] py-10 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto w-full text-white">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">EiroPlaza</p>
        <h1 class="mt-2 text-4xl font-black sm:text-5xl">Valstu salīdzinātājs</h1>
        <p class="mt-3 max-w-3xl text-lg text-white/85">
          Izvēlies vairākas pieejamās valstis un salīdzini tās blakus vienā tabulā. Vari ātri saprast, kā atšķiras galvaspilsētas, iedzīvotāji, teritorija, valodas un citi pamata dati.
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-[360px,1fr]">
        <section class="rounded-3xl border border-white/15 bg-slate-950/35 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-white/80" for="compare-search">Meklēt valsti</label>
              <input
                id="compare-search"
                v-model.trim="searchQuery"
                type="text"
                placeholder="Sāc rakstīt valsts nosaukumu..."
                class="mt-2 w-full rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              >
            </div>

            <div class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
              <div>
                <p class="text-sm font-semibold text-white">Izvēlētās valstis</p>
                <p class="text-xs text-white/70">{{ selectedCountries.length }} no {{ maxSelected }} vietām</p>
              </div>
              <button
                v-if="selectedCountryIds.length"
                @click="clearSelection"
                class="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10"
              >
                Notīrīt
              </button>
            </div>

              <div v-if="selectedCountries.length" class="space-y-2">
              <div
                v-for="country in selectedCountries"
                :key="country._id"
                class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/90 px-3 py-2 text-slate-900 text-xs"
              >
                <div class="min-w-0">
                  <p class="truncate font-semibold text-sm">{{ getCountryDisplayName(country) }}</p>
                  <p class="truncate text-xs text-slate-500">{{ getCountryOfficialDisplayName(country) || country.capital }}</p>
                </div>
                <button
                  @click="toggleCountry(country)"
                  class="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  Noņemt
                </button>
              </div>
            </div>

            <p v-else class="rounded-2xl border border-dashed border-white/20 bg-white/6 px-4 py-5 text-sm text-white/75">
              Atzīmē vismaz divas valstis, lai redzētu salīdzinājumu.
            </p>

            <div class="rounded-3xl bg-white/95 p-4 text-slate-900 shadow-xl">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-indigo-700">Filtri</p>
                  <p class="text-sm text-slate-600">Meklē pēc nosaukuma vai galvaspilsētas.</p>
                </div>
                <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{{ filteredCountries.length }} rezultāti</span>
              </div>
            </div>
          </div>

            <div class="mt-5 space-y-2 max-h-[520px] overflow-y-auto pr-1">
            <button
              v-for="country in filteredCountries"
              :key="country._id"
              @click="toggleCountry(country)"
              class="flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition"
              :class="selectedCountryIds.includes(country._id)
                ? 'border-amber-300 bg-amber-50 text-slate-900 shadow-lg shadow-amber-500/10'
                : 'border-white/10 bg-white/90 text-slate-800 hover:border-indigo-200 hover:bg-white'"
            >
              <img
                v-if="country.flags?.png || country.flag"
                :src="country.flags?.png || country.flag"
                :alt="getCountryNameForFlag(country)"
                class="h-8 w-10 rounded-xl object-cover ring-1 ring-black/5"
              >
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-sm">{{ getCountryDisplayName(country) }}</p>
                <p class="truncate text-xs text-slate-500">{{ country.capital || 'Nav galvaspilsētas' }}<span v-if="country.continent"> • {{ country.continent }}</span></p>
              </div>
              <span class="text-lg font-black" :class="selectedCountryIds.includes(country._id) ? 'text-amber-500' : 'text-slate-300'">★</span>
            </button>
          </div>
        </section>

        <section class="rounded-3xl border border-white/15 bg-white/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur text-slate-900">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Salīdzinājuma tabula</h2>
              <p class="mt-1 text-sm text-slate-500">Katras izvēlētās valsts dati ir izvietoti blakus, lai atšķirības būtu uzreiz redzamas.</p>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="selectedCountryIds.length === 2" class="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
                <span class="text-sm text-slate-600">Atšķirības režīms:</span>
                <button @click="comparisonMode = 'absolute'" :class="['px-3 py-1 rounded-xl text-sm font-semibold', comparisonMode === 'absolute' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700']">Absolūti</button>
                <button @click="comparisonMode = 'percent'" :class="['px-3 py-1 rounded-xl text-sm font-semibold', comparisonMode === 'percent' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700']">Procentuāli</button>
              </div>

              <div v-if="selectedCountryIds.length > 2" class="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
                <span class="text-sm text-slate-600 mr-2">Kārtot pēc:</span>
                <select v-model="sortField" class="rounded-xl px-2 py-1 text-sm">
                  <option value="">-- Nav --</option>
                  <option v-for="f in numericSortFields" :key="f.key" :value="f.key">{{ f.label }}</option>
                </select>
                <button v-if="sortField" @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'" class="px-2 py-1 rounded-xl text-sm">{{ sortDirection === 'asc' ? '↑' : '↓' }}</button>
                
              </div>

              <button
                @click="goHome"
                class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Atpakaļ uz sākumu
              </button>
            </div>
          </div>

          <div v-if="loading" class="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Notiek valstu ielāde...
          </div>

          <div v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
            {{ error }}
          </div>

          <div v-else-if="selectedCountries.length < 2" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
            Izvēlies vismaz divas valstis, lai sāktu salīdzināt parametrus.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-max border-separate border-spacing-0">
              <thead>
                <tr>
                  <th class="sticky left-0 z-20 border-b border-slate-200 bg-white px-2 py-2 text-left text-xs font-bold text-slate-700">Parametrs</th>
                  <th
                    v-for="country in selectedCountriesForTable"
                    :key="country._id"
                    class="min-w-[180px] border-b border-slate-200 px-2 py-2 text-left align-top"
                  >
                    <div class="rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 p-4">
                      <div class="flex items-center gap-3">
                        <img
                          v-if="country.flags?.png || country.flag"
                          :src="country.flags?.png || country.flag"
                          :alt="getCountryNameForFlag(country)"
                          class="h-8 w-12 rounded-lg object-cover"
                        >
                        <div>
                          <p class="font-black text-slate-900">{{ getCountryDisplayName(country) }}</p>
                          <p class="text-xs text-slate-500">{{ getCountryOfficialDisplayName(country) || 'Nav oficiālā nosaukuma' }}</p>
                        </div>
                      </div>
                      <button
                        @click="toggleCountry(country)"
                        class="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Noņemt
                      </button>
                    </div>
                  </th>
                  <th v-if="selectedCountries.length === 2" class="border-b border-slate-200 px-2 py-2 text-left text-xs font-bold text-slate-700">Atšķirība</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonRows" :key="row.key" class="align-top">
                  <th class="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold text-slate-700">
                    {{ row.label }}
                  </th>
                  <td v-for="country in selectedCountriesForTable" :key="`${row.key}-${country._id}`" class="border-b border-slate-200 px-2 py-2 align-top text-xs text-slate-700">
                    <span v-if="row.value(country)" class="inline-flex min-h-10 items-center rounded-2xl bg-slate-50 px-3 py-2 leading-6 text-slate-800">
                      {{ row.value(country) }}
                    </span>
                    <span v-else class="text-slate-400">Nav datu</span>
                  </td>
                  <td v-if="selectedCountries.length === 2" class="border-b border-slate-200 px-2 py-2 align-top text-xs">
                    <span v-if="computeRowDifference(row.key)" :class="computeDifferenceClass(row.key)">{{ computeRowDifference(row.key) }}</span>
                    <span v-else class="text-slate-400">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { getCountryDisplayName, getCountryOfficialDisplayName, getCountryNameForFlag } from '../utils/countryLabels';

export default {
  name: 'CountryComparator',
  setup() {
    const router = useRouter();
    const countries = ref([]);
    const loading = ref(true);
    const error = ref('');
    const searchQuery = ref('');
    // removed continentFilter per request
    const comparisonMode = ref('absolute'); // 'absolute' or 'percent'
    const sortField = ref('');
    const sortDirection = ref('desc'); // 'asc' or 'desc'
    
    const selectedCountryIds = ref([]);
    const maxSelected = 4;

    const fetchCountries = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await axios.get('/api/countries');
        countries.value = Array.isArray(response.data) ? response.data : [];
      } catch (fetchError) {
        error.value = 'Neizdevās ielādēt valstis salīdzināšanai.';
        console.error('Kļūda, ielādējot valstis salīdzināšanai:', fetchError);
      } finally {
        loading.value = false;
      }
    };

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const filteredCountries = computed(() => {
      const search = normalize(searchQuery.value);

      return [...countries.value]
        .filter((country) => {
          const displayName = getCountryDisplayName(country);
          const officialName = getCountryOfficialDisplayName(country);
          const haystack = [displayName, officialName, country.name, country.officialName, country.capital, country.region, country.subregion]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return (!search || haystack.includes(search));
        })
        .sort((left, right) => getCountryDisplayName(left).localeCompare(getCountryDisplayName(right), 'lv', { sensitivity: 'base' }));
    });

    const selectedCountries = computed(() => {
      const selected = new Set(selectedCountryIds.value.map(String));
      return countries.value.filter((country) => selected.has(String(country._id)));
    });

    const numericSortFields = [
      { key: 'population', label: 'Iedzīvotāji' },
      { key: 'area', label: 'Platība' }
    ];

    const selectedCountriesForTable = computed(() => {
      if (!sortField.value || selectedCountryIds.value.length <= 2) return selectedCountries.value;

      // sort by numeric field
      const key = sortField.value;
      return [...selectedCountries.value].sort((a, b) => {
        const av = Number(a[key] || 0);
        const bv = Number(b[key] || 0);
        return sortDirection.value === 'asc' ? av - bv : bv - av;
      });
    });

    const isNumericKey = (k) => ['population', 'area'].includes(k);

    

    const comparisonRows = computed(() => ([
      { key: 'capital', label: 'Galvaspilsēta', value: (country) => country.capital },
      { key: 'population', label: 'Iedzīvotāji', value: (country) => new Intl.NumberFormat('lv-LV').format(Number(country.population || 0)) },
      { key: 'area', label: 'Platība', value: (country) => country.area ? `${new Intl.NumberFormat('lv-LV').format(Number(country.area))} km²` : '' },
      { key: 'continent', label: 'Kontinents', value: (country) => country.continent },
      { key: 'region', label: 'Reģions', value: (country) => country.region },
      { key: 'subregion', label: 'Apakšreģions', value: (country) => country.subregion },
      { key: 'languages', label: 'Valodas', value: (country) => Array.isArray(country.languages) ? country.languages.join(', ') : '' },
      { key: 'currency', label: 'Valūta', value: (country) => country.currency?.code ? `${country.currency.name || ''}${country.currency.name && country.currency.code ? ' (' : ''}${country.currency.code}${country.currency.name && country.currency.code ? ')' : ''}`.trim() : (country.currency?.name || '') },
      { key: 'timezone', label: 'Laika josla', value: (country) => country.primaryTimezone ? `${country.primaryTimezone}${country.primaryUtcOffset ? ` (${country.primaryUtcOffset})` : ''}` : (country.timezone || '') },
      { key: 'independent', label: 'Neatkarīga', value: (country) => country.independent === null || country.independent === undefined ? '' : (country.independent ? 'Jā' : 'Nē') },
      { key: 'landlocked', label: 'Iekšzemes valsts', value: (country) => country.landlocked === null || country.landlocked === undefined ? '' : (country.landlocked ? 'Jā' : 'Nē') },
      { key: 'unMember', label: 'ANO dalībvalsts', value: (country) => country.unMember === null || country.unMember === undefined ? '' : (country.unMember ? 'Jā' : 'Nē') },
      { key: 'borders', label: 'Robežvalstis', value: (country) => Array.isArray(country.borders) && country.borders.length ? country.borders.join(', ') : '' },
      { key: 'tld', label: 'Domēni', value: (country) => Array.isArray(country.tld) && country.tld.length ? country.tld.join(', ') : '' },
      { key: 'fifa', label: 'FIFA kods', value: (country) => country.fifa || '' }
    ]));

    const toggleCountry = (country) => {
      const id = String(country?._id || '');
      if (!id) {
        return;
      }

      const existingIndex = selectedCountryIds.value.indexOf(id);
      if (existingIndex >= 0) {
        selectedCountryIds.value = selectedCountryIds.value.filter((selectedId) => selectedId !== id);
        return;
      }

      if (selectedCountryIds.value.length >= maxSelected) {
        selectedCountryIds.value = [...selectedCountryIds.value.slice(1), id];
        return;
      }

      selectedCountryIds.value = [...selectedCountryIds.value, id];
    };

    const computeRowDifference = (rowKey) => {
      if (selectedCountries.value.length !== 2) return '';

      const row = comparisonRows.value.find((r) => r.key === rowKey);
      if (!row) return '';

      const left = row.value(selectedCountries.value[0]) || '';
      const right = row.value(selectedCountries.value[1]) || '';

      // Numeric handling
      if (isNumericKey(rowKey)) {
        const a = Number(selectedCountries.value[0][rowKey] || 0);
        const b = Number(selectedCountries.value[1][rowKey] || 0);
        const diff = b - a;

        if (comparisonMode.value === 'absolute') {
          return (diff >= 0 ? '+' : '-') + new Intl.NumberFormat('lv-LV').format(Math.abs(diff));
        }

        if (a === 0) return '—';
        const pct = (diff / a) * 100;
        return (pct >= 0 ? '+' : '-') + Math.abs(pct).toFixed(1) + '%';
      }

      // Non-numeric: compare normalized display values
      const normalizeDisplay = (v) => String(v || '').trim().toLowerCase();
      const la = normalizeDisplay(left);
      const lb = normalizeDisplay(right);
      if (la === '' && lb === '') return '';
      return la === lb ? 'O' : 'X';
    };

    const computeDifferenceClass = (rowKey) => {
      if (selectedCountries.value.length !== 2) return 'text-slate-400';
      if (isNumericKey(rowKey)) return 'text-slate-700 font-semibold text-xs';
      const row = comparisonRows.value.find((r) => r.key === rowKey);
      if (!row) return '';
      const left = String(row.value(selectedCountries.value[0]) || '').trim().toLowerCase();
      const right = String(row.value(selectedCountries.value[1]) || '').trim().toLowerCase();
      if (left === '' && right === '') return 'text-slate-400';
      return left === right ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold';
    };

    const clearSelection = () => {
      selectedCountryIds.value = [];
    };

    const goHome = () => {
      router.push({ name: 'Home' });
    };

    

    onMounted(() => {
      fetchCountries();
    });

    return {
      countries,
      loading,
      error,
      searchQuery,
      selectedCountryIds,
      selectedCountries,
      maxSelected,
      filteredCountries,
      comparisonMode,
      sortField,
      sortDirection,
      numericSortFields,
      selectedCountriesForTable,
      comparisonRows,
      computeRowDifference,
      computeDifferenceClass,
      toggleCountry,
      clearSelection,
      goHome,
      
      getCountryDisplayName,
      getCountryOfficialDisplayName,
      getCountryNameForFlag
    };
  }
};
</script>