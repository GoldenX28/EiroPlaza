<template>
  <div class="login-page p-6 bg-blue-50 rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">Login</h1>
    <form @submit.prevent="login" class="space-y-4">
      <input v-model="email" type="email" placeholder="Email" required class="w-full p-2 border rounded">
      <input v-model="password" type="password" placeholder="Password" required class="w-full p-2 border rounded">
      <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Login</button>
    </form>
    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
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