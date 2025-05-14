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
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'LoginForm',
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref(null)
    const auth = inject('auth')
    const router = useRouter()

    const login = async () => {
      try {
        console.log('Login attempt with email:', email.value);
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          email: email.value,
          password: password.value
        });
        console.log('Login response:', response.data);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          auth.login();
          console.log('Login successful, redirecting to home');
          router.push('/');
        } else {
          console.error('Login failed: No token received');
          error.value = 'Login failed: No token received';
        }
      } catch (err) {
        console.error('Login error:', err);
        console.error('Error response:', err.response?.data);
        error.value = err.response?.data?.message || 'Login failed';
      }
    };

    return {
      email,
      password,
      error,
      login
    }
  }
}
</script>