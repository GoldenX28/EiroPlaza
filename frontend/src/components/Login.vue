<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Login</h1>
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" id="email" type="email" placeholder="Enter your email" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" id="password" type="password" placeholder="Enter your password" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
          Login
        </button>
      </form>
      <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>
      <p class="mt-4 text-center text-sm text-gray-600">
        Don't have an account? 
        <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter();
    const store = useStore();

    const email = ref('');
    const password = ref('');
    const error = ref('');

    const login = async () => {
      try {
        console.log('Attempting login with:', { email: email.value });
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          email: email.value,
          password: password.value
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Token stored:', response.data.token);
          store.dispatch('login', response.data.user);
          router.push('/');
        } else {
          error.value = 'Login failed: No token received';
        }
      } catch (err) {
        console.error('Login error:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          error.value = err.response.data.message || 'Login failed';
        } else if (err.request) {
          console.error('No response received:', err.request);
          error.value = 'No response from server. Please try again.';
        } else {
          console.error('Error setting up request:', err.message);
          error.value = 'An unexpected error occurred. Please try again.';
        }
      }
    };

    return {
      email,
      password,
      error,
      login
    };
  }
}
</script>