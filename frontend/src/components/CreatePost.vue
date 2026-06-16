<template>
  <div class="create-post bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Izveidot jaunu ierakstu</h2>
    <form @submit.prevent="submitPost" class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Virsraksts</label>
        <input 
          v-model="post.title" 
          type="text" 
          id="title" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ievadi ieraksta virsrakstu"
        >
      </div>
      
      <div>
        <label for="country" class="block text-sm font-medium text-gray-700 mb-1">Valsts</label>
        <select 
          v-model="post.country" 
          id="country" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled selected>Izvēlies valsti</option>
          <option v-for="country in countries" :key="country._id" :value="country._id">{{ getCountryDisplayName(country) }}</option>
        </select>
      </div>
      
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Saturs</label>
        <textarea 
          v-model="post.content" 
          id="content" 
          rows="5" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Šeit raksti sava ieraksta saturu"
        ></textarea>
      </div>
      
      <div>
        <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Vērtējums</label>
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
        <label for="images" class="block text-sm font-medium text-gray-700 mb-1">Attēli</label>
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
          <img :src="image.preview" alt="Izvēlēts attēls" class="h-20 w-20 object-cover rounded">
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
          Atcelt
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Izveidot ierakstu
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { getCountryDisplayName } from '../utils/countryLabels';

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
        const response = await axios.get('/api/countries');
        countries.value = response.data;
      } catch (error) {
        console.error('Kļūda, ielādējot valstis:', error);
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
        const response = await axios.post('/api/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        emit('post-created', response.data);
        post.value = { title: '', country: '', content: '', rating: 5 };
        selectedImages.value = [];
      } catch (error) {
        console.error('Kļūda, veidojot ierakstu:', error);
        if (error.response) {
          // Pieprasījums tika veikts un serveris atbildēja ar statusa kodu
          // ārpus 2xx diapazona
          console.error('Kļūdas dati:', error.response.data);
          console.error('Kļūdas statuss:', error.response.status);
          console.error('Kļūdas galvenes:', error.response.headers);
        } else if (error.request) {
          // Pieprasījums tika nosūtīts, bet atbilde netika saņemta
          console.error('Kļūdas pieprasījums:', error.request);
        } else {
          // Kaut kas notika, sagatavojot pieprasījumu, un radās kļūda
          console.error('Kļūdas ziņojums:', error.message);
        }
        // Šeit varētu parādīt kļūdas paziņojumu lietotājam
        alert('Neizdevās izveidot ierakstu. Lūdzu, mēģini vēlreiz.');
      }
    };

    onMounted(fetchCountries);

    return {
      getCountryDisplayName,
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