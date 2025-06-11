<template>
  <div v-if="post" class="post-detail max-w-4xl mx-auto p-6">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-3xl font-bold text-gray-800">{{ post.title }}</h2>
          <button 
            v-if="isAuthorized" 
            @click="deletePost" 
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete Post
          </button>
        </div>
        
        <div class="flex items-center mb-4 text-sm text-gray-600">
          <span class="mr-4">By {{ getUserName(post.user) }}</span>
          <span class="mr-4">Country: {{ getCountryName(post.country) }}</span>
          <div class="flex items-center">
            <span class="text-yellow-500 mr-1">★</span>
            <span>{{ post.rating }}/5</span>
          </div>
        </div>
        
        <div v-if="post.images && post.images.length > 0" class="image-container my-6">
          <div v-for="image in post.images" :key="image" class="image-wrapper">
            <img :src="getImageUrl(image)" alt="Post image" class="post-image">
          </div>
        </div>
        
        <div class="prose max-w-none text-gray-700 leading-relaxed">
          {{ post.content }}
        </div>
      </div>
    </div>
    
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-6">
        <h3 class="text-2xl font-semibold mb-4 text-gray-800">Comments</h3>
        <div v-if="!post.comments || post.comments.length === 0" class="text-gray-500 italic mb-4">
          No comments yet. Be the first to comment!
        </div>
        <div v-else class="space-y-4 mb-6">
          <div v-for="comment in post.comments" :key="comment._id" class="bg-gray-100 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-blue-600">{{ getUserName(comment.user) }}</span>
              <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="text-gray-800">{{ comment.content }}</p>
          </div>
        </div>
        
        <form @submit.prevent="addComment" class="mt-6">
          <textarea 
            v-model="newComment" 
            rows="3" 
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Add a comment..."
          ></textarea>
          <button 
            type="submit" 
            class="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-6">
    Loading post...
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const post = ref(null);
    const newComment = ref('');

    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/posts/${route.params.id}`);
        post.value = response.data;
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    const addComment = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/api/posts/${route.params.id}/comments`, {
          content: newComment.value
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        post.value = response.data;
        newComment.value = '';
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    const deletePost = async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:3000/api/posts/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          router.push('/posts');
        } catch (error) {
          console.error('Error deleting post:', error);
          alert('Failed to delete post. ' + (error.response?.data?.message || 'Please try again.'));
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
      return user && user.username ? user.username : 'Unknown User';
    };

    const getCountryName = (country) => {
      return country && country.name ? country.name : 'Unknown Country';
    };

    const getImageUrl = (imagePath) => {
      return `http://localhost:3000${imagePath}`;
    };

    onMounted(fetchPost);

    return { 
      post, 
      newComment, 
      addComment, 
      formatDate, 
      getUserName, 
      getCountryName, 
      getImageUrl,
      deletePost,
      isAuthorized
    };
  }
}
</script>
<style scoped>
.image-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.image-wrapper {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .image-container {
    grid-template-columns: 1fr;
  }
}

.prose {
  font-size: 1.1rem;
  line-height: 1.8;
}

.prose p {
  margin-bottom: 1.5em;
}
</style>