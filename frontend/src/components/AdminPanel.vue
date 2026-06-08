<template>
  <div class="admin-panel p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Lietotāju pārvaldība</h2>
    <div v-if="loading" class="text-center">Notiek lietotāju ielāde...</div>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    <table v-else class="w-full">
      <thead>
        <tr>
          <th class="text-left">Lietotājvārds</th>
          <th class="text-left">E-pasts</th>
          <th class="text-left">Loma</th>
          <th class="text-left">Darbības</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id" class="border-b">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select 
              v-model="user.role" 
              @change="updateUser(user)" 
              class="border rounded p-1"
              :disabled="user.role === 'admin'"
            >
              <option value="user">Lietotājs</option>
              <option value="admin">Administrators</option>
            </select>
          </td>
          <td>
            <button 
              @click="editUser(user)" 
              class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
            >
              Rediģēt
            </button>
            <button 
              @click="deleteUser(user._id)" 
              class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              :disabled="user.role === 'admin'"
            >
              Dzēst
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- User Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-bold mb-4">Rediģēt lietotāju</h3>
        <form @submit.prevent="saveUserEdit">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
              Lietotājvārds
            </label>
            <input v-model="editingUser.username" id="username" type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
              E-pasts
            </label>
            <input v-model="editingUser.email" id="email" type="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="role">
              Loma
            </label>
            <select v-model="editingUser.role" id="role" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="user">Lietotājs</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
          <div class="flex items-center justify-between">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Saglabāt izmaiņas
            </button>
            <button @click="closeEditModal" type="button" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Atcelt
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="mt-8">
      <button 
        @click="toggleInquiriesLog" 
        class="text-2xl font-bold mb-4 flex items-center"
      >
        <span>Pieprasījumu žurnāls</span>
        <svg 
          :class="{'rotate-180': showInquiriesLog}"
          class="w-6 h-6 ml-2 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      <transition name="fade">
        <div v-if="showInquiriesLog">
          <div v-if="loadingInquiries" class="text-center">Notiek pieprasījumu ielāde...</div>
          <div v-if="inquiriesError" class="text-red-500 mb-4">{{ inquiriesError }}</div>
          <table v-else class="w-full">
            <thead>
              <tr>
                <th class="text-left">Lietotājs</th>
                <th class="text-left">Ziņojums</th>
                <th class="text-left">Datums</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inquiry in inquiries" :key="inquiry._id" class="border-b">
                <td>{{ inquiry.userId?.username || 'Nezināms lietotājs' }}</td>
                <td>{{ inquiry.message }}</td>
                <td>{{ formatDate(inquiry.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'AdminPanel',
  setup() {
    const users = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const inquiries = ref([]);
    const loadingInquiries = ref(true);
    const inquiriesError = ref(null);
    const showInquiriesLog = ref(false);

    const showEditModal = ref(false);
    const editingUser = ref({});

    const fetchUsers = async () => {
      try {
        loading.value = true;
        error.value = null;
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        users.value = response.data;
      } catch (err) {
        console.error('Kļūda, ielādējot lietotājus:', err);
        error.value = 'Neizdevās ielādēt lietotājus. Lūdzu, mēģini vēlreiz.';
      } finally {
        loading.value = false;
      }
    };

    const updateUser = async (user) => {
      if (user.role === 'admin') {
        user.role = 'admin';
        alert('Administratora lomu nevar mainīt.');
        return;
      }
      try {
        await axios.put(`http://localhost:3000/api/admin/users/${user._id}`, { role: user.role });
        console.log('Lietotājs veiksmīgi atjaunināts');
      } catch (error) {
        console.error('Kļūda, atjauninot lietotāju:', error);
      }
    };

    const editUser = (user) => {
      editingUser.value = { ...user };
      if (user.role === 'admin') {
        editingUser.value.role = 'admin';
      }
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editingUser.value = {};
    };

    const saveUserEdit = async () => {
      if (editingUser.value.role === 'admin') {
        editingUser.value.role = 'admin';
      }
      try {
        await axios.put(`http://localhost:3000/api/admin/users/${editingUser.value._id}`, editingUser.value);
        const index = users.value.findIndex(u => u._id === editingUser.value._id);
        if (index !== -1) {
          users.value[index] = { ...editingUser.value };
        }
        closeEditModal();
        console.log('Lietotājs veiksmīgi rediģēts');
      } catch (error) {
        console.error('Kļūda, rediģējot lietotāju:', error);
      }
    };

    const deleteUser = async (userId) => {
      const user = users.value.find(u => u._id === userId);
      if (user && user.role === 'admin') {
        alert('Administratoru lietotājus nevar dzēst.');
        return;
      }
      if (confirm('Vai tiešām vēlies dzēst šo lietotāju?')) {
        try {
          await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
          users.value = users.value.filter(user => user._id !== userId);
          console.log('Lietotājs veiksmīgi dzēsts');
        } catch (error) {
          console.error('Kļūda, dzēšot lietotāju:', error);
        }
      }
    };

    const fetchInquiries = async () => {
      if (inquiries.value.length > 0) return;
      try {
        loadingInquiries.value = true;
        inquiriesError.value = null;
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/inquiries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        inquiries.value = response.data.map(inquiry => ({
          ...inquiry,
          userId: inquiry.userId || { username: 'Nezināms lietotājs' }
        }));
      } catch (err) {
        console.error('Kļūda, ielādējot pieprasījumus:', err);
        inquiriesError.value = 'Neizdevās ielādēt pieprasījumus. Lūdzu, mēģini vēlreiz.';
      } finally {
        loadingInquiries.value = false;
      }
    };

    const toggleInquiriesLog = () => {
      showInquiriesLog.value = !showInquiriesLog.value;
      if (showInquiriesLog.value) {
        fetchInquiries();
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Nezināms datums';
      return new Date(dateString).toLocaleString();
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      error,
      updateUser,
      editUser,
      closeEditModal,
      saveUserEdit,
      deleteUser,
      inquiries,
      loadingInquiries,
      inquiriesError,
      showInquiriesLog,
      toggleInquiriesLog,
      showEditModal,
      editingUser,
      formatDate
    };
  }
};
</script>

<style scoped>
.admin-panel {
  max-width: 800px;
  margin: 0 auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>