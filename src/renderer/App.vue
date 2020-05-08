<template>
  <div id="app">
    <AppShell />
  </div>
</template>

<script>
import AppShell from '@/components/AppShell';
export default {
  name: 'music-manager',
  components: {
    AppShell,
  },
};
</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  #app {
    height: 100vh;
    font-size: 14px;
    color: rgba($white, 0.8);
    background: linear-gradient($grey, $black);
  }
</style>
