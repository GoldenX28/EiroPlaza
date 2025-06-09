<template>
  <div class="contact-page p-6 bg-blue-50 rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">Contact Us</h1>
    
    <div v-if="isLoggedIn">
      <p v-if="isAdmin" class="mb-4">Welcome, Admin! Here are the recent inquiries:</p>
      <ul v-if="isAdmin" class="list-disc pl-5 mb-4">
        <li v-for="inquiry in inquiries" :key="inquiry._id">
          {{ inquiry.userId.username }}: {{ inquiry.message }}
        </li>
      </ul>
      <p v-else class="mb-4">Welcome, {{ user.username }}! How can we help you today?</p>
      <form @submit.prevent="submitInquiry" class="space-y-4">
        <textarea v-model="inquiry" rows="4" class="w-full p-2 border rounded" placeholder="Your inquiry..."></textarea>
        <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Submit Inquiry</button>
      </form>
    </div>

    <div v-else>
      <p class="mb-4">Please log in to submit an inquiry or view our contact information.</p>
      <button @click="goToLogin" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Log In</button>
    </div>

    <button @click="goBack" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
      Back to Home
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  name: 'ContactPage',
  data() {
    return {
      inquiry: '',
      inquiries: []
    }
  },
  computed: {
    ...mapState(['isLoggedIn', 'isAdmin', 'user'])
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
        console.log('Inquiry submitted successfully');
        this.inquiry = ''; // Clear the form after submission
        if (this.isAdmin) {
          this.fetchInquiries(); // Refresh the list for admin
        }
      } catch (error) {
        console.error('Error submitting inquiry:', error);
      }
    },
    async fetchInquiries() {
      if (this.isAdmin) {
        try {
          const response = await axios.get('http://localhost:3000/api/inquiries');
          this.inquiries = response.data;
        } catch (error) {
          console.error('Error fetching inquiries:', error);
        }
      }
    }
  },
  mounted() {
    this.fetchInquiries();
  }
}
</script>