import { ipcRenderer } from 'electron';

const state = {
  tracks: [],
  currentTrack: {
    name: null,
    genre: null,
    comment: null,
  },
};

const mutations = {
  LOAD_TRACKS(state, payload) {
    state.tracks = payload.tracks || [];
  },
  ADD_TRACKS(state, payload) {
    state.tracks = state.tracks.concat(payload.tracks);
  },
  UPDATE_TRACK(state, payload) {
    state.tracks = state.tracks.filter(t => t.id !== payload.track.id);
    state.tracks.push(payload.track);
  },
  PLAY_TRACK(state, payload) {
    state.currentTrack = payload.track;
  },
};

const actions = {
  loadTracks({ commit }, tagId) {
    ipcRenderer.send('tracks:load', tagId);
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      commit({ type: 'LOAD_TRACKS', tracks });
    });
  },

  loadAllTracks({ commit }, withoutTags) {
    ipcRenderer.send('tracks:load');
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      const tracksToLoad = withoutTags ? tracks.filter(t => t.tagBag.length === 0) : tracks;
      commit({ type: 'LOAD_TRACKS', tracks: tracksToLoad });
    });
  },

  addTracks({ commit }, tracks) {
    ipcRenderer.send('tracks:add', tracks);
    ipcRenderer.on('tracks:added', (event, tracks) => {
      commit({ type: 'ADD_TRACKS', tracks });
      ipcRenderer.removeAllListeners('tracks:added');
    });
  },

  addTagToTrack({ commit }, { tagId, trackId }) {
    ipcRenderer.send('track:add_tag', { tagId, trackId });
    ipcRenderer.on('track:tag_added', (event, track) => {
      commit({ type: 'UPDATE_TRACK', track });
      ipcRenderer.removeAllListeners('track:tag_added');
    });
  },

  watchTrackModification({ commit }) {
    ipcRenderer.on('track:updated', (event, track) => {
      commit({ type: 'UPDATE_TRACK', track });
    });
  },

  playTrack({ commit }, track) {
    commit({ type: 'PLAY_TRACK', track });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
