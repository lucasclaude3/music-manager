<template>
  <nav class="sidebar">
    sidebar
    <ul>
      <li
        class="tag"
        @click="event => onClickAllTracks(event, false)">
        All tracks
      </li>
      <li
        class="tag"
        @click="event => onClickAllTracks(event, true)">
        Tracks without Tags
      </li>
      <li
        class="tag"
        v-for="tag in orderedTags"
        v-html="tag.name"
        v-bind:key="tag.id"
        v-bind:id="tag.id"
        @keydown="event => onEnter(event, tag)"
        @dragover="handleDragTrackover"
        @dragleave="handleDragLeave"
        @drop="handleDropTrack"
        @click="event => onClick(event, tag)"
        @dblclick="onDblClick"
        @blur="onBlur">
      </li>
    </ul>
    <b-button @click="createTag()" type="button">&#43; Add tag</b-button>
  </nav>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Sidebar',
  mounted() {
    this.loadTags();
  },
  computed: {
    ...mapState('tags', ['tags']),
    orderedTags() {
      return [...this.tags].sort((a, b) => (a.order < b.order ? -1 : 1));
    },
  },
  methods: {
    ...mapActions({
      loadTags: 'tags/loadTags',
      createTag: 'tags/createTag',
      updateTag: 'tags/updateTag',
      setCurrentTag: 'tags/setCurrentTag',
      deleteTag: 'tags/deleteTag',
      addTagToTracks: 'tracks/addTagToTracks',
      loadTracks: 'tracks/loadTracks',
      loadAllTracks: 'tracks/loadAllTracks',
    }),
    onEnter(event, tag) {
      if ([13, 27].indexOf(event.keyCode) === -1) {
        return;
      }
      event.preventDefault();
      const updatedTag = { ...tag };
      if (event.keyCode === 27) {
        event.target.innerHTML = updatedTag.name;
      } else if (event.keyCode === 13 && event.target.innerHTML) {
        updatedTag.name = event.target.innerHTML;
        this.updateTag(updatedTag);
      } else {
        this.deleteTag(updatedTag);
      }
      event.target.blur();
    },
    handleDragTrackover(event) {
      event.preventDefault();
      event.target.classList.add('dragover');
    },
    handleDragLeave(event) {
      event.target.classList.remove('dragover');
    },
    handleDropTrack(event) {
      const tagId = event.target.id;
      const trackIds = event
        .dataTransfer
        .getData('text')
        .split(',')
        .map(t => parseInt(t, 10));
      this.addTagToTracks({ tagId, trackIds });
      this.handleDragLeave(event);
    },
    onClick(event, tag) {
      this.loadTracks(tag.id);
      this.setCurrentTag(tag);
    },
    onClickAllTracks(event, withoutTags) {
      this.loadAllTracks(withoutTags);
      this.setCurrentTag(null);
    },
    onDblClick(event) {
      event.target.contentEditable = true;
    },
    onBlur(event) {
      event.target.contentEditable = false;
    },
  },
};

</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .sidebar {
    position: fixed;
    min-width: 200px;
    max-width: 200px;
    min-height: 100vh;
    border-right: 1px solid $border-primary;
    background-color: $background-primary;
    color: $text-primary;
    z-index: 1;
  }

  .dragover {
    font-weight: 700;
  }
</style>
