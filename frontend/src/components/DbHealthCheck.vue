<template>
  <div class="db-health-check">
    <h2>Database Health Check</h2>
    <button @click="checkDbHealth" class="check-button">Check Database Health</button>
    <div v-if="dbStatus" class="status-display">
      <h3>Main Connection: <span :class="dbStatus.main.connected ? 'connected' : 'not-connected'">{{ dbStatus.main.connected ? 'Connected' : 'Not Connected' }}</span></h3>
      <p v-if="dbStatus.main.error" class="error">Error: {{ dbStatus.main.error }}</p>
      
      <h3>Countries Collection: <span :class="dbStatus.countries.connected ? 'connected' : 'not-connected'">{{ dbStatus.countries.connected ? 'Connected' : 'Not Connected' }}</span></h3>
      <p v-if="dbStatus.countries.error" class="error">Error: {{ dbStatus.countries.error }}</p>
      
      <h3>Users Collection: <span :class="dbStatus.users.connected ? 'connected' : 'not-connected'">{{ dbStatus.users.connected ? 'Connected' : 'Not Connected' }}</span></h3>
      <p v-if="dbStatus.users.error" class="error">Error: {{ dbStatus.users.error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      dbStatus: null
    };
  },
  methods: {
    async checkDbHealth() {
      try {
        const response = await axios.get('http://localhost:3000/api/db-health');
        this.dbStatus = response.data;
      } catch (error) {
        console.error('Error checking database health:', error);
        this.dbStatus = { error: 'Failed to check database health' };
      }
    }
  }
};
</script>

<style scoped>
.db-health-check {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin: 20px;
}

.check-button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}

.status-display {
  margin-top: 20px;
}

.connected {
  color: green;
}

.not-connected {
  color: red;
}

.error {
  color: red;
  font-style: italic;
}
</style>