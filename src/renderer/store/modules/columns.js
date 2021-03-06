import { ipcRenderer } from 'electron';

const state = {
  columns: [],
  isLeftSidebarOpened: true,
};

const thresholds = (input, lowerBound, upperBound) =>
  Math.min(Math.max(input, lowerBound), upperBound);

const mutations = {
  LOAD_COLUMNS(state, payload) {
    state.columns = payload.columns || [];
  },
  UPDATE_COLUMN_SIZE(state, payload) {
    const resizedColumn = state.columns.find(c => c.id === payload.columnId);
    const isLastColumn = resizedColumn.revColOrder === 1;
    const otherColumnImpacted = state.columns
      .find(c => (
        c.visible &&
        c.revColOrder === resizedColumn.revColOrder + (isLastColumn ? 1 : -1)));
    const oldColumns = state.columns
      .filter(c => (c.id !== payload.columnId && c.id !== otherColumnImpacted.id));

    let diffX = thresholds(
      payload.diffX,
      100 - resizedColumn.size,
      700 - resizedColumn.size,
    );
    diffX = thresholds(
      diffX,
      otherColumnImpacted.size - 700,
      otherColumnImpacted.size - 100,
    );
    resizedColumn.size += diffX;
    otherColumnImpacted.size -= diffX;
    state.columns = oldColumns.concat([resizedColumn, otherColumnImpacted]);
  },

  UPDATE_LEFT_SIDEBAR_CONFIG(state, payload) {
    state.isLeftSidebarOpened = payload.isLeftSidebarOpened;
  },
};

const actions = {
  loadColumns({ commit }, windowWidth) {
    ipcRenderer.send('columns:load', windowWidth);
    ipcRenderer.on('columns:loaded', (event, columns) => {
      commit({ type: 'LOAD_COLUMNS', columns });
      ipcRenderer.removeAllListeners('columns:loaded');
    });
  },
  invertOrder({ commit }, columnId) {
    ipcRenderer.send('column:invert_order', columnId);
    ipcRenderer.on('columns:loaded', (event, columns) => {
      commit({ type: 'LOAD_COLUMNS', columns });
      ipcRenderer.removeAllListeners('columns:loaded');
    });
  },
  updateColumnSize({ commit }, { columnId, diffX }) {
    commit({ type: 'UPDATE_COLUMN_SIZE', columnId, diffX });
  },
  saveColumnSize({ commit }, { columns }) {
    ipcRenderer.send('columns:update_size', { columns });
    ipcRenderer.on('columns:loaded', (event, columns) => {
      commit({ type: 'LOAD_COLUMNS', columns });
      ipcRenderer.removeAllListeners('columns:loaded');
    });
  },
  toggleColumnVisibility({ commit }, { columnId, windowWidth }) {
    ipcRenderer.send('column:toggle_visibility', { columnId, windowWidth });
    ipcRenderer.on('columns:loaded', (event, columns) => {
      commit({ type: 'LOAD_COLUMNS', columns });
      ipcRenderer.removeAllListeners('columns:loaded');
    });
  },
  updateColumnOrder({ commit }, { movedColumn, droppedOn, before }) {
    if (movedColumn.revColOrder === droppedOn.revColOrder) {
      return;
    }
    ipcRenderer.send('column:update_order', { movedColumn, droppedOn, before });
    ipcRenderer.on('columns:loaded', (event, columns) => {
      commit({ type: 'LOAD_COLUMNS', columns });
      ipcRenderer.removeAllListeners('columns:loaded');
    });
  },

  updateLeftSidebarConfig({ commit }, { isLeftSidebarOpened }) {
    commit({ type: 'UPDATE_LEFT_SIDEBAR_CONFIG', isLeftSidebarOpened });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
