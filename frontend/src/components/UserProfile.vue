<template>
  <div class="user-profile max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
    <h2 class="text-4xl font-bold text-blue-700 mb-8 text-center">User Profile</h2>
    <div v-if="loading" class="text-center text-gray-600">
      <svg class="animate-spin h-12 w-12 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-lg">Loading your profile...</p>
    </div>
    <div v-else-if="error" class="text-red-600 text-center text-lg bg-red-100 p-4 rounded-md">{{ error }}</div>
    <div v-else>
      <div v-if="!isEditing" class="space-y-6">
        <div class="bg-gray-100 p-6 rounded-md shadow-inner">
          <div class="mb-4">
            <span class="font-medium text-gray-700 text-lg">Username:</span>
            <span class="ml-2 text-lg">{{ user.username }}</span>
          </div>
          <div class="mb-4">
            <span class="font-medium text-gray-700 text-lg">Email:</span>
            <span class="ml-2 text-lg">{{ user.email }}</span>
          </div>
          <div class="mb-4">
            <span class="font-medium text-gray-700 text-lg">Account Created:</span>
            <span class="ml-2 text-lg">{{ formatDate(user.createdAt) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700 text-lg">Account Age:</span>
            <span class="ml-2 text-lg">{{ calculateAccountAge(user.createdAt) }}</span>
          </div>
        </div>
        <button @click="toggleEdit" 
                class="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
          Edit Profile
        </button>
      </div>
      <form v-else @submit.prevent="updateProfile" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username:</label>
          <input id="username" v-model="editedUser.username" type="text" required
                 class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input id="email" v-model="editedUser.email" type="email" required
                 class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
        </div>
        <div class="flex space-x-4">
          <button type="submit" 
                  class="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
            Update Profile
          </button>
          <button type="button" @click="cancelEdit"
                  class="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'UserProfile',
  setup() {
    const user = ref({});
    const editedUser = ref({});
    const loading = ref(true);
    const error = ref(null);
    const isEditing = ref(false);

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        user.value = response.data;
      } catch (err) {
        error.value = 'Failed to fetch profile';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const toggleEdit = () => {
      editedUser.value = { ...user.value };
      isEditing.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    const updateProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.put('http://localhost:3000/api/auth/profile', editedUser.value, {
          headers: { Authorization: `Bearer ${token}` }
        });
        user.value = { ...editedUser.value };
        isEditing.value = false;
        alert('Profile updated successfully');
      } catch (err) {
        error.value = 'Failed to update profile';
        console.error(err);
      }
    };

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const calculateAccountAge = (createdAt) => {
      const creationDate = new Date(createdAt);
      const now = new Date();
      const ageInMilliseconds = now - creationDate;
      const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
      
      if (ageInDays < 30) {
        return `${ageInDays} day${ageInDays !== 1 ? 's' : ''}`;
      } else if (ageInDays < 365) {
        const months = Math.floor(ageInDays / 30);
        return `${months} month${months !== 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(ageInDays / 365);
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
    };

    onMounted(fetchProfile);

    return { 
      user, 
      editedUser,
      loading, 
      error, 
      isEditing,
      toggleEdit,
      cancelEdit,
      updateProfile,
      formatDate,
      calculateAccountAge
    };
  }
}
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.user-profile {
  background-image: linear-gradient(to bottom right, #f0f9ff, #e0f2fe);
}

.user-profile input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.user-profile button {
  transition: all 0.2s ease-in-out;
}

.user-profile button:hover {
  transform: translateY(-1px);
}
</style>