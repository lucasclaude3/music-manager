<template>
  <main>
    <Reader />
    <div class="wrapper">
      <Sidebar />
      <MainWindow />
    </div>
  </main>
</template>

<script>
import Reader from './Reader';
import Sidebar from './Sidebar';
import MainWindow from './MainWindow';

export default {
  name: 'AppShell',
  components: {
    Reader,
    Sidebar,
    MainWindow,
  },
};
</script>

<style lang="scss">
  .wrapper {
    display: flex;
    width: 100%;
    align-items: stretch;
  }
</style>
