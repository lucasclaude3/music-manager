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
  DELETE_TAG(state, payload) {
    state.tags = state.tags.filter(t => t.id !== payload.tag.id);
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

  deleteTag({ commit }, tag) {
    ipcRenderer.send('tag:delete', tag);
    ipcRenderer.on('tag:deleted', (event, tag) => {
      commit({ type: 'DELETE_TAG', tag });
      ipcRenderer.removeAllListeners('tag:deleted');
    });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
