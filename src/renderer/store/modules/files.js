const state = {
  countFilesToCopy: 0,
  countCopiedFiles: 0,
  countFilesToImport: 0,
  countImportedFiles: 0,
};

const mutations = {
  UPDATE_COPIED_FILES_COUNT(state, payload) {
    state.countFilesToCopy = payload.countFilesToCopy;
    state.countCopiedFiles = payload.countCopiedFiles;
  },
  UPDATE_IMPORTED_FILES_COUNT(state, payload) {
    state.countFilesToImport = payload.countFilesToImport;
    state.countImportedFiles = payload.countImportedFiles;
  },
};

const actions = {
  updateCopiedFilesCount({ commit }, { countFilesToCopy, countCopiedFiles }) {
    commit({ type: 'UPDATE_COPIED_FILES_COUNT', countFilesToCopy, countCopiedFiles });
  },
  updateImportedFilesCount({ commit }, { countFilesToImport, countImportedFiles }) {
    commit({ type: 'UPDATE_IMPORTED_FILES_COUNT', countFilesToImport, countImportedFiles });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
