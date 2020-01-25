<template>
  <nav class="sidebar">
    sidebar
    <ul>
      <li
        class="tag"
        v-for="tag in orderedTags"
        v-html="tag.name"
        v-bind:key="tag.id"
        v-bind:id="tag.id"
        @keydown="event => onEnter(event, tag)"
        @dragover="handleDragTrackover"
        @drop="handleDropTrack"
        @dblclick="onDblClick"
        @blur="onBlur"
      ></li>
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
      deleteTag: 'tags/deleteTag',
      addTagToTrack: 'tracks/addTagToTrack',
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
    },
    handleDropTrack(event) {
      const tagId = event.target.id;
      const trackId = event
        .dataTransfer
        .getData('text');
      this.addTagToTrack({ tagId, trackId });
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
    min-width: 200px;
    max-width: 200px;
    min-height: 100vh;
    border-right: 1px solid $border-primary;
    background-color: $background-primary;
    color: $text-primary;
  }
</style>
