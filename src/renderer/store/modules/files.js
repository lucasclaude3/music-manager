const state = {
  flattening: false,
  countFiles: [],
  countCopiedFiles: [],
};

const mutations = {
  UPDATE_FLATTENING_STATUS(state, payload) {
    state.flattening = payload.flattening;
  },
  UPDATE_COPIED_FILES_COUNT(state, payload) {
    state.countFiles = payload.countFiles;
    state.countCopiedFiles = payload.countCopiedFiles;
  },
};

const actions = {
  updateFlatteningStatus({ commit }, { flattening }) {
    commit({ type: 'UPDATE_FLATTENING_STATUS', flattening });
  },
  updateCopiedFilesCount({ commit }, { countFiles, countCopiedFiles }) {
    commit({ type: 'UPDATE_COPIED_FILES_COUNT', countFiles, countCopiedFiles });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
