<template>
  <div class="youtube-window">
    YO
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
    };
  },
  mounted() {
    this.playlistsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails%2Cid&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`;
    this.playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails%2Cid&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`;
    this.loadAllPlaylists()
      .then(this.loadAllPlaylistsItems);
  },
  computed: {
  },
  methods: {
    ...mapActions({
    }),
    loadAllPlaylists() {
      return this.getPageAndIterate({
        url: `${this.playlistsUrl}&channelId=UCwdiLu9-q3Tazfqd17IGWlw`,
        nextPageToken: null,
        isFirstCall: true,
        auxiliaryFunction: this.savePlaylists,
      });
    },
    loadAllPlaylistsItems() {
      console.log('Wesh', this.playlists);
      return Promise.map(
        this.playlists,
        p => this.loadPlaylistItems(p.id),
        { concurrency: 5 },
      );
    },
    loadPlaylistItems(playlistId) {
      console.log(playlistId);
      return this.getPageAndIterate({
        url: `${this.playlistItemsUrl}&playlistId=${playlistId}`,
        nextPageToken: null,
        isFirstCall: true,
        auxiliaryFunction: this.savePlaylistItems,
      });
    },
    getPageAndIterate({
      url,
      nextPageToken,
      isFirstCall,
      auxiliaryFunction,
    }) {
      console.log(nextPageToken, isFirstCall);
      if (!nextPageToken && !isFirstCall) {
        console.log('Resolved');
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
    savePlaylistItems(data) {
      console.log(data);
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
    padding: 20px;
    background-color: $black;
    color: rgba($white, 0.8);
    line-height: 1.5;
    z-index: 1;
  }
</style>
