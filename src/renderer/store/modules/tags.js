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
  UPDATE_TAG(state, payload) {
    state.tags = state.tags.filter(t => t.id !== payload.tag.id);
    state.tags.push(payload.tag);
  },
};

const actions = {
  loadTags({ commit }) {
    ipcRenderer.send('tags:load');
    ipcRenderer.on('tags:loaded', (event, tags) => {
      commit({ type: 'LOAD_TAGS', tags: tags.filter(t => !!t.name) });
    });
  },

  createTag({ commit }) {
    ipcRenderer.send('tag:create');
    ipcRenderer.on('tag:created', (event, tag) => {
      commit({ type: 'ADD_TAG', tag });
      ipcRenderer.removeAllListeners('tag:created');
    });
  },

  updateTag({ commit }, tag) {
    ipcRenderer.send('tag:update', tag);
    ipcRenderer.on('tag:updated', (event, tag) => {
      commit({ type: 'UPDATE_TAG', tag });
      ipcRenderer.removeAllListeners('tag:updated');
    });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
