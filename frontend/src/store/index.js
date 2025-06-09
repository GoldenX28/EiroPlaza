import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    isLoggedIn: false,
    isAdmin: false,
    user: null,
    authInitialized: false // Add this line
  },
  mutations: {
    setLoginStatus(state, status) {
      state.isLoggedIn = status;
    },
    setAdminStatus(state, status) {
      state.isAdmin = status;
    },
    setUser(state, user) {
      state.user = user;
    },
    setAuthInitialized(state, status) {
      state.authInitialized = status;
    }
  },
  actions: {
    login({ commit }, userData) {
      commit('setLoginStatus', true);
      commit('setAdminStatus', userData.role === 'admin');
      commit('setUser', userData);
    },
    logout({ commit }) {
      localStorage.removeItem('token');
      commit('setLoginStatus', false);
      commit('setAdminStatus', false);
      commit('setUser', null);
    },
    async initializeAuth({ commit }) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          commit('setLoginStatus', true);
          commit('setAdminStatus', response.data.role === 'admin');
          commit('setUser', response.data);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('token');
        }
      }
      commit('setAuthInitialized', true); // Add this line
    }
  }
})