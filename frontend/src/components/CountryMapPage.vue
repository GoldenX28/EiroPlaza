<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.28),_transparent_38%),linear-gradient(135deg,_#1d4ed8_0%,_#6366f1_55%,_#8b5cf6_100%)] py-10 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-white text-center text-lg font-medium">Notiek kartes ielāde...</div>
    <div v-else-if="error" class="max-w-2xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center">
      <p class="text-red-600 font-semibold">{{ error }}</p>
      <button @click="goBack" class="mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors">Atpakaļ</button>
    </div>
    <div v-else-if="country" class="max-w-6xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/60">
      <div class="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-indigo-600 font-semibold mb-2">Kartes skats</p>
          <h1 class="text-3xl sm:text-4xl font-black text-gray-900">{{ getCountryDisplayName(country) }}</h1>
          <p v-if="getCountryOfficialDisplayName(country)" class="text-gray-600 text-lg mt-2">{{ getCountryOfficialDisplayName(country) }}</p>
        </div>
          <button @click="goBack" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold hover:bg-indigo-500 transition-colors">{{ t('mapBackToCountry') }}</button>
      </div>

      <div class="p-6 sm:p-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div>
          <div ref="mapEl" class="rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style="height: 520px;"></div>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Atrašanās vieta</h2>
            <div class="space-y-3">
              <div class="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 border border-gray-100">
                  <span class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ t('mapPointLabel') }}</span>
                <span class="text-sm text-gray-800 break-words">{{ centerLabel }}</span>
              </div>
              <div class="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 border border-gray-100">
                  <span class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ t('mapWhyLabel') }}</span>
                <span class="text-sm text-gray-800 break-words">{{ centerSource }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Koordinātas</h2>
            <div class="space-y-3">
              <div class="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 border border-gray-100">
                  <span class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ t('mapCapitalCoords') }}</span>
                <span class="text-sm text-gray-800 break-words">{{ country.capitalInfo?.latlng?.join(', ') || 'Nav dati' }}</span>
              </div>
              <div class="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 border border-gray-100">
                  <span class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ t('mapCountryCoords') }}</span>
                <span class="text-sm text-gray-800 break-words">{{ country.latlng?.join(', ') || 'Nav dati' }}</span>
              </div>
              <div class="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 border border-gray-100">
                  <span class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ t('mapExplainLabel') }}</span>
                  <span class="text-sm text-gray-800 break-words">{{ t('mapExplainText') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useRoute, useRouter } from 'vue-router';
import { t } from '../utils/translate';
import { getCountryDisplayName, getCountryOfficialDisplayName } from '../utils/countryLabels';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export default {
  name: 'CountryMapPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const country = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const mapEl = ref(null);
    let mapInstance = null;

    const goBack = () => {
      router.push({ name: 'CountryDetails', params: { id: route.params.id } });
    };

    const fetchCountry = async (id) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(`http://localhost:3000/api/countries/${id}`);
        country.value = response.data;
      } catch (err) {
        error.value = 'Neizdevās ielādēt kartes datus';
        console.error('Kļūda, ielādējot kartes datus:', err);
      } finally {
        loading.value = false;
      }
    };

    const centerCoords = computed(() => {
      const data = country.value;
      if (!data) return null;
      const cap = data.capitalInfo?.latlng;
      const latlng = data.latlng;
      if (Array.isArray(cap) && cap.length === 2) return [cap[0], cap[1]];
      if (Array.isArray(latlng) && latlng.length === 2) return [latlng[0], latlng[1]];
      return null;
    });

    const centerLabel = computed(() => {
      if (!centerCoords.value) return 'Nav koordināšu';
      return `${centerCoords.value[0]}, ${centerCoords.value[1]}`;
    });

    const centerSource = computed(() => {
      if (!country.value) return 'Nav datu';
      if (Array.isArray(country.value.capitalInfo?.latlng) && country.value.capitalInfo.latlng.length === 2) return 'Galvaspilsētas koordinātas';
      if (Array.isArray(country.value.latlng) && country.value.latlng.length === 2) return 'Valsts koordinātas';
      return 'Nav koordināšu';
    });

    const initMap = async (coords) => {
      if (!mapEl.value || !coords) return;
      await nextTick();
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn('Error removing existing map instance', e);
        }
        mapInstance = null;
      }
      mapInstance = L.map(mapEl.value).setView(coords, 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);
      L.marker(coords).addTo(mapInstance);
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
        }
      }, 0);
    };

    watch([centerCoords, mapEl], async ([coords, el]) => {
      if (coords && el) {
        await initMap(coords);
      }
    }, { immediate: true, flush: 'post' });

    onMounted(() => {
      fetchCountry(route.params.id);
    });

    watch(() => route.params.id, (id) => {
      fetchCountry(id);
    });

    onUnmounted(() => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn('Error removing map instance on unmount', e);
        }
        mapInstance = null;
      }
    });

    return {
      t,
      getCountryDisplayName,
      getCountryOfficialDisplayName,
      country,
      loading,
      error,
      mapEl,
      goBack,
      centerLabel,
      centerSource
    };
  }
};
</script>
