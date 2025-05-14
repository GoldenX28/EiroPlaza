import { createStore } from 'vuex'

export default createStore({
  state: {
    isLoggedIn: false,
    isAdmin: false,
    user: null
  },
  mutations: {
    setLoginStatus(state, status) {
      state.isLoggedIn = status
    },
    setAdminStatus(state, status) {
      state.isAdmin = status
    },
    setUser(state, user) {
      state.user = user
    }
  },
  actions: {
    login({ commit }, user) {
      // Perform login logic here
      commit('setLoginStatus', true)
      commit('setAdminStatus', user.isAdmin)
      commit('setUser', user)
    },
    logout({ commit }) {
      // Perform logout logic here
      commit('setLoginStatus', false)
      commit('setAdminStatus', false)
      commit('setUser', null)
    }
  }
})