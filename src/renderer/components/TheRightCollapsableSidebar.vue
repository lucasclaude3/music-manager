<template>
  <div class="collapsable-sidebar">
    <transition name="slide">
      <router-view v-show="selectedElementId"></router-view>
    </transition>
    <ul class="icons-list" :class="{ 'opened': selectedElementId !== null }">
      <li v-for="element in windowElements"
          v-bind:key="element.id">
        <svgicon
          icon="youtube"
          width="45"
          height="45"
          :class="{ 'selected': element.id === selectedElementId }"
          @click="() => toggleSidebar(element)"></svgicon>
      </li>
    </ul>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';
import '@/assets/compiled-icons/youtube';

export default {
  name: 'TheRightCollapsableSidebar',
  data() {
    return {
      windowElements: [
        { id: uuid(), name: 'youtube-window' },
      ],
      activeElementId: null,
      selectedElementId: null,
    };
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    toggleSidebar(element) {
      if (element.name !== this.$router.currentRoute.name) {
        this.selectedElementId = element.id;
        this.$router.replace(element.name);
      } else {
        this.selectedElementId = (this.selectedElementId ? null : element.id);
      }
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
    top: 0;
    right: 0;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    background-color: $black;
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
    transform: translate(100px);
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
