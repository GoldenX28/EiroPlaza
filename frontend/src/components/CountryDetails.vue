<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.28),_transparent_38%),linear-gradient(135deg,_#1d4ed8_0%,_#6366f1_55%,_#8b5cf6_100%)] py-10 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-white text-center text-lg font-medium">Notiek ielāde...</div>
    <div v-else-if="error" class="max-w-2xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center">
      <p class="text-red-600 font-semibold">{{ error }}</p>
      <button @click="goBack" class="mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors">Atpakaļ</button>
    </div>
    <div v-else-if="country" class="max-w-5xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/60">
      <div class="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div class="flex flex-col lg:flex-row lg:items-center gap-6">
          <img
            v-if="country.flags?.png || country.flag"
            :src="country.flags?.png || country.flag"
            :alt="country.flags?.alt || getCountryNameForFlag(country)"
            class="w-full lg:w-72 h-44 object-cover rounded-2xl shadow-lg border border-white"
          >
          <div class="flex-1 text-left">
            <p class="text-sm uppercase tracking-[0.25em] text-indigo-600 font-semibold mb-2">Valsts profils</p>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{{ getCountryDisplayName(country) }}</h2>
                <p v-if="getCountryOfficialDisplayName(country)" class="text-gray-600 text-lg mb-4">{{ getCountryOfficialDisplayName(country) }}</p>
              </div>
              <button
                v-if="isLoggedIn"
                @click="toggleFavorite"
                :class="['inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all border shadow-sm', isFavorite ? 'bg-amber-400 border-amber-300 text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-amber-600']"
                :aria-label="isFavorite ? 'Noņemt no favorītiem' : 'Pievienot favorītiem'"
              >
                <span>★</span>
                <span>{{ isFavorite ? 'Favorīts' : 'Pievienot favorītiem' }}</span>
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in tags" :key="tag" class="badge">{{ tag }}</span>
            </div>
            <!-- debug JSON viewer removed -->
          </div>
        </div>
      </div>

      <div class="px-6 sm:px-8 pt-6">
        <div class="flex flex-wrap gap-2 mb-6">
          <button v-for="section in sections" :key="section.key" @click="activeSection = section.key" :class="['section-tab', activeSection === section.key ? 'section-tab-active' : 'section-tab-inactive']">
            {{ section.label }}
          </button>
        </div>
      </div>

      <div class="px-6 sm:px-8 pb-8 space-y-6">
        <section v-if="activeSection === 'main'" class="grid gap-4 md:grid-cols-2">
          <InfoCard title="Pamata informācija">
            <InfoRow label="Galvaspilsēta" :value="country.capital" />
            <InfoRow label="Iedzīvotāju skaits" :value="formatNumber(country.population)" />
            <InfoRow v-if="country.area" label="Platība" :value="`${formatNumber(country.area)} km²`" />
            <InfoRow v-if="country.currency?.name" label="Valūta" :value="country.currency.code ? `${country.currency.name} (${country.currency.code})` : country.currency.name" />
          </InfoCard>

          <InfoCard title="Identitāte">
            <InfoRow v-if="getCountryOfficialDisplayName(country)" label="Oficiālais nosaukums" :value="getCountryOfficialDisplayName(country)" />
            <InfoRow v-if="country.languages?.length" label="Valodas" :value="country.languages.join(', ')" />
            <InfoRow v-if="country.primaryTimezone || country.primaryUtcOffset" label="Laika josla" :value="(country.primaryTimezone ? country.primaryTimezone : '') + (country.primaryUtcOffset ? (' (' + country.primaryUtcOffset + ')') : '')" />
            <InfoRow v-if="country.timezones?.length > 1" label="Papildu laika joslas" :value="country.timezones.slice(0, 3).join(', ')" />
          </InfoCard>
        </section>

        <section v-else-if="activeSection === 'geography'" class="grid gap-4 md:grid-cols-2">
          <InfoCard title="Ģeogrāfija">
            <InfoRow v-if="country.continent" label="Kontinents" :value="country.continent" />
            <InfoRow v-if="country.region" label="Reģions" :value="country.region" />
            <InfoRow v-if="country.subregion" label="Apakšreģions" :value="country.subregion" />
            <InfoRow v-if="country.borders?.length" label="Robežvalstis" :value="country.borders.join(', ')" />
          </InfoCard>

          <InfoCard title="Kartes un koordinātas">
            <InfoRow v-if="country.latlng?.length" label="Valsts koordinātas" :value="country.latlng.join(', ')" />
            <InfoRow v-if="country.capitalInfo?.latlng?.length" label="Galvaspilsētas koordinātas" :value="country.capitalInfo.latlng.join(', ')" />
            <button @click="goToMap" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-500 transition-colors">Apskatīt ģeogrāfiju</button>
          </InfoCard>
        </section>

        <section v-else-if="activeSection === 'status'" class="grid gap-4 md:grid-cols-2">
          <InfoCard title="Statuss un karogs">
            <InfoRow v-if="country.independent !== null" label="Neatkarīga valsts" :value="country.independent ? 'Jā' : 'Nē'" />
            <InfoRow v-if="country.landlocked !== null" label="Iekšzemes valsts" :value="country.landlocked ? 'Jā' : 'Nē'" />
            <InfoRow v-if="country.unMember !== null" label="ANO dalībvalsts" :value="country.unMember ? 'Jā' : 'Nē'" />
            <InfoRow v-if="country.startOfWeek" label="Nedēļas sākums" :value="country.startOfWeek" />
            <InfoRow v-if="country.flags?.alt || country.translations?.lav?.alt || country.translations?.lv?.alt" label="Karoga apraksts" :value="getCountryFlagDescription(country)" />
          </InfoCard>

          <InfoCard title="Papildu identifikatori">
            <InfoRow v-if="country.code" label="Kods" :value="country.code" />
            <InfoRow v-if="country.cca2" label="CCA2" :value="country.cca2" />
            <InfoRow v-if="country.ccn3" label="CCN3" :value="country.ccn3" />
            <InfoRow v-if="country.cioc" label="CIOC" :value="country.cioc" />
            <InfoRow v-if="country.fifa" label="FIFA" :value="country.fifa" />
          </InfoCard>
        </section>

        <section v-else-if="activeSection === 'weather'" class="grid gap-4 md:grid-cols-2">
          <InfoCard title="Pašreizējie laikapstākļi">
            <InfoRow label="Statuss" :value="weatherLoading ? 'Notiek ielāde...' : (weatherError || 'Pieejams')" />
            <InfoRow v-if="weatherData?.current?.temperature_2m !== undefined" label="Temperatūra" :value="`${Math.round(weatherData.current.temperature_2m)} °C`" />
            <InfoRow v-if="weatherData?.current?.apparent_temperature !== undefined" label="Sajūtu temperatūra" :value="`${Math.round(weatherData.current.apparent_temperature)} °C`" />
            <InfoRow v-if="weatherData?.current?.relative_humidity_2m !== undefined" label="Mitrums" :value="`${Math.round(weatherData.current.relative_humidity_2m)} %`" />
            <InfoRow v-if="weatherData?.current?.wind_speed_10m !== undefined" label="Vēja ātrums" :value="`${Math.round(weatherData.current.wind_speed_10m)} km/h`" />
            <InfoRow v-if="weatherData?.current?.weather_code !== undefined" label="Apstākļi" :value="getWeatherLabel(weatherData.current.weather_code)" />
          </InfoCard>

          <InfoCard title="Tuvākās 3 dienas">
            <div v-if="weatherForecast.length" class="space-y-3">
              <div v-for="item in weatherForecast" :key="item.date" class="rounded-xl border border-gray-100 bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ formatForecastDate(item.date) }}</p>
                <p class="text-sm text-gray-900 font-semibold">{{ getWeatherLabel(item.weatherCode) }}</p>
                <p class="text-sm text-gray-700">{{ Math.round(item.tempMax) }}°C / {{ Math.round(item.tempMin) }}°C</p>
                <p class="text-xs text-gray-500">Nokrišņi: {{ Number(item.precipitation || 0).toFixed(1) }} mm</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-600">Prognoze pašlaik nav pieejama.</p>
          </InfoCard>
        </section>

        <section v-else-if="activeSection === 'news'" class="grid gap-4 lg:grid-cols-2">
          <InfoCard title="Jaunākās ziņas">
            <InfoRow label="Statuss" :value="newsLoading ? 'Notiek ielāde...' : (newsError || (newsArticles.length ? 'Pieejams' : 'Nav ziņu'))" />
            <div v-if="newsLoading" class="space-y-3">
              <div v-for="item in 3" :key="item" class="rounded-xl border border-gray-100 bg-white p-4">
                <div class="h-4 w-2/3 rounded bg-gray-100"></div>
                <div class="mt-3 h-3 w-full rounded bg-gray-100"></div>
                <div class="mt-2 h-3 w-5/6 rounded bg-gray-100"></div>
              </div>
            </div>
            <div v-else-if="newsArticles.length" class="space-y-3">
              <a
                v-for="article in newsArticles"
                :key="article.link || article.title"
                :href="article.link"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div v-if="article.imageUrl" class="mb-3 overflow-hidden rounded-xl">
                  <img :src="article.imageUrl" :alt="article.title" class="h-40 w-full object-cover">
                </div>
                <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ article.source || 'NewsData.io' }}</p>
                <h3 class="mt-1 text-base font-bold text-gray-900">{{ article.title }}</h3>
                <p v-if="article.description" class="mt-2 text-sm text-gray-600 line-clamp-3">{{ article.description }}</p>
                <p v-if="article.pubDate" class="mt-3 text-xs text-gray-400">{{ article.pubDate }}</p>
              </a>
            </div>
            <p v-else class="text-sm text-gray-600">Ziņas šai valstij pašlaik nav pieejamas.</p>
          </InfoCard>

          <InfoCard title="Avots un filtrs">
            <InfoRow label="Valsts kods" :value="country?.cca2 || 'Nav datu'" />
            <InfoRow label="Meklēšanas vaicājums" :value="newsQuery || 'Nav datu'" />
            <InfoRow label="Avots" value="NewsData.io" />
            <p class="text-sm text-gray-600 leading-6">
              Šī sadaļa rāda jaunākās ziņas, kas saistītas ar valsti. Dati tiek ielādēti caur backend proxy, lai API atslēga paliktu serverī.
            </p>
          </InfoCard>
        </section>

        <section v-else class="grid gap-4 md:grid-cols-2">
          <InfoCard title="Papildu dati">
            <InfoRow v-if="country.tld?.length" label="Domēni" :value="country.tld.join(', ')" />
            <InfoRow v-if="country.altSpellings?.length" label="Alternatīvie nosaukumi" :value="country.altSpellings.join(', ')" />
            <InfoRow v-if="country.gini && Object.keys(country.gini).length" label="Gini" :value="Object.entries(country.gini).map(([year, value]) => `${year}: ${value}`).join(', ')" />
            <InfoRow v-if="country.demonyms && Object.keys(country.demonyms).length" label="Demonīmi" :value="Object.keys(country.demonyms).join(', ')" />
          </InfoCard>

          <InfoCard title="Rīki un saites">
            <InfoRow v-if="country.postalCode?.format" label="Pasta kods" :value="country.postalCode.format" />
            <InfoRow v-if="country.postalCode?.regex" label="Pasta koda regex" :value="country.postalCode.regex" />
            <button @click="goBack" class="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-500 transition-colors">Atpakaļ uz meklēšanu</button>
          </InfoCard>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, h, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getCountryDisplayName, getCountryOfficialDisplayName, getCountryNameForFlag, getCountryFlagDescription } from '../utils/countryLabels';

const InfoCard = {
  props: ['title'],
  setup(props, { slots }) {
    return () => h('div', { class: 'rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm' }, [
      h('h3', { class: 'text-lg font-bold text-gray-900 mb-4' }, props.title),
      h('div', { class: 'space-y-3' }, slots.default ? slots.default() : null)
    ]);
  }
};

const InfoRow = {
  props: ['label', 'value'],
  setup(props) {
    return () => h('div', { class: 'flex flex-col gap-1 rounded-xl bg-white px-4 py-3 border border-gray-100' }, [
      h('span', { class: 'text-xs font-semibold uppercase tracking-wide text-indigo-600' }, props.label),
      h('span', { class: 'text-sm text-gray-800 break-words' }, (props.value !== undefined && props.value !== null && props.value !== '') ? String(props.value) : 'Nav dati')
    ]);
  }
};

export default {
  name: 'CountryDetails',
  components: { InfoCard, InfoRow },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const country = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const activeSection = ref('main');
    const weatherLoading = ref(false);
    const weatherError = ref('');
    const weatherData = ref(null);
    const newsLoading = ref(false);
    const newsError = ref('');
    const newsData = ref(null);

    const sections = [
      { key: 'main', label: 'Galvenā' },
      { key: 'geography', label: 'Ģeogrāfija' },
      { key: 'status', label: 'Statuss' },
      { key: 'weather', label: 'Laikapstākļi' },
      { key: 'news', label: 'Ziņas' },
      { key: 'extra', label: 'Papildus' }
    ];

    const weatherForecast = computed(() => {
      const daily = weatherData.value?.daily;

      if (!daily?.time?.length) {
        return [];
      }

      return daily.time.map((date, index) => ({
        date,
        weatherCode: daily.weather_code?.[index],
        tempMax: daily.temperature_2m_max?.[index],
        tempMin: daily.temperature_2m_min?.[index],
        precipitation: daily.precipitation_sum?.[index]
      }));
    });

    const newsArticles = computed(() => newsData.value?.articles || []);

    const newsQuery = computed(() => {
      if (!country.value) {
        return '';
      }

      return country.value.name || country.value.officialName || country.value.capital || '';
    });

    const tags = computed(() => {
      const out = [];
      if (!country.value) return out;
      const cap = country.value.capital;
      const cont = country.value.continent;
      const reg = country.value.region;
      const cur = country.value.currency?.code;
      if (cap) out.push(cap);
      if (cont) out.push(cont);
      if (reg && (!cont || String(reg).toLowerCase() !== String(cont).toLowerCase())) out.push(reg);
      if (cur) out.push(cur);
      return out.filter((v, i) => out.findIndex(x => String(x).toLowerCase() === String(v).toLowerCase()) === i);
    });

    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const favoriteCountryIds = computed(() => (store.state.user?.favoriteCountries || []).map(String));
    const isFavorite = computed(() => country.value?._id ? favoriteCountryIds.value.includes(String(country.value._id)) : false);

    const getWeatherCoords = (countryValue) => {
      const capitalCoords = countryValue?.capitalInfo?.latlng;
      if (Array.isArray(capitalCoords) && capitalCoords.length >= 2) {
        return { latitude: capitalCoords[0], longitude: capitalCoords[1] };
      }

      const countryCoords = countryValue?.latlng;
      if (Array.isArray(countryCoords) && countryCoords.length >= 2) {
        return { latitude: countryCoords[0], longitude: countryCoords[1] };
      }

      return null;
    };

    const fetchWeather = async (countryValue) => {
      weatherLoading.value = true;
      weatherError.value = '';
      weatherData.value = null;

      const coords = getWeatherCoords(countryValue);
      if (!coords) {
        weatherError.value = 'Nav pieejamu koordinātu laikapstākļu ielādei.';
        weatherLoading.value = false;
        return;
      }

      try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
            timezone: 'auto',
            forecast_days: 3
          }
        });

        weatherData.value = response.data;
      } catch (weatherErr) {
        weatherError.value = 'Neizdevās ielādēt laikapstākļus.';
        console.warn('Kļūda, ielādējot laikapstākļus:', weatherErr);
      } finally {
        weatherLoading.value = false;
      }
    };

    const fetchNews = async (countryValue) => {
      newsLoading.value = true;
      newsError.value = '';
      newsData.value = null;

      const query = countryValue?.name || countryValue?.officialName || countryValue?.capital || '';

      if (!query) {
        newsError.value = 'Nav pieejamu datu ziņu ielādei.';
        newsLoading.value = false;
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/news', {
          params: {
            query,
            size: 6
          }
        });

        newsData.value = response.data;
      } catch (newsErr) {
        newsError.value = newsErr?.response?.data?.error || 'Neizdevās ielādēt ziņas.';
        console.warn('Kļūda, ielādējot ziņas:', newsErr);
      } finally {
        newsLoading.value = false;
      }
    };

    const fetchCountryDetails = async (id) => {
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.get(`http://localhost:3000/api/countries/${id}`);
        country.value = response.data;

        await Promise.allSettled([
          fetchWeather(response.data),
          fetchNews(response.data)
        ]);
      } catch (err) {
        error.value = 'Neizdevās ielādēt valsts informāciju';
        console.error('Kļūda, ielādējot valsts informāciju:', err);
      } finally {
        loading.value = false;
      }
    };

    const weatherCodeMap = {
      0: 'Skaidrs',
      1: 'Pārsvarā skaidrs',
      2: 'Daļēji mākoņains',
      3: 'Apmācies',
      45: 'Migla',
      48: 'Sarma ar miglu',
      51: 'Viegla smidzināšana',
      53: 'Mērena smidzināšana',
      55: 'Stipra smidzināšana',
      61: 'Neliels lietus',
      63: 'Mērens lietus',
      65: 'Spēcīgs lietus',
      71: 'Neliels sniegs',
      73: 'Mērens sniegs',
      75: 'Spēcīgs sniegs',
      80: 'Lietusgāzes',
      81: 'Mērenas lietusgāzes',
      82: 'Spēcīgas lietusgāzes',
      95: 'Negaiss',
      96: 'Negaiss ar krusu',
      99: 'Spēcīgs negaiss ar krusu'
    };

    const getWeatherLabel = (code) => weatherCodeMap[Number(code)] || 'Nav datu';

    const formatForecastDate = (value) => {
      if (!value) return '';
      return new Intl.DateTimeFormat('lv-LV', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(value));
    };

    onMounted(() => fetchCountryDetails(route.params.id));

    watch(() => route.params.id, (newId) => {
      fetchCountryDetails(newId);
    });

    const goBack = () => {
      router.push('/');
    };

    const goToMap = () => {
      router.push({ name: 'CountryMapPage', params: { id: route.params.id } });
    };

    const toggleFavorite = async () => {
      if (!country.value?._id || !isLoggedIn.value) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/api/auth/favorites/${country.value._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        store.commit('SET_USER', {
          ...store.state.user,
          favoriteCountries: response.data.favoriteCountries || []
        });
      } catch (favoriteErr) {
        console.error('Kļūda, mainot favorītu:', favoriteErr);
      }
    };

    const formatNumber = (value) => new Intl.NumberFormat('lv-LV').format(Number(value || 0));

    return {
      country,
      loading,
      error,
      activeSection,
      sections,
      goBack,
      goToMap,
      formatNumber,
      weatherLoading,
      weatherError,
      weatherData,
      weatherForecast,
      newsLoading,
      newsError,
      newsData,
      newsArticles,
      newsQuery,
      getWeatherLabel,
      formatForecastDate,
      getCountryDisplayName,
      getCountryOfficialDisplayName,
      getCountryNameForFlag,
      getCountryFlagDescription,
      tags,
      isLoggedIn,
      isFavorite,
      toggleFavorite,
      InfoCard,
      InfoRow
    };
  }
};
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.1);
  color: #4338ca;
  padding: 0.45rem 0.8rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.section-tab {
  border-radius: 9999px;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.section-tab-active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);
}

.section-tab-inactive {
  background: #eef2ff;
  color: #3730a3;
}

.link-block {
  display: block;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  padding: 0.85rem 1rem;
  color: #1d4ed8;
  font-weight: 600;
  background: #f8fafc;
}

.link-block:hover {
  background: #eff6ff;
}
</style>