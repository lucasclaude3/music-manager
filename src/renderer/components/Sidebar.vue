<template>
  <nav class="sidebar">
    sidebar
    <ul>
      <li
        @click="selectItem(index), chooseItem()"
        v-for="(tag, index) in this.tags"
        v-html="tag"
        v-bind:key="index"
      ></li>
    </ul>
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
    ...mapState('Autocomplete', ['tags']),
  },
  methods: {
    ...mapActions({
      loadTags: 'Autocomplete/loadTags',
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
