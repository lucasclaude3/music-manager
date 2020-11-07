<template>
  <div class="youtube-window"
    :class="{ 'youtube-player-loaded': videoId }">
    <youtube
      class="youtube-player"
      ref="youtube"
      v-if="videoId"
      :video-id="videoId"
      @playing="playing"
    ></youtube>
    <ul class="playlists">
      <li
        v-for="playlist in orderedPlaylists"
        :key="playlist.id"
        :id="playlist.id"
        class="playlist"
        @click="toggleCollapse"
      >
        {{ playlist.snippet.title }}
        <ul class="items">
          <li
            v-for="item in playlist.playlistItems"
            :key="item.id"
            :id="item.id"
            class="item"
            @click="() => loadVideo(item.snippet.resourceId.videoId)"
          >
            {{ item.snippet.title }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { Promise } from 'bluebird';

export default {
  name: 'YoutubeWindow',
  data() {
    return {
      playlists: [],
      nextPageToken: null,
      winHeight: window.innerHeight,
      winWidth: window.innerWidth,
      videoId: null,
    };
  },
  mounted() {
    this.playlistsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails%2Cid&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`;
    this.playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails%2Cid&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`;
    this.loadAllPlaylists()
      .then(this.loadAllPlaylistsItems);
    window.addEventListener('resize', () => {
      this.winHeight = window.innerHeight;
      this.winWidth = window.innerWidth;
    });
  },
  computed: {
    orderedPlaylists() {
      return this.playlists.sort((a, b) => (a.snippet.title <= b.snippet.title ? -1 : 1));
    },
    player() {
      return this.$refs.youtube.player;
    },
  },
  methods: {
    ...mapActions({
    }),
    playVideo() {
      this.player.playVideo();
    },
    playing() {
      console.log('\\o/ we are watching!!!');
    },
    loadVideo(videoId) {
      this.videoId = videoId;
    },
    loadAllPlaylists() {
      return this.getPageAndIterate({
        url: `${this.playlistsUrl}&channelId=UCwdiLu9-q3Tazfqd17IGWlw`,
        nextPageToken: null,
        isFirstCall: true,
        auxiliaryFunction: this.savePlaylists,
      });
    },
    loadAllPlaylistsItems() {
      return Promise.map(
        this.playlists,
        p => this.loadPlaylistItems(p.id),
        { concurrency: 5 },
      );
    },
    loadPlaylistItems(playlistId) {
      return this.getPageAndIterate({
        url: `${this.playlistItemsUrl}&playlistId=${playlistId}`,
        nextPageToken: null,
        isFirstCall: true,
        auxiliaryFunction: data => this.savePlaylistItems(data, playlistId),
      });
    },
    getPageAndIterate({
      url,
      nextPageToken,
      isFirstCall,
      auxiliaryFunction,
    }) {
      if (!nextPageToken && !isFirstCall) {
        return Promise.resolve();
      }
      let finalUrl = url;
      if (nextPageToken) {
        finalUrl += `&pageToken=${nextPageToken}`;
      }
      return this.$http.get(finalUrl)
        .then((response) => {
          auxiliaryFunction(response.data);
          return this.getPageAndIterate({
            url,
            nextPageToken: response.data.nextPageToken,
            isFirstCall: false,
            auxiliaryFunction,
          });
        });
    },
    savePlaylists(data) {
      this.playlists = this.playlists.concat(data.items);
      this.nextPageToken = data.nextPageToken;
    },
    savePlaylistItems(data, playlistId) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      playlist.playlistItems = (playlist.playlistItems || []).concat(data.items);
      this.playlists = [...this.playlists];
    },
    toggleCollapse(event) {
      const itemsElt = event.target.getElementsByClassName('items')[0];
      if (itemsElt.classList.contains('items-selected')) {
        itemsElt.classList.remove('items-selected');
      } else {
        itemsElt.classList.add('items-selected');
      }
    },
  },
};
</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .youtube-window {
    position: fixed;
    top: 0;
    right: 0;
    min-width: $sidebarWidth;
    max-width: $sidebarWidth;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    padding: 20px;
    background-color: $black;
    color: rgba($white, 0.8);
    line-height: 1.5;
    z-index: 1;
    &.youtube-player-loaded {
      min-width: 3*$sidebarWidth;
      max-width: 3*$sidebarWidth;
    }
  }

  .playlists {
    overflow-y: scroll;
    height: 100vh;
  }

  .items {
    display: none;

    &.items-selected {
      display: initial;
    }
  }

</style>
