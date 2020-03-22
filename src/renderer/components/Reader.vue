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

export default {
  name: 'Reader',
  watch: {
    currentTrack: {
      handler(newTrack) {
        this.playTrack(newTrack);
      },
    },
  },
  computed: {
    ...mapState('tracks', ['currentTrack']),
  },
  methods: {
    playTrack(track) {
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
        const sound = new Howl({
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
