<template>
  <div class="reader">
    <div>Reader</div>
    <div>{{ currentTrack.name }}</div>
    <div>{{ currentTrack.genre }}</div>
    <div>{{ currentTrack.comment }}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Howl } from 'howler';
import dataurl from 'dataurl';
import fs from 'fs';

let sound;

export default {
  name: 'Reader',
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'tracks/PLAY_TRACK') {
        this.playTrack(state.tracks.currentTrack);
      }
    });
  },
  computed: {
    ...mapState('tracks', ['currentTrack']),
  },
  methods: {
    playTrack(track) {
      if (sound) {
        sound.stop();
        sound.unload();
      }
      if (!track || !track.path) {
        return Promise.reject;
      }
      const songPromise = new Promise((resolve, reject) => {
        fs.readFile(this.currentTrack.path, (err, data) => {
          if (err) { reject(err); }
          resolve(dataurl.convert({ data, mimetype: 'audio/mp3' }));
        });
      });
      return songPromise.then((data) => {
        sound = new Howl({
          src: [data],
          html5: true,
        });
        sound.play();
      });
    },
  },
};
</script>

<style scoped lang="scss">
  .reader {
    width: 100%;
    height: 100px;
    border-bottom: 1px solid black;
  }
</style>
