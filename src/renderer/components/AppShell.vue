<template>
  <main>
    <Sidebar />
    <div class="wrapper">
      <Reader />
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

<style scoped lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    padding-left: 250px;
  }
</style>
