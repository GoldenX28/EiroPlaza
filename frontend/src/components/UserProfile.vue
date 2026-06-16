<template>
  <div class="profile-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
    <div class="profile-shell mx-auto max-w-6xl">
      <header class="profile-hero mb-6 overflow-hidden rounded-[2rem] border border-white/25 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
        <div class="profile-hero__glow"></div>
        <div class="relative p-6 sm:p-8 lg:p-10">
          <div class="flex items-start gap-5">
            <div>
              <div v-if="user.avatar" class="profile-avatar-img h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-slate-100">
                <img :src="getImageUrl(user.avatar)" alt="avatar" class="h-full w-full object-cover">
              </div>
              <div v-else class="profile-avatar flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 text-2xl font-black text-white shadow-xl shadow-sky-500/30">
                {{ userInitials }}
              </div>
            </div>
            <div class="min-w-0 text-white">
              <p class="profile-kicker">Lietotāja profils</p>
              <h1 class="mt-2 truncate text-3xl font-black tracking-tight sm:text-4xl">
                {{ user.username || 'Lietotājs' }}
              </h1>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                Šeit vari pārvaldīt savu profilu vienuviet.
              </p>

              <div class="mt-5 flex flex-wrap gap-2">
                <span class="profile-pill">{{ user.email || 'Nav e-pasta' }}</span>
                <span class="profile-pill">{{ accountAgeLabel }}</span>
                <span class="profile-pill">{{ favoriteCountLabel }}</span>
              </div>

            </div>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div class="profile-metric">
              <p>Konts izveidots</p>
              <strong>{{ formatDate(user.createdAt) }}</strong>
            </div>
            <div class="profile-metric">
              <p>Konta vecums</p>
              <strong>{{ calculateAccountAge(user.createdAt) }}</strong>
            </div>
            <div class="profile-metric">
              <p>Favorīti</p>
              <strong>{{ favoriteCountriesCount }}</strong>
            </div>
          </div>
        </div>
      </header>

      <div v-if="loading" class="profile-state profile-state-loading">
        <div class="profile-state__spinner"></div>
        <p>Notiek tava profila ielāde...</p>
      </div>

      <div v-else-if="error" class="profile-state profile-state-error">
        <p class="profile-state__error-title">Neizdevās ielādēt profilu</p>
        <p>{{ error }}</p>
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section class="profile-card">
          <div class="profile-card__header">
            <div>
              <p class="profile-section-kicker">Profila dati</p>
              <h2 class="profile-section-title">Pārskats un rediģēšana</h2>
            </div>

            <button
              v-if="!isEditing"
              @click="toggleEdit"
              class="profile-button profile-button-primary"
            >
              Rediģēt profilu
            </button>
          </div>

          <transition name="fade-slide" mode="out-in">
            <div v-if="!isEditing" key="profile-summary" class="profile-summary-grid">
              <div class="profile-info-card">
                <span>Lietotājvārds</span>
                <strong>{{ user.username }}</strong>
              </div>
              <div class="profile-info-card">
                <span>E-pasts</span>
                <strong>{{ user.email }}</strong>
              </div>
              <div class="profile-info-card">
                <span>Konts izveidots</span>
                <strong>{{ formatDate(user.createdAt) }}</strong>
              </div>
              <div class="profile-info-card profile-info-card--accent">
                <span>Konta vecums</span>
                <strong>{{ calculateAccountAge(user.createdAt) }}</strong>
              </div>
            </div>

            <form v-else key="profile-form" @submit.prevent="updateProfile" class="profile-edit-form" enctype="multipart/form-data">
              <div class="profile-field">
                <label for="username">Lietotājvārds</label>
                <input id="username" v-model="editedUser.username" type="text" required>
              </div>

              <div class="profile-field">
                <label for="email">E-pasts</label>
                <input id="email" v-model="editedUser.email" type="email" required>
              </div>

              <div class="profile-field">
                <label for="avatar">Profila bilde (pēc izvēles)</label>
                <input id="avatar" type="file" accept="image/*" @change="onAvatarSelected">
                <div v-if="avatarPreview" class="mt-3">
                  <p class="text-xs text-slate-500">Priekšskatījums:</p>
                  <img :src="avatarPreview" alt="preview" class="mt-2 h-24 w-24 rounded-lg object-cover border">
                </div>
              </div>

              <div class="profile-actions">
                <button type="submit" class="profile-button profile-button-primary">
                  Atjaunināt profilu
                </button>
                <button type="button" @click="cancelEdit" class="profile-button profile-button-secondary">
                  Atcelt
                </button>
              </div>
            </form>
          </transition>
        </section>

        <aside class="profile-card profile-sidebar">
          <div>
            <p class="profile-section-kicker">Konta statuss</p>
            <h2 class="profile-section-title">Ātrā informācija</h2>
          </div>

          <div class="profile-sidebar__list">
            <div class="profile-sidebar-item">
              <span>Klase</span>
              <strong>Aktīvs lietotājs</strong>
            </div>
            <div class="profile-sidebar-item">
              <span>Piekļuve</span>
              <strong>Favorīti un profils</strong>
            </div>
            <div class="profile-sidebar-item">
              <span>Konts</span>
              <strong>{{ user.email || 'Nav datu' }}</strong>
            </div>
            <div class="profile-sidebar-item">
              <span>Izmantošana</span>
              <strong>{{ favoriteCountLabel }}</strong>
            </div>
          </div>

          <div class="profile-sidebar__tip">
            <p class="text-sm leading-6 text-slate-200">
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';

export default {
  name: 'UserProfile',
  setup() {
    const store = useStore();
    const user = ref({});
    const editedUser = ref({});
    const loading = ref(true);
    const error = ref(null);
    const isEditing = ref(false);

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        user.value = response.data;
        store.commit('SET_USER', {
          ...(store.state.user || {}),
          ...response.data
        });
      } catch (err) {
        error.value = 'Neizdevās ielādēt profilu';
        console.error('Kļūda, ielādējot profilu:', err);
      } finally {
        loading.value = false;
      }
    };

    const toggleEdit = () => {
      editedUser.value = { ...user.value };
      isEditing.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    const updateProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use FormData to allow optional avatar upload
        const formData = new FormData();
        formData.append('username', editedUser.value.username || '');
        formData.append('email', editedUser.value.email || '');
        if (avatarFile.value) {
          formData.append('avatar', avatarFile.value);
        }

        const response = await axios.put('/api/auth/profile', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        user.value = { ...user.value, ...editedUser.value, ...(response.data?.user || {}) };
        store.commit('SET_USER', {
          ...(store.state.user || {}),
          ...user.value
        });
        syncDerivedState();
        isEditing.value = false;
        alert('Profils veiksmīgi atjaunināts');
      } catch (err) {
        error.value = 'Neizdevās atjaunināt profilu';
        console.error('Kļūda, atjauninot profilu:', err);
      }
    };

    const avatarFile = ref(null);
    const avatarPreview = ref('');

    const onAvatarSelected = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      avatarFile.value = file;
      const reader = new FileReader();
      reader.onload = (evt) => {
        avatarPreview.value = evt.target.result;
      };
      reader.readAsDataURL(file);
    };

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const calculateAccountAge = (createdAt) => {
      const creationDate = new Date(createdAt);
      const now = new Date();
      const ageInMilliseconds = now - creationDate;
      const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
      
      if (ageInDays < 30) {
        return `${ageInDays} dien${ageInDays !== 1 ? 'as' : 'a'}`;
      } else if (ageInDays < 365) {
        const months = Math.floor(ageInDays / 30);
        return `${months} mēneš${months !== 1 ? 'i' : 'is'}`;
      } else {
        const years = Math.floor(ageInDays / 365);
        return `${years} gad${years !== 1 ? 'i' : 's'}`;
      }
    };

    const getImageUrl = (avatar) => {
      const value = String(avatar || '').trim();
      if (!value) return '';
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/uploads/')) {
        return value;
      }
      return `/uploads/${value.replace(/^\/+/, '')}`;
    };

    const userInitials = ref('UP');
    const favoriteCountriesCount = ref(0);
    const favoriteCountLabel = ref('0 favorīti');
    const accountAgeLabel = ref('Jauns konts');

    const syncDerivedState = () => {
      updateInitials();
      favoriteCountriesCount.value = Array.isArray(user.value.favoriteCountries) ? user.value.favoriteCountries.length : 0;
      favoriteCountLabel.value = `${favoriteCountriesCount.value} favorīt${favoriteCountriesCount.value === 1 ? 's' : 'i'}`;
      accountAgeLabel.value = calculateAccountAge(user.value.createdAt) || 'Jauns konts';
    };

    const updateInitials = () => {
      const name = String(user.value.username || '').trim();
      if (!name) {
        userInitials.value = 'UP';
        return;
      }

      const parts = name.split(/\s+/).filter(Boolean);
      userInitials.value = parts.length > 1
        ? `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
        : `${name.slice(0, 2)}`.toUpperCase();
    };

    onMounted(async () => {
      await fetchProfile();
      syncDerivedState();
    });

    return { 
      user, 
      editedUser,
      loading, 
      error, 
      isEditing,
      toggleEdit,
      cancelEdit,
      updateProfile,
      onAvatarSelected,
      formatDate,
      calculateAccountAge,
      getImageUrl,
      userInitials,
      favoriteCountriesCount,
      favoriteCountLabel,
      accountAgeLabel
      ,avatarPreview
    };
  }
}
</script>

<style scoped>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.profile-page {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.24), transparent 28%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 24%),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 46%, #7c3aed 100%);
}

.profile-shell {
  position: relative;
}

.profile-hero {
  position: relative;
  isolation: isolate;
}

.profile-hero__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.32), transparent 24%),
    radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.24), transparent 22%);
  pointer-events: none;
}

.profile-kicker,
.profile-section-kicker {
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

.profile-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.38);
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.profile-metric {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1.25rem;
  background: rgba(15, 23, 42, 0.36);
  padding: 1rem 1.1rem;
  color: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.profile-metric p {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
}

.profile-info-card span {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
}

.profile-metric strong,
.profile-sidebar-item strong,
.profile-info-card strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1rem;
  font-weight: 800;
}

.profile-metric strong,
.profile-sidebar-item strong {
  color: #ffffff;
}

.profile-info-card strong {
  color: #0f172a;
}

.profile-sidebar {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(237, 242, 255, 0.98));
  color: #0f172a;
}

.profile-sidebar .profile-section-kicker,
.profile-sidebar .profile-section-title {
  color: #0f172a;
}

.profile-sidebar__list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.profile-sidebar-item {
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.95rem 1rem;
  color: #0f172a;
}

.profile-sidebar-item strong {
  color: #0f172a;
}

.profile-sidebar-item span {
  color: #475569;
}

.profile-sidebar__tip {
  margin-top: 1rem;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
}

.profile-sidebar__tip p {
  color: #475569;
}

.profile-state p,
.profile-card p,
.profile-field label {
  color: #0f172a;
}

.profile-card .profile-section-kicker,
.profile-card .profile-section-title,
.profile-card .profile-button {
  color: #0f172a;
}

.profile-card .profile-section-kicker {
  background: rgba(59, 130, 246, 0.08);
}

.profile-card .profile-button-primary {
  color: #ffffff;
}

.profile-state,
.profile-card {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

.profile-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  color: #0f172a;
}

.profile-state-loading {
  justify-content: center;
}

.profile-state-error {
  flex-direction: column;
  align-items: flex-start;
  border-color: rgba(248, 113, 113, 0.3);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(254, 242, 242, 0.96));
}

.profile-state__spinner {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  border: 3px solid rgba(37, 99, 235, 0.16);
  border-top-color: #2563eb;
  animation: profile-spin 1s linear infinite;
}

.profile-state__error-title {
  font-weight: 800;
  color: #b91c1c;
}

.profile-card {
  padding: 1.3rem;
}

.profile-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-section-title {
  margin-top: 0.35rem;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.profile-summary-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.profile-info-card {
  border: 1px solid #dbeafe;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(239, 246, 255, 0.9));
  padding: 1rem 1.1rem;
}

.profile-info-card--accent {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.08));
}

.profile-edit-form {
  display: grid;
  gap: 1rem;
  padding: 1rem 0 0.2rem;
}

.profile-field label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: #334155;
}

.profile-field input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: white;
  padding: 0.95rem 1rem;
  font-size: 0.95rem;
  color: #0f172a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.profile-field input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.profile-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.profile-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 3rem;
  border-radius: 9999px;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.profile-button:hover {
  transform: translateY(-1px);
}

.profile-button-primary {
  border: 1px solid rgba(37, 99, 235, 0.12);
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.24);
}

.profile-button-primary:hover {
  box-shadow: 0 18px 36px rgba(37, 99, 235, 0.32);
}

.profile-button-secondary {
  border: 1px solid #dbeafe;
  background: rgba(255, 255, 255, 0.96);
  color: #1d4ed8;
}

.profile-card__header .profile-button,
.profile-edit-form label,
.profile-edit-form input,
.profile-info-card,
.profile-card {
  color: #0f172a;
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

@keyframes profile-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .profile-summary-grid {
    grid-template-columns: 1fr;
  }

  .profile-metric {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .profile-hero {
    border-radius: 1.4rem;
  }

  .profile-card {
    padding: 1rem;
    border-radius: 1.35rem;
  }

  .profile-card__header {
    margin-bottom: 0.8rem;
  }

  .profile-section-title {
    font-size: 1.25rem;
  }

  .profile-actions {
    grid-template-columns: 1fr;
  }
}
</style>