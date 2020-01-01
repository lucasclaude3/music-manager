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
        v-for="track in tracks"
        v-html="track.name"
        v-bind:key="track.id">
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
  },
  methods: {
    ...mapActions({
      addTracks: 'tracks/addTracks',
      loadTracks: 'tracks/loadTracks',
    }),
    addNewFiles(event) {
      const newFiles = Array.from(event.target.files).map(file => ({
        path: file.path,
        name: file.name,
      }));
      this.addTracks(newFiles);
    },
  },
};
</script>

<style lang="scss">
</style>
