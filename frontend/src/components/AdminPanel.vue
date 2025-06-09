<template>
  <div class="admin-panel p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">User Management</h2>
    <div v-if="loading" class="text-center">Loading users...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <table v-else class="w-full">
      <thead>
        <tr>
          <th class="text-left">Username</th>
          <th class="text-left">Email</th>
          <th class="text-left">Role</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id" class="border-b">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select v-model="user.role" @change="updateUser(user)" class="border rounded p-1">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </td>
          <td>
            <button @click="deleteUser(user._id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
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
        console.error('Error fetching users:', err);
        error.value = 'Failed to fetch users. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const updateUser = async (user) => {
      try {
        await axios.put(`http://localhost:3000/api/admin/users/${user._id}`, { role: user.role });
        console.log('User updated successfully');
      } catch (error) {
        console.error('Error updating user:', error);
      }
    };

    const deleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
          users.value = users.value.filter(user => user._id !== userId);
          console.log('User deleted successfully');
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      }
    };

    onMounted(fetchUsers);

    return {
      users,
      loading,
      error,
      updateUser,
      deleteUser
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
</style>