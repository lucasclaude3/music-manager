<template>
  <div class="mainwindow">
    <input
      class="tracks-input"
      type="file"
      webkitdirectory
      @change="addNewFiles">
    <input
      class="tracks-input"
      type="file"
      multiple
      @change="addNewFiles">
    <b-button
      v-if="currentTag !== null"
      @click="applyCurrentTag()"
    >Apply current Tag {{ currentTag.name }}</b-button>
    <div>
      <label for="search"></label>
      <b-form-input
        id="search"
        v-model="searchTerms"
        type="text"
        @keypress="event => onNewChar(event, searchTerms)"
        @keydown="event => onNewChar(event, searchTerms)"
      ></b-form-input>
    </div>
    <ul>
      <li
        class="track"
        v-for="track in orderedTracks"
        v-bind:key="track.id"
        v-bind:id="track.id"
        draggable="true"
        @dragstart="handleDragTrack"
        @dblclick="() => launchTrack(track)"
      >
        <span v-html="track.name"></span>
        <span v-html="track.genre"></span>
        <span v-html="track.comment"></span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'MainWindow',
  data() {
    return {
      searchTerms: '',
    };
  },
  mounted() {
    this.loadTracks();
    this.watchTrackModification();
  },
  computed: {
    ...mapState('tracks', ['tracks']),
    ...mapState('tags', ['currentTag']),
    orderedTracks() {
      return [...this.tracks].sort((a, b) => {
        if (a.created_at < b.created_at) {
          return 1;
        } else if (a.created_at === b.created_at && a.id < b.id) {
          return 1;
        }
        return -1;
      });
    },
  },
  methods: {
    ...mapActions({
      addTracks: 'tracks/addTracks',
      loadTracks: 'tracks/loadTracks',
      watchTrackModification: 'tracks/watchTrackModification',
      applyCurrentTag: 'tags/applyCurrentTag',
      launchTrack: 'tracks/launchTrack',
      searchTrack: 'tracks/searchTrack',
    }),
    addNewFiles(event) {
      const newFiles = Array
        .from(event.target.files)
        .map(file => ({
          path: file.path,
          name: file.name,
          type: file.type,
        }));
      this.addTracks(newFiles);
    },
    handleDragTrack(event) {
      event
        .dataTransfer
        .setData('text/plain', event.target.id);
    },
    onNewChar(event, searchTerms) {
      let searchTermsUpdated;
      const char = String.fromCharCode(event.keyCode);
      if (event.type === 'keypress' && /[a-zA-Z0-9-_ ]/.test(char)) {
        searchTermsUpdated = searchTerms + char;
      } else if (event.type === 'keydown' && event.keyCode === 8) {
        searchTermsUpdated = searchTerms.slice(0, searchTerms.length - 1);
      } else {
        return;
      }
      this.searchTrack({ searchTerms: searchTermsUpdated, tag: this.currentTag });
    },
  },
};
</script>

<style lang="scss">
</style>
