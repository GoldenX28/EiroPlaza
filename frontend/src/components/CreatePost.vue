<template>
  <div class="create-post bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Create a New Post</h2>
    <form @submit.prevent="submitPost" class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input 
          v-model="post.title" 
          type="text" 
          id="title" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter post title"
        >
      </div>
      
      <div>
        <label for="country" class="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <select 
          v-model="post.country" 
          id="country" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled selected>Select a country</option>
          <option v-for="country in countries" :key="country._id" :value="country._id">{{ country.name }}</option>
        </select>
      </div>
      
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea 
          v-model="post.content" 
          id="content" 
          rows="5" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Write your post content here"
        ></textarea>
      </div>
      
      <div>
        <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div class="flex items-center space-x-2">
          <template v-for="i in 5" :key="i">
            <button 
              type="button"
              @click="post.rating = i"
              class="text-2xl focus:outline-none"
              :class="i <= post.rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </button>
          </template>
        </div>
      </div>
      
      <div>
        <label for="images" class="block text-sm font-medium text-gray-700 mb-1">Images</label>
        <input 
          type="file" 
          id="images" 
          multiple 
          @change="handleImageUpload" 
          accept="image/*"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
      </div>
      
      <div v-if="selectedImages.length > 0" class="flex flex-wrap gap-2">
        <div v-for="(image, index) in selectedImages" :key="index" class="relative">
          <img :src="image.preview" alt="Selected image" class="h-20 w-20 object-cover rounded">
          <button @click.prevent="removeImage(index)" class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs">
            X
          </button>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Post
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'CreatePost',
  emits: ['cancel', 'post-created'],
  setup(props, { emit }) {
    const countries = ref([]);
    const post = ref({
      title: '',
      country: '',
      content: '',
      rating: 5,
    });
    const selectedImages = ref([]);

    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/countries');
        countries.value = response.data;
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          selectedImages.value.push({
            file: file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });
    };

    const removeImage = (index) => {
      selectedImages.value.splice(index, 1);
    };

    const submitPost = async () => {
      const formData = new FormData();
      formData.append('title', post.value.title);
      formData.append('country', post.value.country);
      formData.append('content', post.value.content);
      formData.append('rating', post.value.rating);
      selectedImages.value.forEach((image) => {
        formData.append('images', image.file);
      });

      try {
        const response = await axios.post('http://localhost:3000/api/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        emit('post-created', response.data);
        post.value = { title: '', country: '', content: '', rating: 5 };
        selectedImages.value = [];
      } catch (error) {
        console.error('Error creating post:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
        // You might want to show an error message to the user here
        alert('Failed to create post. Please try again.');
      }
    };

    onMounted(fetchCountries);

    return {
      countries,
      post,
      selectedImages,
      handleImageUpload,
      removeImage,
      submitPost
    };
  }
}
</script>