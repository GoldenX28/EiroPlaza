<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
    <div class="w-full max-w-4xl bg-transparent px-4 py-10">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div class="hidden lg:flex items-center justify-center bg-indigo-600 p-8">
          <div class="text-white text-center max-w-xs">
            <h2 class="text-3xl font-extrabold mb-2">Laipni lūgti EiroPlaza</h2>
            <p class="text-sm opacity-90">Pieslēdzies, lai piekļūtu favorītiem, rakstiem un personalizētiem ieteikumiem. Droša piekļuve un ātra navigācija.</p>
          </div>
        </div>
        <div class="p-8 lg:p-10">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Pieteikšanās</h1>
          <form @submit.prevent="login" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">E-pasts</label>
              <input v-model="email" id="email" type="email" placeholder="piemers@epasts.lv" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Parole</label>
              <div class="mt-1 relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" placeholder="Ievadi savu paroli" required class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 pr-10">
                <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700">
                  {{ showPassword ? 'Slēpt' : 'Rādīt' }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="remember" class="h-4 w-4 text-indigo-600 rounded" />
                <span class="text-gray-600">Atcerēties mani</span>
              </label>
              <router-link to="/forgot" class="text-indigo-600 hover:underline">Aizmirsāt paroli?</router-link>
            </div>

            <div>
              <button type="submit" class="w-full inline-flex items-center justify-center py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold hover:opacity-95 transition">Pieslēgties</button>
            </div>
          </form>

          <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
          <p class="mt-6 text-center text-sm text-gray-600">
            Tev vēl nav konta? 
            <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Reģistrēties</router-link>
          </p>
        </div>
      </div>
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
    const showPassword = ref(false);
    const remember = ref(false);

    const login = async () => {
      // simple client-side validation
      error.value = '';
      if (!email.value || !password.value) {
        error.value = 'Lūdzu, aizpildi visus laukus.';
        return;
      }

      try {
        const response = await axios.post('/api/auth/login', {
          email: email.value,
          password: password.value
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          store.dispatch('login', response.data.user);
          router.push('/');
        } else {
          error.value = 'Pieslēgšanās neizdevās: netika saņemts tokens';
        }
      } catch (err) {
        if (err.response) {
          error.value = err.response.data.message || 'Pieslēgšanās neizdevās';
        } else if (err.request) {
          error.value = 'Nav atbildes no servera. Lūdzu, mēģini vēlreiz.';
        } else {
          error.value = 'Radās negaidīta kļūda. Lūdzu, mēģini vēlreiz.';
        }
      }
    };

    return {
      email,
      password,
      error,
      login,
      showPassword,
      remember
    };
  }
}
</script>