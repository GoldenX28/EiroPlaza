<template>
  <div v-if="post" class="post-detail">
    <h2 class="text-2xl font-bold mb-4">{{ post.title }}</h2>
    <p>By {{ post.user.username }} | Country: {{ post.country.name }}</p>
    <p>Rating: {{ post.rating }}/5</p>
    <div v-for="image in post.images" :key="image" class="my-4">
      <img :src="image" alt="Post image" class="max-w-full h-auto">
    </div>
    <p>{{ post.content }}</p>
    
    <h3 class="text-xl font-semibold mt-6 mb-2">Comments</h3>
    <div v-for="comment in post.comments" :key="comment._id" class="mb-2 p-2 bg-gray-100 rounded">
      <p><strong>{{ comment.user.username }}:</strong> {{ comment.content }}</p>
    </div>
    
    <form @submit.prevent="addComment" class="mt-4">
      <textarea v-model="newComment" rows="3" class="w-full p-2 border rounded" placeholder="Add a comment..."></textarea>
      <button type="submit" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Submit Comment</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute();
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
        const response = await axios.post(`http://localhost:3000/api/posts/${route.params.id}/comments`, {
          content: newComment.value
        });
        post.value = response.data;
        newComment.value = '';
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    onMounted(fetchPost);

    return { post, newComment, addComment };
  }
}
</script>