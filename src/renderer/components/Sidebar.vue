<template>
  <nav class="sidebar">
    sidebar
    <ul>
      <li
        class="tag"
        v-for="tag in orderedTags"
        v-html="tag.name"
        v-bind:key="tag.id"
        @keydown="event => onEnter(event, tag)"
        contenteditable="true"
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
    }),
    onEnter(event, tag) {
      if ([13, 27].indexOf(event.keyCode) > -1) {
        event.preventDefault();
        const updatedTag = { ...tag };
        updatedTag.name = event.target.innerHTML;
        this.updateTag(updatedTag);
        event.target.blur();
      }
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
