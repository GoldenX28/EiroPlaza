<template>
  <div class="post-list">
    <!-- Main title bar -->
    <div class="bg-blue-500 p-4 mb-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold text-white">Travel Posts</h1>
      </div>
    </div>

    <!-- Options bar -->
    <div class="bg-gray-200 p-4 mb-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="space-x-4">
          <button @click="viewMode = 'all'" :class="{'font-bold': viewMode === 'all'}" class="text-blue-600 hover:text-blue-800">
            View All
          </button>
          <button v-if="isLoggedIn" @click="viewMode = 'my'" :class="{'font-bold': viewMode === 'my'}" class="text-blue-600 hover:text-blue-800">
            My Posts
          </button>
        </div>
        <button 
          v-if="isLoggedIn"
          @click="showCreatePostForm = true" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Post
        </button>
      </div>
    </div>

    <!-- Create Post Form -->
    <div v-if="showCreatePostForm" class="container mx-auto mb-6 p-4 border rounded">
      <h3 class="text-xl font-semibold mb-2">Create a New Post</h3>
      <form @submit.prevent="submitPost" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
          <input v-model="newPost.title" type="text" id="title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        
        <div>
          <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
          <select v-model="newPost.country" id="country" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <option v-for="country in countries" :key="country._id" :value="country._id">{{ country.name }}</option>
          </select>
        </div>
        
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
          <textarea v-model="newPost.content" id="content" rows="5" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
        </div>
        
        <div>
          <label for="rating" class="block text-sm font-medium text-gray-700">Rating</label>
          <select v-model="newPost.rating" id="rating" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <option v-for="i in 5" :key="i" :value="i">{{ i }}</option>
          </select>
        </div>
        
        <div>
          <label for="images" class="block text-sm font-medium text-gray-700">Images</label>
          <input type="file" id="images" multiple @change="handleImageUpload" accept="image/*" class="mt-1 block w-full">
        </div>
        
        <div class="flex justify-end space-x-2">
          <button type="button" @click="showCreatePostForm = false" class="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create Post
          </button>
        </div>
      </form>
    </div>

    <!-- Posts List -->
    <div class="container mx-auto">
      <div v-for="post in filteredPosts" :key="post._id" class="mb-4 p-4 border rounded">
        <h3 class="text-xl font-semibold">{{ post.title }}</h3>
        <p>By {{ post.user.username }} | Country: {{ post.country.name }}</p>
        <p>Rating: {{ post.rating }}/5</p>
        <p>{{ post.content.substring(0, 100) }}...</p>
        <router-link :to="'/post/' + post._id" class="text-blue-500 hover:underline">Read more</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';

export default {
  name: 'PostList',
  setup() {
    const store = useStore();
    const posts = ref([]);
    const countries = ref([]);
    const showCreatePostForm = ref(false);
    const viewMode = ref('all');
    const newPost = ref({
      title: '',
      country: '',
      content: '',
      rating: 5,
      images: []
    });

    const isLoggedIn = computed(() => store.state.isLoggedIn);
    const currentUserId = computed(() => store.state.user ? store.state.user._id : null);

    const filteredPosts = computed(() => {
      if (viewMode.value === 'my' && isLoggedIn.value) {
        return posts.value.filter(post => post.user._id === currentUserId.value);
      }
      return posts.value;
    });

    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/posts');
        posts.value = response.data;
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/countries');
        countries.value = response.data;
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    const handleImageUpload = (event) => {
      newPost.value.images = Array.from(event.target.files);
    };

    const submitPost = async () => {
      try {
        const formData = new FormData();
        formData.append('title', newPost.value.title);
        formData.append('country', newPost.value.country);
        formData.append('content', newPost.value.content);
        formData.append('rating', newPost.value.rating);
        newPost.value.images.forEach((image, index) => {
          formData.append(`image${index}`, image);
        });

        const response = await axios.post('http://localhost:3000/api/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Post created:', response.data);
        posts.value.unshift(response.data); // Add new post to the beginning of the list
        showCreatePostForm.value = false; // Hide the form after submission
        newPost.value = { title: '', country: '', content: '', rating: 5, images: [] }; // Reset form
      } catch (error) {
        console.error('Error creating post:', error);
      }
    };

    onMounted(() => {
      fetchPosts();
      fetchCountries();
    });

    return { 
      posts, 
      countries, 
      showCreatePostForm, 
      newPost, 
      isLoggedIn,
      handleImageUpload, 
      submitPost,
      viewMode,
      filteredPosts
    };
  }
}
</script>