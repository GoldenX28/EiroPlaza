<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // Import useStore from vuex
import axios from 'axios';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const store = useStore(); // Use the store

    const email = ref('');
    const password = ref('');
    const error = ref('');

    const login = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          email: email.value,
          password: password.value
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          store.dispatch('login', response.data.user);
          router.push('/');
        } else {
          error.value = 'Login failed: No token received';
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed';
      }
    };

    return {
      email,
      password,
      error,
      login
    };
  }
};
</script>