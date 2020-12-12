<template>
  <main>
    <TheLeftCollapsableSidebar />
    <div
      class="wrapper"
      :style="{'padding-left':
        (collapsableSidebarWidth + (isLeftSidebarOpened ? sidebarWidth : 0)) + 'px'}">
      <Reader />
      <MainWindow />
    </div>
    <TheRightCollapsableSidebar />
  </main>
</template>

<script>
import { mapState } from 'vuex';
import vars from '@/assets/utils/vars';

import Reader from './Reader';
import TheLeftCollapsableSidebar from './TheLeftCollapsableSidebar';
import MainWindow from './MainWindow';
import TheRightCollapsableSidebar from './TheRightCollapsableSidebar';

export default {
  name: 'AppShell',
  components: {
    Reader,
    TheLeftCollapsableSidebar,
    MainWindow,
    TheRightCollapsableSidebar,
  },
  data() {
    return {
      collapsableSidebarWidth: vars.collapsableSidebarWidth,
      sidebarWidth: vars.sidebarWidth,
    };
  },
  mounted() {},
  computed: {
    ...mapState('columns', ['isLeftSidebarOpened']),
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
    padding-right: $collapsableSidebarWidth;
    transition: padding 0.3s ease;
  }
</style>
