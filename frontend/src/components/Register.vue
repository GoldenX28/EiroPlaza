<template>
  <div class="register-page p-6 bg-blue-50 rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">Register</h1>
    <form @submit.prevent="register" class="space-y-4">
      <input v-model="username" type="text" placeholder="Username" required class="w-full p-2 border rounded">
      <input v-model="email" type="email" placeholder="Email" required class="w-full p-2 border rounded">
      <input v-model="password" type="password" placeholder="Password" required class="w-full p-2 border rounded">
      <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Register</button>
    </form>
    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
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