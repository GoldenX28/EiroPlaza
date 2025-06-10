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
    SET_LOGGED_IN(state, value) {
      state.isLoggedIn = value;
    },
    SET_ADMIN_STATUS(state, status) {
      state.isAdmin = status;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_AUTH_INITIALIZED(state, status) {
      state.authInitialized = status;
    }
  },
  actions: {
    login({ commit }, user) {
      console.log('Storing user in Vuex:', user);
      commit('SET_USER', user);
      commit('SET_LOGGED_IN', true);
      commit('SET_ADMIN_STATUS', user.role === 'admin');
    },
    logout({ commit }) {
      localStorage.removeItem('token');
      commit('SET_USER', null);
      commit('SET_LOGGED_IN', false);
      commit('SET_ADMIN_STATUS', false);
    },
    async initializeAuth({ commit }) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          commit('SET_LOGGED_IN', true);
          commit('SET_ADMIN_STATUS', response.data.role === 'admin');
          commit('SET_USER', response.data);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('token');
        }
      }
      commit('SET_AUTH_INITIALIZED', true); // Add this line
    }
  },
  getters: {
    isAdmin: state => state.user && state.user.role === 'admin'
  }
})