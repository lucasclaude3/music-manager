<template>
  <div class="collapsable-sidebar">
    <ul class="icons-list" :class="{ 'opened': isOpened }">
      <li>
        <svgicon
          icon="tag"
          width="40"
          height="40"
          :class="{ 'selected': isOpened }"
          @click="() => toggleSidebar()"></svgicon>
      </li>
    </ul>
    <transition name="slide">
      <TagManager v-show="isOpened"></TagManager>
    </transition>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import '@/assets/compiled-icons/tag';
import TagManager from '@/components/TagManager';

export default {
  name: 'TheLeftCollapsableSidebar',
  components: { TagManager },
  data() {
    return {};
  },
  mounted() {
  },
  computed: {
    ...mapState('columns', {
      isOpened: 'isLeftSidebarOpened',
    }),
  },
  methods: {
    ...mapActions({
      updateLeftSidebarConfig: 'columns/updateLeftSidebarConfig',
    }),
    toggleSidebar() {
      this.updateLeftSidebarConfig({ isLeftSidebarOpened: !this.isOpened });
    },
  },
};
</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .collapsable-sidebar {
    position: fixed;
    display: flex;
    flex-flow: row nowrap;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    color: rgba($white, 0.8);
    line-height: 1.5;
    z-index: 1;
    transition-property: all;
  }

  .icons-list {
    width: $collapsableSidebarWidth;
    list-style-type: none;
    padding-inline-start: 0px;
    padding: 10px;
    z-index: 2;
    background-color: $black;
  }

  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
  }

  .slide-enter, .slide-leave-to {
    transform: translate(-100px);
    opacity: 0;
  }

  .svg-icon {
    color: rgba($white, 0.66);
    &:hover {
      color: rgba($mainColor, 0.66);
    }
    &.selected {
      color: $mainColor;
      opacity: 1;
    }
  }
</style>
