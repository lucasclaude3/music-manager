import { ipcRenderer } from 'electron';

const state = {
  tracks: [],
  currentTrack: null,
  playlist: [],
  comments: [],
};

const mutations = {
  LOAD_TRACKS(state, payload) {
    state.tracks = payload.tracks || [];
  },
  LOAD_COMMENTS(state, payload) {
    state.comments = (payload.comments || [])
      .map(c => ({
        originalComment: c,
        modifiedComment: c,
        selected: true,
        hasBeenModified: false,
      }));
  },
  TOGGLE_REMOVE_COMMENT(state, payload) {
    const { comment } = payload;
    comment.selected = !comment.selected;
    const idx = state.comments.findIndex(c => c.originalComment === comment.originalComment);
    state.comments.splice(idx, 1, comment);
  },
  UPDATE_COMMENT(state, payload) {
    const { comment, newValue } = payload;
    comment.modifiedComment = newValue;
    comment.hasBeenModified = true;
    const idx = state.comments.findIndex(c => c.originalComment === comment.originalComment);
    state.comments.splice(idx, 1, comment);
  },
  ADD_TRACKS(state, payload) {
    state.tracks = state.tracks.concat(payload.tracks);
  },
  UPDATE_TRACK(state, payload) {
    state.tracks = state.tracks.filter(t => t.id !== payload.track.id);
    state.tracks.push(payload.track);
  },
  LAUNCH_TRACK(state, payload) {
    state.currentTrack = payload.track;
    state.playlist.push(payload.track);
  },
  UPDATE_CURRENT_TRACK(state, payload) {
    state.currentTrack = payload.currentTrack;
  },
};

const actions = {
  loadTracks({ commit }, tagId) {
    ipcRenderer.send('tracks:load', tagId);
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      commit({ type: 'LOAD_TRACKS', tracks });
      ipcRenderer.removeAllListeners('tracks:loaded');
    });
  },

  loadAllTracks({ commit }, withoutTags) {
    ipcRenderer.send('tracks:load');
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      const tracksToLoad = withoutTags ? tracks.filter(t => t.tagBag.length === 0) : tracks;
      commit({ type: 'LOAD_TRACKS', tracks: tracksToLoad });
      ipcRenderer.removeAllListeners('tracks:loaded');
    });
  },

  addTagToTracks({ commit }, { tagId, trackIds }) {
    ipcRenderer.send('tracks:addTag', { tagId, trackIds });
    ipcRenderer.on('track:tagsAdded', (event, track) => {
      commit({ type: 'UPDATE_TRACK', track });
      ipcRenderer.removeAllListeners('track:tagsAdded');
    });
  },

  watchTrackAddition({ commit }) {
    ipcRenderer.on('tracks:added', (event, tracks) => {
      commit({ type: 'ADD_TRACKS', tracks });
      ipcRenderer.removeAllListeners('tracks:added');
    });
  },

  watchTrackModification({ commit, state }) {
    ipcRenderer.on('track:updated', (event, track) => {
      commit({ type: 'UPDATE_TRACK', track });
      if (state.currentTrack && state.currentTrack.id === track.id) {
        commit({ type: 'UPDATE_CURRENT_TRACK', currentTrack: track });
      }
    });
  },

  launchTrack({ commit }, track) {
    commit({ type: 'LAUNCH_TRACK', track });
  },

  searchTrack({ commit }, { searchTerms, tag }) {
    ipcRenderer.send('track:search', { searchTerms, tag });
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      const tracksToLoad = tag ? tracks.filter(t => t.tagBag.indexOf(tag.id) > -1) : tracks;
      commit({ type: 'LOAD_TRACKS', tracks: tracksToLoad });
      ipcRenderer.removeAllListeners('tracks:loaded');
    });
  },

  removeTracksFromList({ commit }, { trackIds, tag }) {
    ipcRenderer.send('tracks:remove', { trackIds, tag });
    ipcRenderer.on('tracks:loaded', (event, tracks) => {
      const tracksToLoad = tag ? tracks.filter(t => t.tagBag.indexOf(tag.id) > -1) : tracks;
      commit({ type: 'LOAD_TRACKS', tracks: tracksToLoad });
      ipcRenderer.removeAllListeners('tracks:loaded');
    });
  },

  analyzeComments({ commit }) {
    ipcRenderer.send('tracks:analyzeComments');
    ipcRenderer.on('tracks:analyzed', (event, comments) => {
      commit({ type: 'LOAD_COMMENTS', comments });
      ipcRenderer.removeAllListeners('tracks:analyzed');
    });
  },

  toggleRemoveComment({ commit }, comment) {
    commit({ type: 'TOGGLE_REMOVE_COMMENT', comment });
  },

  updateComment({ commit }, { comment, newValue }) {
    commit({ type: 'UPDATE_COMMENT', comment, newValue });
  },

  applyTags({ commit }, comments) {
    const selectedComments = comments.filter(c => c.selected === true);
    ipcRenderer.send('tracks:applyTags', selectedComments);
    ipcRenderer.on('track:tagsAdded', (event, track) => {
      commit({ type: 'UPDATE_TRACK', track });
      ipcRenderer.removeAllListeners('track:tagsAdded');
    });
    ipcRenderer.on('tags:created', (event, tags) => {
      tags.forEach((tag) => {
        commit({ type: 'tags/ADD_TAG', tag }, { root: true });
      });
      ipcRenderer.removeAllListeners('tags:created');
    });
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
