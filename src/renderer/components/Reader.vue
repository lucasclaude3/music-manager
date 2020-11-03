<template>
  <div class="reader-wrapper">
    <div class="reader">
      <div v-if="currentTrack" class="track-info-container">
        <div class="track-info">{{ currentTrack.name }}</div>
        <div class="track-info">
          <span>{{ currentTrack.shortComment }}</span>
        </div>
      </div>
      <div v-if="!currentTrack" class="track-info-container placeholder"></div>
      <div class="svgs-container">
        <span
          v-if="typeof currentTime === 'number'"
          class="time"
        >{{ displayTime(currentTime) }}</span>
        <svgicon
          @click="playPreviousSong()"
          icon="fast-forward"
          width="22"
          height="18"
          dir="down"
        ></svgicon>
        <svgicon
          :class="{ hidden: isPlaying }"
          @click="play()"
          icon="play"
          width="33"
          height="27"
          id="play"
        ></svgicon>
        <svgicon
          :class="{ hidden: !isPlaying }"
          @click="pause()"
          icon="pause"
          width="33"
          height="27"
          id="pause"
        ></svgicon>
        <svgicon
          @click="playNextSong()"
          icon="fast-forward"
          width="22"
          height="18"
        ></svgicon>
        <span
          v-if="typeof totalTime === 'number'
            && totalTime > 0"
          class="time"
        >{{ displayTime(totalTime) }}</span>
      </div>
      <div @click="handleClick">
        <b-progress
          class="mt-2"
          :max="100"
          :value="currentProgress"
        ></b-progress>
      </div>
    </div>
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
      isLoaded: false,
      currentTime: null,
      totalTime: null,
      currentProgress: 0,
    };
  },
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'tracks/LAUNCH_TRACK') {
        this.playTrack(state.tracks.currentTrack);
      }
    });
    this.$nextTick(() => {
      window.setInterval(() => {
        if (this.isLoaded) {
          this.currentTime = this.sound.seek();
          this.totalTime = this.sound.duration();
          this.currentProgress = 100.0 * (this.currentTime / this.totalTime);
        } else {
          this.currentProgress = 0;
        }
      }, 100);
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
        this.isLoaded = false;
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
        this.sound.once('load', () => {
          this.isLoaded = true;
          this.sound.play();
        });
      });
    },

    playPreviousSong() {
      if (!this.sound) {
        return;
      }
      const i = this.playlist.map(t => t.id).indexOf(this.currentTrack.id);
      if (i > -1) {
        this.launchTrack(this.playlist[Math.max(i - 1, 0)]);
      }
    },

    playNextSong() {
      if (!this.sound) {
        return;
      }
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

    handleClick(event) {
      if (!this.isLoaded) {
        return;
      }
      const progressBarElement = event.target.firstElementChild.getBoundingClientRect();
      if (event.x >= progressBarElement.left && event.x <= progressBarElement.right) {
        const progressRatio = (event.x - progressBarElement.left) / progressBarElement.width;
        this.sound.seek(this.sound.duration() * progressRatio);
      }
    },

    displayTime(time) {
      const hour = Math.floor(time / 3600);
      const min = Math.floor((time - (hour * 3600)) / 60);
      const sec = Math.floor((time - (hour * 3600) - (min * 60)));
      if (hour > 0) {
        return `${hour}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      }
      return `${min}:${sec.toString().padStart(2, '0')}`;
    },
  },
};
</script>

<style lang="scss">
  @import 'styles/_vars.scss';

  .reader-wrapper {
    position: fixed;
    width: calc(100% - #{$readerWidth});
    height: 130px;
    border-bottom: 1px solid $black;
    padding-top: 10px;
    z-index: 1;
  }

  .reader {
    margin: auto;
    width: 600px;
    padding: 10px 0;
    background-color: $black;
    border-radius: 3px;
  }

  .track-info-container {
    width: 300px;
    height: 50px;
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
    width: 200px;
    margin: 0 auto;
    text-align: center;
    color: rgba($white, 0.8);
  }

  .svg-icon {
    opacity: 0.66;
    &:hover {
      opacity: 1;
    }
  }

  .time {
    vertical-align: middle;
    opacity: 0.4;
    display: inline-block;
    width: 40px;
  }

  .progress {
    width: 400px;
    height: 5px;
    margin: 0 auto;
    pointer-events: none;
    background-color: rgba($mainColor, 0.4);

    .progress-bar {
      transition: none;
      background-color: rgba($mainColor, 1);
    }
  }
</style>
