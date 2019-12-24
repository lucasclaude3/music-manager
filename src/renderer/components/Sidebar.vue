<template>
  <nav class="sidebar">
    sidebar
  </nav>
</template>

<script>
export default {
  name: 'Sidebar',
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
