<template>
  <div class="contact-page min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-3xl font-extrabold text-gray-900 text-center mb-6">Sazinies ar mums</h1>
        
        <div v-if="isLoggedIn">
          <p class="text-lg text-gray-700 mb-4">Sveicināts, {{ user.username }}! Kā varam tev šodien palīdzēt?</p>
          <form @submit.prevent="submitInquiry" class="space-y-4">
            <div>
              <label for="inquiry" class="block text-sm font-medium text-gray-700">Tavs jautājums</label>
              <textarea 
                v-model="inquiry" 
                id="inquiry"
                rows="4" 
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Lūdzu, apraksti savu jautājumu šeit..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nosūtīt pieprasījumu
            </button>
          </form>
        </div>

        <div v-else class="text-center">
          <p class="text-lg text-gray-700 mb-4">Lūdzu, pieslēdzies, lai iesniegtu jautājumu vai skatītu mūsu kontaktinformāciju.</p>
          <button 
            @click="goToLogin" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Pieslēgties
          </button>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-6">
          <button 
            @click="goBack" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Atpakaļ uz sākumlapu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  name: 'ContactPage',
  data() {
    return {
      inquiry: ''
    }
  },
  computed: {
    ...mapState(['isLoggedIn', 'user'])
  },
  methods: {
    goBack() {
      this.$router.push('/');
    },
    goToLogin() {
      this.$router.push('/login');
    },
    async submitInquiry() {
      try {
        await axios.post('http://localhost:3000/api/inquiries', { message: this.inquiry });
        console.log('Jautājums veiksmīgi nosūtīts');
        this.inquiry = ''; // Notīra formu pēc nosūtīšanas
        // Parāda lietotājam veiksmīgu paziņojumu
        alert('Tavs jautājums ir veiksmīgi nosūtīts!');
      } catch (error) {
        console.error('Kļūda, sūtot jautājumu:', error);
        // Parāda kļūdas paziņojumu lietotājam
        alert('Nosūtot jautājumu radās kļūda. Lūdzu, mēģini vēlreiz.');
      }
    }
  }
}
</script>