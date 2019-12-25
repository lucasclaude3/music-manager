import { ipcRenderer } from 'electron';

const state = {
  tags: [],
};

const mutations = {
  LOAD_TAGS(state, payload) {
    state.tags = payload.tags;
  },
  ADD_TAG(state, payload) {
    state.tags.push(payload.tag);
  },
};

const actions = {
  loadTags({ commit }) {
    ipcRenderer.send('tags:load');
    ipcRenderer.on('tags:loaded', (event, tags) => {
      commit({ type: 'LOAD_TAGS', tags: tags.filter(t => !!t) });
    });
  },

  createTag({ commit }) {
    ipcRenderer.send('tag:create');
    ipcRenderer.on('tag:created', (event, tag) => {
      commit({ type: 'ADD_TAG', tag });
    });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
