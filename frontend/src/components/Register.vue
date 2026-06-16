<template>
  <div class="register-page min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
    <div class="w-full max-w-4xl bg-transparent px-4 py-10">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div class="hidden lg:flex items-center justify-center bg-sky-600 p-8">
          <div class="text-white text-center max-w-xs">
            <h2 class="text-3xl font-extrabold mb-2">Pievienojies EiroPlaza</h2>
            <p class="text-sm opacity-90">Izveido kontu, saglabā savus favorītus un saņem personalizētus ieteikumus par valstīm un ziņām.</p>
          </div>
        </div>
        <div class="p-8 lg:p-10">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Reģistrācija</h1>
          <form @submit.prevent="register" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Lietotājvārds</label>
              <input v-model="username" id="username" type="text" placeholder="piemers" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300">
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">E-pasts</label>
              <input v-model="email" id="email" type="email" placeholder="piemers@epasts.lv" required class="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Parole</label>
              <div class="mt-1 relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" placeholder="Ievadi savu paroli" required class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 pr-10">
                <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700">{{ showPassword ? 'Slēpt' : 'Rādīt' }}</button>
              </div>
              <p class="mt-2 text-xs text-gray-500">Parolei jābūt vismaz 8 rakstzīmju garai.</p>
            </div>

            <div>
              <button type="submit" class="w-full inline-flex items-center justify-center py-2 px-4 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold hover:opacity-95 transition">Reģistrēties</button>
            </div>
          </form>

          <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
          <p class="mt-6 text-center text-sm text-gray-600">Jau ir konts? <router-link to="/login" class="font-medium text-sky-600 hover:text-sky-500">Pieslēgties</router-link></p>
        </div>
      </div>
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
      error: null,
      showPassword: false
    }
  },
  methods: {
    async register() {
      this.error = null;
      if (!this.username || !this.email || !this.password) {
        this.error = 'Lūdzu, aizpildi visus laukus.';
        return;
      }
      if (this.password.length < 8) {
        this.error = 'Parolei jābūt vismaz 8 rakstzīmju garai.';
        return;
      }

      try {
        await axios.post('/api/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password
        });
        this.$router.push('/login');
      } catch (error) {
        if (error.response) {
          this.error = error.response.data.message || 'Reģistrācija neizdevās';
        } else if (error.request) {
          this.error = 'Nav atbildes no servera. Lūdzu, mēģini vēlreiz.';
        } else {
          this.error = 'Radās negaidīta kļūda. Lūdzu, mēģini vēlreiz.';
        }
      }
    }
  }
}
</script>