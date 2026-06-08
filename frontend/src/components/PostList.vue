<template>
  <div class="post-list">
    <!-- Main title bar -->
    <div class="bg-blue-500 p-4 mb-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold text-white">Ceļojumu ieraksti</h1>
      </div>
    </div>

    <!-- Options bar -->
    <div class="bg-gray-200 p-4 mb-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="space-x-4">
          <button @click="viewMode = 'all'" :class="{'font-bold': viewMode === 'all'}" class="text-blue-600 hover:text-blue-800">
            Skatīt visus
          </button>
          <button v-if="isLoggedIn" @click="viewMode = 'my'" :class="{'font-bold': viewMode === 'my'}" class="text-blue-600 hover:text-blue-800">
            Mani ieraksti
          </button>
        </div>
        <div v-if="isLoggedIn" class="mb-4">
          <button @click="showCreatePostForm = !showCreatePostForm" class="bg-blue-500 text-white px-4 py-2 rounded">
            {{ showCreatePostForm ? 'Atcelt' : 'Izveidot jaunu ierakstu' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Post Form -->
    <CreatePost 
      v-if="showCreatePostForm" 
      @cancel="showCreatePostForm = false" 
      @post-created="handlePostCreated"
    />

    <!-- Posts List -->
    <div class="container mx-auto">
      <div v-for="post in filteredPosts" :key="post._id" class="mb-4 p-4 border rounded shadow-md">
        <h3 class="text-xl font-semibold">{{ post.title }}</h3>
        <p class="text-sm text-gray-600">Autors: {{ post.user?.username || 'Nezināms lietotājs' }} | Valsts: {{ getCountryDisplayName(post.country) }}</p>
        <div class="flex items-center mt-2">
          <span class="text-yellow-500 mr-1">★</span>
          <span>{{ post.rating }}/5</span>
        </div>
        <p class="mt-2">{{ post.content.substring(0, 100) }}...</p>
        <router-link :to="{ name: 'PostDetail', params: { id: post._id } }" class="mt-2 inline-block text-blue-500 hover:underline">Lasīt vairāk</router-link>
      </div>
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
  components: {
    CreatePost
  },
  setup() {
    const store = useStore();
    const posts = ref([]);
    const showCreatePostForm = ref(false);
    const viewMode = ref('all');

    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const currentUserId = computed(() => store.state.user ? store.state.user._id : null);

    const isEqualId = (id1, id2) => String(id1) === String(id2);

    const filteredPosts = computed(() => {
      if (viewMode.value === 'my' && isLoggedIn.value) {
        return posts.value.filter(post => post.user && isEqualId(post.user._id, currentUserId.value));
      }
      return posts.value;
    });

    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/posts');
        posts.value = response.data;
      } catch (error) {
        console.error('Kļūda, ielādējot ierakstus:', error);
      }
    };

    const handlePostCreated = (newPost) => {
      posts.value.unshift(newPost);
      showCreatePostForm.value = false;
    };

    watch(currentUserId, () => {
      fetchPosts();
    });

    watch(viewMode, () => {
      fetchPosts();
    });

    onMounted(fetchPosts);

    return { 
      posts, 
      showCreatePostForm, 
      isLoggedIn,
      viewMode,
      filteredPosts,
      handlePostCreated,
      getCountryDisplayName
    };
  }
}
</script>