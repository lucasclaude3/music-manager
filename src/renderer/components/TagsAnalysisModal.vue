<template>
  <modal
    name="tags-analysis-modal"
    id="tags-analysis-modal"
    @before-open="beforeOpen">
    <b-button @click="undoLastRemove">Undo</b-button>
    <ul>
      <li
        v-for="comment in comments"
        v-bind:key="comment">
        {{ comment }}
        <span
          class="cross"
          @click="event => removeComment(event, comment)">&#10006;
        </span>
      </li>
    </ul>
  </modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'TagsAnalysisModal',
  data() {
    return {
      lastIndexes: [],
      lastComments: [],
    };
  },
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
    removeComment(event, comment) {
      const lastIndex = this.comments.indexOf(comment);
      this.lastIndexes.push(lastIndex);
      if (lastIndex > -1) {
        this.lastComments.push(this.comments[lastIndex]);
        this.comments.splice(lastIndex, 1);
      }
    },
    undoLastRemove() {
      if (this.lastIndexes.length === 0) {
        return;
      }
      const lastIndex = this.lastIndexes.pop();
      const lastComment = this.lastComments.pop();
      this.comments.splice(lastIndex, 0, lastComment);
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

  .cross {
    cursor: pointer;
    &:hover {
      color: $mainColor;
    }
  }
</style>
