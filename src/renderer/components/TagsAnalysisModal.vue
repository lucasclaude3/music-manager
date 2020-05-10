<template>
  <modal
    name="tags-analysis-modal"
    id="tags-analysis-modal"
    @before-open="beforeOpen"
    @opened="opened">
    <b-button @click="undoLastRemove">Undo</b-button>
    <b-button @click="redoLastRemove">Redo</b-button>
    <ul>
      <li
        v-for="comment in comments"
        v-bind:key="comment">
        {{ comment }}
        <span
          class="cross"
          @click="() => removeComment(comment)">&#10006;
        </span>
      </li>
    </ul>
  </modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { undoRedoHistory } from '../store';

export default {
  name: 'TagsAnalysisModal',
  computed: {
    ...mapState('tracks', ['comments']),
  },
  methods: {
    ...mapActions({
      analyzeComments: 'tracks/analyzeComments',
      removeComment: 'tracks/removeComment',
    }),
    beforeOpen() {
      this.analyzeComments();
    },
    opened() {
      this.initialCommentsLength = this.comments.length;
    },
    undoLastRemove() {
      if (this.comments.length === this.initialCommentsLength) {
        return;
      }
      undoRedoHistory.undo();
    },
    redoLastRemove() {
      undoRedoHistory.redo();
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
