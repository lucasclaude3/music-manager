<template>
  <div class="main-window">
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
        v-bind:id="track.index"
        tabindex="0"
        draggable="true"
        @dragstart="handleDragTrack"
        @dblclick="() => launchTrack(track)"
        @click.exact="handleFocus"
        @click.shift="handleFocusShift"
        @blur="handleBlur"
        v-bind:class="{ background: firstSelectedElement
                                 && track.index >= firstSelectedElement.id
                                 && track.index <= secondSelectedElement.id }"
      >
        <span class="no-pointer-events" v-html="track.name"></span>
        <span class="no-pointer-events" v-html="track.genre"></span>
        <span class="no-pointer-events" v-html="track.shortComment"></span>
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
      firstSelectedElement: null,
      secondSelectedElement: null,
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
      const tmpTracks = [...this.tracks].sort((a, b) => {
        if (a.created_at < b.created_at) {
          return 1;
        } else if (a.created_at === b.created_at && a.id < b.id) {
          return 1;
        }
        return -1;
      });
      tmpTracks.forEach((t, index) => {
        t.index = index;
      });
      return tmpTracks;
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
      if (this.firstSelectedElement === null
        || event.target.id < this.firstSelectedElement.id
        || event.target.id > this.secondSelectedElement.id) {
        this.handleFocus(event);
      }
      const selectedTracks = this.orderedTracks
        .filter(t => t.index >= this.firstSelectedElement.id
                  && t.index <= this.secondSelectedElement.id)
        .map(t => t.id);
      event
        .dataTransfer
        .setData('text/plain', selectedTracks);
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
    handleFocus(event) {
      this.firstSelectedElement = event.target;
      this.secondSelectedElement = event.target;
    },
    handleFocusShift(event) {
      if (event.target.id < this.firstSelectedElement.id) {
        this.firstSelectedElement = event.target;
        return;
      }
      this.secondSelectedElement = event.target;
    },
    handleBlur(event) {
      if (!event.relatedTarget || !event.relatedTarget.classList.contains('track')) {
        this.firstSelectedElement = null;
        this.secondSelectedElement = null;
      }
    },
  },
};
</script>

<style lang="scss">
  .main-window {
    padding-left: 200px;
  }
  .background {
    background-color: gray;
  }
</style>
