<template>
  <div class="reader">
    <div v-if="currentTrack" class="track-info-container">
      <div class="track-info">{{ currentTrack.name }}</div>
      <div class="track-info">
        <span>{{ currentTrack.shortComment }}</span>
      </div>
    </div>
    <div v-if="!currentTrack" class="track-info-container placeholder">
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
        v-bind:class="{ hidden: isPlaying }"
        @click="play()"
        icon="play"
        width="33"
        height="27"
        color="black"
      ></svgicon>
      <svgicon
        v-bind:class="{ hidden: !isPlaying }"
        @click="pause()"
        icon="pause"
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
import { mapState, mapActions } from 'vuex';
import { Howl } from 'howler';
import dataurl from 'dataurl';
import fs from 'fs';
import '@/assets/compiled-icons/play';
import '@/assets/compiled-icons/pause';
import '@/assets/compiled-icons/stop';
import '@/assets/compiled-icons/fast-forward';


export default {
  name: 'Reader',
  data() {
    return {
      sound: null,
    };
  },
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'tracks/LAUNCH_TRACK') {
        this.playTrack(state.tracks.currentTrack);
      }
    });
  },
  computed: {
    ...mapState('tracks', ['tracks', 'playlist', 'currentTrack']),
    isPlaying() {
      return this.sound ? this.sound.playing() : false;
    },
  },
  methods: {
    ...mapActions({
      launchTrack: 'tracks/launchTrack',
    }),
    playTrack(track) {
      if (this.sound) {
        this.sound.stop();
        this.sound.unload();
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
        this.sound = new Howl({
          src: [data],
          html5: true,
        });
        this.sound.play();
      });
    },

    playPreviousSong() {
      const i = this.playlist.map(t => t.id).indexOf(this.currentTrack.id);
      if (i > -1) {
        this.launchTrack(this.playlist[Math.max(i - 1, 0)]);
      }
    },

    playNextSong() {
      const i = this.playlist.map(t => t.id).indexOf(this.currentTrack.id);
      if (i > -1 && i < this.playlist.length - 1) {
        this.launchTrack(this.playlist[i + 1]);
      } else if (i === -1) { // it means we are in another tag library
        this.launchTrack(this.tracks[0]);
      }
    },

    pause() {
      if (this.sound) {
        this.sound.pause();
      }
    },

    play() {
      if (this.sound) {
        this.sound.play();
      }
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
