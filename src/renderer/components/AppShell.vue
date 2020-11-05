<template>
  <main>
    <Sidebar />
    <div class="wrapper">
      <Reader />
      <MainWindow />
    </div>
    <YoutubeWindow />
  </main>
</template>

<script>
import Reader from './Reader';
import Sidebar from './Sidebar';
import MainWindow from './MainWindow';
import YoutubeWindow from './YoutubeWindow';

export default {
  name: 'AppShell',
  components: {
    Reader,
    Sidebar,
    MainWindow,
    YoutubeWindow,
  },
};
</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    padding-left: $sidebarWidth;
    padding-right: $sidebarWidth;
  }
</style>
