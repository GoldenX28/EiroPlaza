<template>
  <div class="post-list min-h-screen px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <header class="posts-hero mb-6 rounded-2xl p-6 bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 text-white shadow-lg">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold">Ceļojumu ieraksti</h1>
            <p class="mt-1 text-sm text-indigo-100">Atrodi iedvesmu no citu ceļojumiem un pieredzēm.</p>
          </div>
          <div class="hidden sm:block">
            <button v-if="isLoggedIn" @click="showCreatePostForm = !showCreatePostForm" class="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
              {{ showCreatePostForm ? 'Atcelt' : 'Izveidot ierakstu' }}
            </button>
          </div>
        </div>
      </header>

      <CreatePost 
        v-if="showCreatePostForm" 
        @cancel="showCreatePostForm = false" 
        @post-created="handlePostCreated"
      />

      <template v-else>
        <section class="mb-6 grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2 flex items-center gap-3">
            <input v-model.trim="searchQuery" type="search" placeholder="Meklēt pēc nosaukuma vai satura..." class="w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm" />
            <select v-model="selectedCountry" class="rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
              <option value="">Visas valstis</option>
              <option v-for="c in countries" :key="c._id" :value="c._id">{{ getCountryDisplayName(c) }}</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-3">
            <div class="text-sm text-slate-600">Rāda {{ rangeText }}</div>
          </div>
        </section>

        <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="post in paginatedPosts" :key="post._id" class="post-card rounded-2xl bg-white p-5 shadow-lg">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-xl font-semibold text-slate-700">
                <img
                  v-if="post.user?.avatar"
                  :src="getImageUrl(post.user.avatar)"
                  alt="autora profils"
                  class="h-full w-full object-cover"
                >
                <span v-else>{{ getInitials(post.user?.username || post.title) }}</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900">{{ post.title }}</h3>
                <p class="text-xs text-slate-500">Autors: {{ post.user?.username || 'Nezināms' }} • {{ getCountryDisplayName(post.country) }}</p>
              </div>
              <div class="text-sm text-yellow-500 font-semibold">{{ post.rating }}★</div>
            </div>

            <p class="mt-3 text-sm text-slate-700">{{ post.content.length > 160 ? post.content.substring(0,160) + '...' : post.content }}</p>

            <div class="mt-4 flex items-center justify-between">
              <router-link :to="{ name: 'PostDetail', params: { id: post._id } }" class="text-indigo-600 font-semibold hover:underline">Lasīt vairāk</router-link>
              <div class="text-xs text-slate-500">{{ formatDate(post.createdAt) }}</div>
            </div>
          </article>
        </section>

        <div class="mt-8 flex items-center justify-center gap-3">
          <button class="px-3 py-1 rounded-md border" :disabled="currentPage===1" @click="goToPage(currentPage-1)">Iepriekšējā</button>
          <div class="flex items-center gap-2">
            <button v-for="p in pageButtons" :key="p" @click="goToPage(p)" :class="{'bg-indigo-600 text-white': p===currentPage, 'px-3 py-1 rounded-md': true}">{{ p }}</button>
          </div>
          <button class="px-3 py-1 rounded-md border" :disabled="currentPage===totalPages" @click="goToPage(currentPage+1)">Nākamā</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import CreatePost from './CreatePost.vue';
import { getCountryDisplayName } from '../utils/countryLabels';

export default {
  name: 'PostList',
  components: { CreatePost },
  setup() {
    const store = useStore();
    const posts = ref([]);
    const showCreatePostForm = ref(false);
    const viewMode = ref('all');

    const searchQuery = ref('');
    const selectedCountry = ref('');
    const countries = ref([]);
    const currentPage = ref(1);
    const pageSize = 9;

    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const currentUserId = computed(() => store.state.user ? store.state.user._id : null);

    const isEqualId = (id1, id2) => String(id1) === String(id2);

    const filteredPosts = computed(() => {
      let list = posts.value.slice();
      if (viewMode.value === 'my' && isLoggedIn.value) {
        list = list.filter(post => post.user && isEqualId(post.user._id, currentUserId.value));
      }
      const q = String(searchQuery.value || '').toLowerCase().trim();
      if (q) {
        list = list.filter(p => (p.title || '').toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q));
      }
      if (selectedCountry.value) {
        list = list.filter(p => String(p.country) === String(selectedCountry.value) || (p.country && p.country._id && String(p.country._id) === String(selectedCountry.value)));
      }
      return list;
    });

    const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / pageSize)));

    const paginatedPosts = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredPosts.value.slice(start, start + pageSize);
    });

    const pageButtons = computed(() => {
      const total = totalPages.value;
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      const current = currentPage.value;
      const keep = new Set([1, total, current - 1, current, current + 1]);
      const pages = Array.from(keep).filter(n => n >= 1 && n <= total).sort((a,b)=>a-b);
      const out = [];
      for (let i=0;i<pages.length;i++){
        if (i>0 && pages[i]-pages[i-1] > 1) out.push('...');
        out.push(pages[i]);
      }
      return out.filter(x => x !== '...');
    });

    const rangeText = computed(() => {
      const total = filteredPosts.value.length;
      if (total === 0) return '0 rezultātu';
      const start = (currentPage.value - 1) * pageSize + 1;
      const end = Math.min(start + pageSize - 1, total);
      return `${start}–${end} no ${total}`;
    });

    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        posts.value = response.data;
        // preload countries from posts if present
        const countrySet = new Map();
        (response.data || []).forEach(p => {
          if (p.country && p.country._id) countrySet.set(p.country._id, p.country);
        });
        countries.value = Array.from(countrySet.values());
      } catch (error) {
        console.error('Kļūda, ielādējot ierakstus:', error);
      }
    };

    const handlePostCreated = (newPost) => {
      posts.value.unshift(newPost);
      showCreatePostForm.value = false;
    };

    watch([currentUserId, viewMode], () => {
      fetchPosts();
    });

    watch([searchQuery, selectedCountry], () => {
      currentPage.value = 1;
    });

    const goToPage = (page) => {
      const normalized = Math.min(Math.max(page, 1), totalPages.value);
      currentPage.value = normalized;
    };

    const getInitials = (value) => {
      const name = String(value || '').trim();
      if (!name) return 'P';
      const parts = name.split(/\s+/).filter(Boolean);
      return (parts.length > 1
        ? `${parts[0][0] || ''}${parts[1][0] || ''}`
        : name.slice(0, 2)
      ).toUpperCase();
    };

    const getImageUrl = (avatar) => {
      const value = String(avatar || '').trim();
      if (!value) return '';
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/uploads/')) {
        return value;
      }
      return `/uploads/${value.replace(/^\/+/, '')}`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString();
    };

    onMounted(fetchPosts);

    return {
      posts,
      showCreatePostForm,
      isLoggedIn: computed(() => store.state.isLoggedIn),
      viewMode,
      filteredPosts,
      handlePostCreated,
      getCountryDisplayName,
      searchQuery,
      selectedCountry,
      countries,
      paginatedPosts,
      currentPage,
      totalPages,
      pageButtons,
      goToPage,
      rangeText,
      getInitials,
      getImageUrl,
      formatDate
    };
  }
};

</script>

<style scoped>
.posts-hero { border-radius: 1rem; }
.post-card { transition: transform .12s ease, box-shadow .12s ease; }
.post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(2,6,23,.08); }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>