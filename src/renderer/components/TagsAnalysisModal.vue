<template>
  <modal
    name="tags-analysis-modal"
    id="tags-analysis-modal"
    @before-open="beforeOpen">
    Hola
    <ul>
      <li
        v-for="comment in comments"
        v-bind:key="comment">{{ comment }}</li>
    </ul>
  </modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'TagsAnalysisModal',
  computed: {
    ...mapState('tracks', ['comments']),
  },
  methods: {
    ...mapActions({
      analyzeComments: 'tracks/analyzeComments',
    }),
    beforeOpen() {
      this.analyzeComments();
    },
  },
};
</script>

<style lang="scss">
  @import 'styles/_vars.scss';

  .vm--modal {
    background-color: $moreBlack;
    padding: 20px 30px;
  }
</style>
