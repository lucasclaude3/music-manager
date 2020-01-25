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
    <ul>
      <li
        class="track"
        v-for="track in orderedTracks"
        v-html="track.name"
        v-bind:key="track.id"
        v-bind:id="track.id"
        draggable="true"
        @dragstart="handleDragTrack">
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'MainWindow',
  mounted() {
    this.loadTracks();
  },
  computed: {
    ...mapState('tracks', ['tracks']),
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
    }),
    addNewFiles(event) {
      const newFiles = Array
        .from(event.target.files)
        .map(file => ({
          path: file.path,
          name: file.name,
        }));
      this.addTracks(newFiles);
    },
    handleDragTrack(event) {
      event
        .dataTransfer
        .setData('text/plain', event.target.id);
    },
  },
};
</script>

<style lang="scss">
</style>
