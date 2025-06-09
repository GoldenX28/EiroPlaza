<template>
  <div class="create-post p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Create a New Post</h2>
    <form @submit.prevent="submitPost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input v-model="post.title" type="text" id="title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      
      <div>
        <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
        <select v-model="post.country" id="country" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <option v-for="country in countries" :key="country._id" :value="country._id">{{ country.name }}</option>
        </select>
      </div>
      
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
        <textarea v-model="post.content" id="content" rows="5" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
      </div>
      
      <div>
        <label for="rating" class="block text-sm font-medium text-gray-700">Rating</label>
        <select v-model="post.rating" id="rating" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <option v-for="i in 5" :key="i" :value="i">{{ i }}</option>
        </select>
      </div>
      
      <div>
        <label for="images" class="block text-sm font-medium text-gray-700">Images</label>
        <input type="file" id="images" multiple @change="handleImageUpload" accept="image/*" class="mt-1 block w-full">
      </div>
      
      <button type="submit" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Create Post
      </button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'CreatePost',
  setup() {
    const router = useRouter();
    const countries = ref([]);
    const post = ref({
      title: '',
      country: '',
      content: '',
      rating: 5,
      images: []
    });

    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/countries');
        countries.value = response.data;
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    const handleImageUpload = (event) => {
      post.value.images = Array.from(event.target.files);
    };

    const submitPost = async () => {
      try {
        const formData = new FormData();
        formData.append('title', post.value.title);
        formData.append('country', post.value.country);
        formData.append('content', post.value.content);
        formData.append('rating', post.value.rating);
        post.value.images.forEach((image, index) => {
          formData.append(`image${index}`, image);
        });

        const response = await axios.post('http://localhost:3000/api/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Post created:', response.data);
        router.push('/posts');
      } catch (error) {
        console.error('Error creating post:', error);
      }
    };

    onMounted(fetchCountries);

    return {
      countries,
      post,
      handleImageUpload,
      submitPost
    };
  }
};
</script>