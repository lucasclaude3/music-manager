import { ipcRenderer } from 'electron';

const state = {
  columns: [],
};

const mutations = {
  LOAD_COLUMNS(state, payload) {
    state.columns = payload.columns || [];
  },
};

const actions = {
  loadColumns({ commit }, windowWidth) {
    ipcRenderer.send('columns:load');
    ipcRenderer.on('columns:loaded', (event, columns) => {
      columns.forEach((c) => {
        if (c.revColOrder === 1) {
          c.size = windowWidth - columns.map(col => col.size || 0).reduce((acc, s) => acc + s);
        }
      });
      commit({ type: 'LOAD_COLUMNS', columns });
      ipcRenderer.removeAllListeners('columns:loaded');
    });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};