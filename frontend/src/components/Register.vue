<template>
  <div class="register-page min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>
      <form @submit.prevent="register" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input v-model="username" id="username" type="text" placeholder="Enter your username" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" id="email" type="email" placeholder="Enter your email" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" id="password" type="password" placeholder="Enter your password" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
          Register
        </button>
      </form>
      <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>
      <p class="mt-4 text-center text-sm text-gray-600">
        Already have an account? 
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Log in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RegisterForm',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      error: null
    }
  },
  methods: {
    async register() {
      try {
        console.log('Attempting registration with:', { username: this.username, email: this.email });
        const response = await axios.post('http://localhost:3000/api/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password
        });
        console.log('Registration response:', response.data);
        this.$router.push('/login');
      } catch (error) {
        console.error('Registration error:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          this.error = error.response.data.message || 'Registration failed';
        } else if (error.request) {
          console.error('No response received:', error.request);
          this.error = 'No response from server. Please try again.';
        } else {
          console.error('Error setting up request:', error.message);
          this.error = 'An unexpected error occurred. Please try again.';
        }
      }
    }
  }
}
</script>