import { ipcRenderer } from 'electron';

const state = {
  columns: [],
};

const mutations = {
  LOAD_COLUMNS(state, payload) {
    state.columns = payload.columns || [];
  },
  INVERT_ORDER(state, payload) {
    const oldColumns = state.columns.filter(c => c.id !== payload.columnId);
    const invertedColumn = state.columns.find(c => c.id === payload.columnId);
    invertedColumn.sortOrder *= -1;
    state.columns = oldColumns.concat([invertedColumn]);
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
  invertOrder({ commit }, columnId) {
    ipcRenderer.send('columns:invert_order', columnId);
    ipcRenderer.on('columns:loaded', (event, columns) => {
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
