import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

// import all sotre modules
import user from './modules/user';

Vue.use(Vuex);

const vuexPersist = new VuexPersistence({
  key: 'livechat',
  storage: localStorage,
});

export default new Vuex.Store({
  plugins: [vuexPersist.plugin],
  modules: {
    user,
  },
});
