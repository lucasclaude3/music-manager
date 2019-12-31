import { ipcRenderer } from 'electron';

const state = {
  tracks: [],
};

const mutations = {
  LOAD_TRACKS(state, payload) {
    state.tracks = payload.tracks || [];
  },
  ADD_TRACKS(state, payload) {
    state.tracks = state.tracks.concat(payload.tracks);
  },
};

const actions = {
  loadTracks({ commit }) {
    ipcRenderer.send('tracks:load');
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      commit({ type: 'LOAD_TRACKS', tracks });
    });
  },

  addTracks({ commit }, tracks) {
    ipcRenderer.send('tracks:add', tracks);
    ipcRenderer.on('tracks:added', (event, tracks) => {
      commit({ type: 'ADD_TRACKS', tracks });
      ipcRenderer.removeAllListeners('tracks:added');
    });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
