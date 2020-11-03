const state = {
  flattening: false,
  countFilesToCopy: 0,
  countCopiedFiles: 0,
  importing: false,
  countFilesToImport: 0,
  countImportedFiles: 0,
};

const mutations = {
  UPDATE_FLATTENING_STATUS(state, payload) {
    state.flattening = payload.flattening;
  },
  UPDATE_COPIED_FILES_COUNT(state, payload) {
    state.countFilesToCopy = payload.countFilesToCopy;
    state.countCopiedFiles = payload.countCopiedFiles;
  },
  UPDATE_IMPORT_STATUS(state, payload) {
    state.flattening = payload.flattening;
  },
  UPDATE_IMPORTED_FILES_COUNT(state, payload) {
    state.countFilesToImport = payload.countFilesToImport;
    state.countImportedFiles = payload.countImportedFiles;
  },
};

const actions = {
  updateFlatteningStatus({ commit }, { flattening }) {
    commit({ type: 'UPDATE_FLATTENING_STATUS', flattening });
  },
  updateCopiedFilesCount({ commit }, { countFilesToCopy, countCopiedFiles }) {
    commit({ type: 'UPDATE_COPIED_FILES_COUNT', countFilesToCopy, countCopiedFiles });
  },
  updateImportStatus({ commit }, { importing }) {
    commit({ type: 'UPDATE_IMPORT_STATUS', importing });
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
