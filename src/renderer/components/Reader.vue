<template>
  <div class="reader">
    <div
      class="track-info-container"
      v-bind:class="{ hidden: !currentTrack.name }"
    >
      <div class="track-info">{{ currentTrack.name }}</div>
      <div class="track-info">
        <span>{{ currentTrack.genre || 'Unknown genre' }}</span>
        <span v-show="currentTrack.comment"> - {{ currentTrack.comment }}</span>
      </div>
    </div>
    <div
      class="track-info-container placeholder"
      v-bind:class="{ hidden: !!currentTrack.name }"
    >
      POUET
    </div>
    <div class="svgs-container">
      <svgicon
        @click="playPreviousSong()"
        icon="fast-forward"
        width="22"
        height="18"
        color="black"
        dir="down"
      ></svgicon>
      <svgicon
        @click="pause()"
        icon="play"
        width="33"
        height="27"
        color="black"
      ></svgicon>
      <svgicon
        @click="playNextSong()"
        icon="fast-forward"
        width="22"
        height="18"
        color="black"
      ></svgicon>
    </div>
    <b-progress class="mt-2" :max="100"></b-progress>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Howl } from 'howler';
import dataurl from 'dataurl';
import fs from 'fs';
import '@/assets/compiled-icons/play';
import '@/assets/compiled-icons/stop';
import '@/assets/compiled-icons/fast-forward';

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

    playPreviousSong() {
      console.log('yo');
    },

    playNextSong() {
      console.log('yo');
    },

    pause() {
      console.log('yo');
    },
  },
};
</script>

<style scoped lang="scss">
  .reader {
    width: 100%;
    height: 130px;
    border-bottom: 1px solid black;
    margin-top: 10px;
  }

  .track-info-container {
    width: 300px;
    height: 60px;
    margin: 0 auto;
    text-align: center;
  }

  .track-info {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 300px;
  }

  .svgs-container {
    width: 100px;
    margin: 0 auto;
    text-align: center;
  }

  .progress {
    width: 400px;
    margin: 0 auto;
  }
</style>
