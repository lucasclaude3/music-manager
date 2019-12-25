<template>
  <nav class="sidebar">
    sidebar
    <ul>
      <li
        @click="selectItem(index), chooseItem()"
        v-for="(tag, index) in this.tags"
        v-html="tag"
        v-bind:key="index"
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
  },
  methods: {
    ...mapActions({
      loadTags: 'tags/loadTags',
      createTag: 'tags/createTag',
    }),
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
