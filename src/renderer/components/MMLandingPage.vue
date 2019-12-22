<template>
  <div id="wrapper">
    <main>
      <div class="title">Music Manager</div>
      <new-tag></new-tag>
    </main>
  </div>
</template>

<script>
import NewTag from './MMLandingPage/NewTag';

export default {
  name: 'mm-landing-page',
  components: { NewTag },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link);
    },
  },
};
</script>

<style>
</style>
