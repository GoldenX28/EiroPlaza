<template>
  <div class="admin-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
    <div class="admin-shell mx-auto max-w-7xl">
      <header class="admin-hero mb-6 overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
        <div class="admin-hero__glow"></div>
        <div class="relative p-6 sm:p-8 lg:p-10">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="admin-kicker">Administratora panelis</p>
              <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Lietotāju pārvaldība</h1>
              <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
                Pārvaldi lietotājus, viņu lomas un ienākošos pieprasījumus vienā modernā skatā.
              </p>
            </div>

            <div class="admin-stats grid gap-3 sm:grid-cols-3 lg:min-w-[420px] lg:grid-cols-3">
              <div class="admin-stat">
                <span>Lietotāji</span>
                <strong>{{ users.length }}</strong>
              </div>
              <div class="admin-stat">
                <span>Administratori</span>
                <strong>{{ adminCount }}</strong>
              </div>
              <div class="admin-stat">
                <span>Pieprasījumi</span>
                <strong>{{ inquiries.length }}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="admin-card mb-6">
        <div v-if="loading" class="admin-state admin-state-loading">
          <div class="admin-spinner"></div>
          <p>Notiek lietotāju ielāde...</p>
        </div>

        <div v-else-if="error" class="admin-state admin-state-error">
          <p class="admin-state__title">Kļūda</p>
          <p>{{ error }}</p>
        </div>

        <div v-else>
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="admin-section-kicker admin-section-kicker--dark">Lietotāju saraksts</p>
              <h2 class="admin-section-title">Aktīvie konti</h2>
            </div>
            <div class="admin-users-tools">
              <label for="userSearch" class="sr-only">Meklēt pēc lietotājvārda</label>
              <input
                id="userSearch"
                v-model.trim="userSearchQuery"
                type="text"
                placeholder="Meklēt pēc lietotājvārda..."
                class="admin-search-input"
              >
              <p class="text-sm text-slate-500">Klikšķini rediģēt, lai atvērtu modālo logu.</p>
            </div>
          </div>

          <div class="admin-table-wrap overflow-hidden rounded-2xl border border-slate-200">
            <table class="admin-table w-full">
              <thead>
                <tr>
                  <th>Lietotājvārds</th>
                  <th>E-pasts</th>
                  <th>Loma</th>
                  <th>Darbības</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user._id">
                  <td>
                    <div class="user-cell">
                        <div class="user-avatar rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-white font-bold">
                          <img v-if="user.avatar" :src="getImageUrl(user.avatar)" alt="avatar" class="w-10 h-10 object-cover">
                          <span v-else class="text-slate-700">{{ getInitials(user.username) }}</span>
                        </div>
                      <div>
                        <p class="font-semibold text-slate-900">{{ user.username }}</p>
                        <p class="text-xs text-slate-500">{{ user.role === 'admin' ? 'Administrators' : 'Lietotājs' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="text-slate-700">{{ user.email }}</td>
                  <td>
                    <select
                      v-model="user.role"
                      @change="updateUser(user)"
                      class="role-select"
                      :disabled="user.role === 'admin'"
                    >
                      <option value="user">Lietotājs</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-2">
                      <button @click="editUser(user)" class="action-btn action-btn-primary">Rediģēt</button>
                      <button
                        @click="deleteUser(user._id)"
                        class="action-btn action-btn-danger"
                        :disabled="user.role === 'admin'"
                      >
                        Dzēst
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredUsers.length">
                  <td colspan="4" class="text-center text-slate-500 py-6">
                    Neviens lietotājs ar šādu lietotājvārdu netika atrasts.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="totalPages > 1" class="admin-pagination">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              Iepriekšējā
            </button>

            <div class="page-numbers">
              <template v-for="(item, idx) in pageButtons" :key="`page-${idx}-${item}`">
                <button
                  v-if="item !== '...'"
                  class="page-btn"
                  :class="{ 'page-btn-active': Number(item) === currentPage }"
                  @click="goToPage(Number(item))"
                >
                  {{ item }}
                </button>
                <span v-else class="page-ellipsis">...</span>
              </template>
            </div>

            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Nākamā
            </button>
          </div>
        </div>
      </section>

      <section class="admin-card">
        <button @click="toggleInquiriesLog" class="admin-accordion">
          <div>
            <p class="admin-section-kicker">Pieprasījumi</p>
            <h2 class="admin-section-title">Pieprasījumu žurnāls</h2>
          </div>
          <svg
            :class="{ 'rotate-180': showInquiriesLog }"
            class="h-6 w-6 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <transition name="fade-slide">
          <div v-if="showInquiriesLog" class="mt-5">
            <div v-if="loadingInquiries" class="admin-state admin-state-loading">
              <div class="admin-spinner"></div>
              <p>Notiek pieprasījumu ielāde...</p>
            </div>

            <div v-else-if="inquiriesError" class="admin-state admin-state-error">
              <p class="admin-state__title">Kļūda</p>
              <p>{{ inquiriesError }}</p>
            </div>

            <div v-else class="admin-table-wrap overflow-hidden rounded-2xl border border-slate-200">
              <table class="admin-table w-full">
                <thead>
                  <tr>
                    <th>Lietotājs</th>
                    <th>Ziņojums</th>
                    <th>Datums</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inquiry in inquiries" :key="inquiry._id">
                    <td>
                      <div class="font-semibold text-slate-900">{{ inquiry.userId?.username || 'Nezināms lietotājs' }}</div>
                      <div class="text-xs text-slate-500">{{ inquiry.userId?.email || '' }}</div>
                    </td>
                    <td class="text-slate-700">{{ inquiry.message }}</td>
                    <td class="text-slate-600">{{ formatDate(inquiry.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </transition>
      </section>
    </div>

    <div v-if="showEditModal" class="admin-modal">
      <div class="admin-modal__backdrop" @click="closeEditModal"></div>
      <div class="admin-modal__panel">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="admin-section-kicker">Rediģēšana</p>
            <h3 class="admin-section-title">Rediģēt lietotāju</h3>
          </div>
          <button @click="closeEditModal" type="button" class="admin-close-btn">×</button>
        </div>

        <form @submit.prevent="saveUserEdit" class="admin-form">
          <div class="admin-field">
            <label for="username">Lietotājvārds</label>
            <input v-model="editingUser.username" id="username" type="text">
          </div>

          <div class="admin-field">
            <label for="email">E-pasts</label>
            <input v-model="editingUser.email" id="email" type="email">
          </div>

          <div class="admin-field">
            <label for="role">Loma</label>
            <select v-model="editingUser.role" id="role">
              <option value="user">Lietotājs</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div class="admin-form__actions">
            <button type="submit" class="action-btn action-btn-primary">Saglabāt izmaiņas</button>
            <button @click="closeEditModal" type="button" class="action-btn action-btn-secondary">Atcelt</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
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
    const userSearchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = 10;

    const adminCount = computed(() => users.value.filter((user) => user.role === 'admin').length);
    const filteredUsers = computed(() => {
      const query = String(userSearchQuery.value || '').toLowerCase().trim();
      if (!query) return users.value;
      return users.value.filter((user) => String(user.username || '').toLowerCase().includes(query));
    });

    const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)));

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredUsers.value.slice(start, start + pageSize);
    });

    const pageButtons = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;

      if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
      }

      const keep = new Set([1, total, current - 1, current, current + 1]);
      const pages = Array.from(keep)
        .filter((value) => value >= 1 && value <= total)
        .sort((a, b) => a - b);

      const output = [];
      for (let i = 0; i < pages.length; i += 1) {
        if (i > 0 && pages[i] - pages[i - 1] > 1) {
          output.push('...');
        }
        output.push(pages[i]);
      }

      return output;
    });

    const goToPage = (page) => {
      const normalized = Math.min(Math.max(page, 1), totalPages.value);
      currentPage.value = normalized;
    };

    watch(userSearchQuery, () => {
      currentPage.value = 1;
    });

    watch(totalPages, (newTotal) => {
      if (currentPage.value > newTotal) {
        currentPage.value = newTotal;
      }
    });

    const getAuthHeaders = () => {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchUsers = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await axios.get('/api/admin/users', {
          headers: getAuthHeaders()
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
      try {
        await axios.put(
          `/api/admin/users/${user._id}`,
          { role: user.role },
          { headers: getAuthHeaders() }
        );
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
        await axios.put(
          `/api/admin/users/${editingUser.value._id}`,
          editingUser.value,
          { headers: getAuthHeaders() }
        );
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
          await axios.delete(`/api/admin/users/${userId}`, {
            headers: getAuthHeaders()
          });
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
        const response = await axios.get('/api/inquiries', {
          headers: getAuthHeaders()
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

    const getInitials = (value) => {
      const name = String(value || '').trim();
      if (!name) return 'U';
      const parts = name.split(/\s+/).filter(Boolean);
      return (parts.length > 1
        ? `${parts[0][0] || ''}${parts[1][0] || ''}`
        : name.slice(0, 2)
      ).toUpperCase();
    };

    const getImageUrl = (value) => {
      const avatar = String(value || '').trim();
      if (!avatar) return '';
      if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/uploads/')) return avatar;
      return `/uploads/${avatar.replace(/^\/+/, '')}`;
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
      formatDate,
      adminCount,
      getInitials,
      userSearchQuery,
      filteredUsers,
      currentPage,
      totalPages,
      paginatedUsers,
      pageButtons,
      goToPage
      ,getImageUrl
    };
  }
};
</script>

<style scoped>
.admin-page {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.24), transparent 28%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 24%),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 46%, #7c3aed 100%);
}

.admin-shell {
  position: relative;
}

.admin-hero {
  position: relative;
  isolation: isolate;
}

.admin-hero__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.3), transparent 24%),
    radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.22), transparent 22%);
  pointer-events: none;
}

.admin-kicker,
.admin-section-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  padding: 0.35rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}

.admin-section-kicker--dark {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.admin-stats {
  width: 100%;
}

.admin-stat {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1.25rem;
  background: rgba(15, 23, 42, 0.34);
  padding: 1rem 1.1rem;
  color: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.admin-stat span {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
}

.admin-stat strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.5rem;
  font-weight: 900;
}

.admin-card {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 1.25rem;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

.admin-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 1.25rem;
  padding: 1.25rem;
}

.admin-state-loading {
  justify-content: center;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(239, 246, 255, 0.92));
}

.admin-state-error {
  flex-direction: column;
  align-items: flex-start;
  background: linear-gradient(180deg, rgba(254, 242, 242, 0.98), rgba(255, 255, 255, 0.94));
  border: 1px solid rgba(248, 113, 113, 0.25);
}

.admin-state__title {
  font-weight: 900;
  color: #b91c1c;
}

.admin-spinner {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  border: 3px solid rgba(37, 99, 235, 0.16);
  border-top-color: #2563eb;
  animation: admin-spin 1s linear infinite;
}

.admin-section-title {
  margin-top: 0.35rem;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.admin-table-wrap {
  background: white;
}

.admin-users-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}

.admin-search-input {
  width: min(320px, 100%);
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  background: #ffffff;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.admin-search-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
}

.admin-pagination {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.page-btn {
  min-height: 2.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  background: white;
  padding: 0.4rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #eff6ff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn-active {
  border-color: #2563eb;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
}

.page-ellipsis {
  color: #64748b;
  font-weight: 700;
  padding: 0 0.25rem;
}

.admin-table {
  border-collapse: collapse;
}

.admin-table thead th {
  background: linear-gradient(180deg, #eff6ff, #dbeafe);
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1e3a8a;
}

.admin-table tbody td {
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
  vertical-align: middle;
  background: white;
}

.admin-table tbody tr:hover td {
  background: #f8fbff;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
  font-weight: 900;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

.role-select {
  min-width: 140px;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  background: #fff;
  padding: 0.75rem 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn-primary {
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
}

.action-btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.action-btn-secondary {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.admin-accordion {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
}

.admin-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.admin-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(6px);
}

.admin-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.98);
  padding: 1.25rem;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
}

.admin-close-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 1.4rem;
  line-height: 1;
  color: #334155;
}

.admin-form {
  display: grid;
  gap: 1rem;
}

.admin-field label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: #334155;
}

.admin-field input,
.admin-field select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: white;
  padding: 0.95rem 1rem;
  color: #0f172a;
}

.admin-form__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes admin-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .admin-card {
    padding: 1rem;
  }

  .admin-users-tools {
    width: 100%;
    align-items: stretch;
  }

  .admin-search-input {
    width: 100%;
  }

  .admin-form__actions {
    grid-template-columns: 1fr;
  }

  .admin-table thead {
    display: none;
  }

  .admin-table tbody td {
    display: block;
    border-top: none;
    padding: 0.75rem 1rem;
  }

  .admin-table tbody tr {
    display: block;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.4rem 0;
  }
}
</style>