import { createStore } from 'vuex'

export default createStore({
  state: {
    isLoggedIn: false,
    isAdmin: false,
    user: null
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
    }
  },
  actions: {
    login({ commit }, userData) {
      commit('setLoginStatus', true);
      commit('setAdminStatus', userData.role === 'admin');
      commit('setUser', userData);
    },
    logout({ commit }) {
      commit('setLoginStatus', false);
      commit('setAdminStatus', false);
      commit('setUser', null);
    }
  }
})