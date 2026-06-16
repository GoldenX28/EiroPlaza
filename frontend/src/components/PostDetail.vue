<template>
  <div v-if="post" class="post-detail-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
    <div class="grid gap-6 lg:grid-cols-[1fr_1fr] mb-8">
      <div class="bg-white rounded-lg shadow-lg p-4">
        <div v-if="post.images && post.images.length" class="post-gallery">
          <div class="post-main-image mb-3 rounded-lg overflow-hidden bg-slate-100">
            <img :src="getImageUrl(selectedImage)" alt="Galvenais attēls" class="w-full h-72 object-cover">
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="img in post.images" :key="img" @click="selectedImage = img" class="thumbnail-btn rounded overflow-hidden border" :class="{'ring-2 ring-indigo-500': selectedImage === img}">
              <img :src="getImageUrl(img)" alt="sīkattēls" class="w-full h-20 object-cover">
            </button>
          </div>
        </div>
        <div v-else class="h-72 flex items-center justify-center text-slate-400">Nav attēlu</div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
              <img v-if="post.user?.avatar" :src="getImageUrl(post.user.avatar)" alt="autora avatar" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 font-bold">{{ authorInitials }}</div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-slate-900">{{ post.title }}</h2>
              <div class="text-sm text-slate-600">Autors: <span class="font-medium text-slate-800">{{ getUserName(post.user) }}</span></div>
              <div class="text-sm text-slate-600">Valsts: <span class="font-medium text-slate-800">{{ getCountryName(post.country) }}</span></div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-yellow-500 font-semibold">{{ post.rating }}★</div>
            <div class="text-xs text-slate-500">{{ formatDate(post.createdAt) }}</div>
            <div class="mt-3">
              <button v-if="isAuthorized" @click="deletePost" class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-white text-sm hover:bg-rose-700">Dzēst</button>
            </div>
          </div>
        </div>

        <div class="prose max-w-none mt-4 text-slate-700 leading-relaxed">
          <p v-html="formattedContent"></p>
        </div>
      </div>
    </div>
    
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-6">
        <h3 class="text-2xl font-semibold mb-4 text-gray-800">Komentāri</h3>
        <div v-if="!post.comments || post.comments.length === 0" class="text-slate-500 italic mb-4">
          Vēl nav komentāru. Esi pirmais, kas komentē!
        </div>
        <div v-else class="space-y-4 mb-6">
          <div v-for="comment in post.comments" :key="comment._id" class="flex gap-3 bg-slate-50 rounded-lg p-4">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
              <img v-if="comment.user?.avatar" :src="getImageUrl(comment.user.avatar)" alt="av" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center text-white bg-slate-400">{{ getInitials(comment.user?.username) }}</div>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div class="font-semibold text-slate-800">{{ getUserName(comment.user) }}</div>
                <div class="text-xs text-slate-500">{{ formatDate(comment.createdAt) }}</div>
              </div>
              <p class="mt-1 text-slate-700">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="addComment" class="mt-6">
          <div class="grid gap-2">
            <textarea
              v-model="newComment"
              rows="3"
              :disabled="isSubmitting"
              class="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Pievieno komentāru..."
            ></textarea>
            <div class="flex items-center justify-between">
              <div class="text-xs text-slate-500">Atvainojam — ievēro cieņu un lieto saprātīgi.</div>
              <button :disabled="isSubmitting || !newComment.trim()" type="submit" class="ml-auto inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white text-sm hover:bg-indigo-700 disabled:opacity-60">
                {{ isSubmitting ? 'Nosūta...' : 'Nosūtīt komentāru' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-6">
    Notiek ieraksta ielāde...
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getCountryDisplayName } from '../utils/countryLabels';

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const post = ref(null);
    const newComment = ref('');
    const selectedImage = ref('');
    const isSubmitting = ref(false);

    const escapeHtml = (value) => String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const formattedContent = computed(() => {
      const content = String(post.value?.content || '');
      return escapeHtml(content).replace(/\n/g, '<br>');
    });

    const authorInitials = computed(() => {
      const username = post.value?.user?.username || '';
      const trimmed = String(username).trim();
      if (!trimmed) return 'U';
      const parts = trimmed.split(/\s+/).filter(Boolean);
      return (parts.length > 1
        ? `${parts[0][0] || ''}${parts[1][0] || ''}`
        : trimmed.slice(0, 2)
      ).toUpperCase();
    });

    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${route.params.id}`);
        post.value = response.data;
        selectedImage.value = response.data?.images?.[0] || '';
      } catch (error) {
        console.error('Kļūda, ielādējot ierakstu:', error);
      }
    };

    const addComment = async () => {
      if (!newComment.value.trim()) return;
      try {
        isSubmitting.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.post(`/api/posts/${route.params.id}/comments`, {
          content: newComment.value
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        post.value = response.data;
        newComment.value = '';
      } catch (error) {
        console.error('Kļūda, pievienojot komentāru:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const deletePost = async () => {
      if (confirm('Vai tiešām vēlies dzēst šo ierakstu?')) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/posts/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          router.push('/posts');
        } catch (error) {
          console.error('Kļūda, dzēšot ierakstu:', error);
          alert('Neizdevās dzēst ierakstu. ' + (error.response?.data?.message || 'Lūdzu, mēģini vēlreiz.'));
        }
      }
    };

    const isAuthorized = computed(() => {
      const currentUser = store.state.user;
      return currentUser && (
        currentUser.role === 'admin' || 
        (post.value && post.value.user && post.value.user._id === currentUser._id)
      );
    });

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getUserName = (user) => {
      return user && user.username ? user.username : 'Nezināms lietotājs';
    };

    const getCountryName = (country) => {
      return getCountryDisplayName(country);
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

    const getImageUrl = (imagePath) => {
      if (!imagePath) return '';
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
      return `/uploads${imagePath}`;
    };

    onMounted(fetchPost);

    return { 
      post, 
      newComment, 
      selectedImage,
      isSubmitting,
      formattedContent,
      authorInitials,
      addComment, 
      formatDate, 
      getUserName, 
      getCountryName, 
      getImageUrl,
      deletePost,
      isAuthorized,
      getInitials
    };
  }
}
</script>
<style scoped>
.post-detail-page {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 28%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 24%),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 46%, #7c3aed 100%);
}

.post-hero {
  position: relative;
  isolation: isolate;
}

.post-hero__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.3), transparent 24%),
    radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.22), transparent 22%);
  pointer-events: none;
}

.post-kicker,
.post-section-kicker {
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

.post-pill {
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

.post-card {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 1.35rem;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

.post-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.post-section-title {
  margin-top: 0.35rem;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.post-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.9rem;
}

.post-main-image {
  min-height: 18rem;
}

.thumbnail-btn {
  aspect-ratio: 1 / 1;
}

.post-content {
  font-size: 1.05rem;
  line-height: 1.85;
  color: #1e293b;
  white-space: pre-line;
}

.post-sidebar {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(237, 242, 255, 0.98));
  color: #0f172a;
}

.post-sidebar .post-section-kicker,
.post-sidebar .post-section-title {
  color: #0f172a;
}

.post-sidebar__list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.post-sidebar-item {
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.95rem 1rem;
  color: #0f172a;
}

.post-sidebar-item span {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
}

.post-sidebar-item strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.comment-card {
  border: 1px solid #dbeafe;
  border-radius: 1.1rem;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(239, 246, 255, 0.92));
  padding: 1rem 1.05rem;
}

.comment-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: white;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.post-empty-state {
  border: 1px dashed #bfdbfe;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  color: #475569;
}

.post-textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: white;
  padding: 1rem;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.post-textarea:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 50;
}

.lightbox__image {
  max-width: min(96vw, 1100px);
  max-height: 88vh;
  border-radius: 1rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}

.lightbox__close {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 1.6rem;
  line-height: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .post-card {
    padding: 1.1rem;
  }
}

@media (max-width: 640px) {
  .post-detail-page {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .post-hero {
    border-radius: 1.4rem;
  }

  .post-card {
    border-radius: 1.35rem;
    padding: 1rem;
  }

  .post-card__header {
    flex-direction: column;
  }

  .post-gallery {
    grid-template-columns: 1fr;
  }
}
</style>