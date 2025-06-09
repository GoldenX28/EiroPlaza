<template>
  <div class="admin-panel">
    <h2>User Management</h2>
    <div v-if="loading">Loading users...</div>
    <div v-else-if="error">{{ error }}</div>
    <table v-else>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select v-model="user.role" @change="updateUser(user)">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </td>
          <td>
            <button @click="deleteUser(user._id)">Delete</button>
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
        await axios.put(`/api/admin/users/${user._id}`, user);
        console.log('User updated successfully');
      } catch (error) {
        console.error('Error updating user:', error);
      }
    };

    const deleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`/api/admin/users/${userId}`);
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