<template>
  <modal
    name="tags-analysis-modal"
    id="tags-analysis-modal"
    @before-open="beforeOpen"
    @opened="opened"
    :clickToClose="false"
  >
    <div v-if="comments.length === 0">
      <div class="tags-analysis-header">No previous comments found.</div>
    </div>
    <div v-if="comments.length > 0">
      <div class="tags-analysis-header">Previous comments found:</div>
      <table class="previous-comments">
        <tr
          v-for="comment in comments"
          v-bind:key="comment.originalComment">
          <td>
            <span :class="{ strike: !comment.selected }">
              {{ comment.originalComment }}
            </span>
            <span v-show="comment.hasBeenModified && comment.selected">
              <span> >> </span>
              <span
                class="new-tag"
                v-bind:id="comment.originalComment"
                @keydown="event => onEnter(event, comment)"
              >
                {{ comment.modifiedComment }}
              </span>
            </span>
          </td>
          <td>
            <svgicon
              class="modal-icon"
              @click="() => editComment(comment)"
              icon="edit"
              width="22"
              height="18"
            ></svgicon>
          </td>
          <td>
            <svgicon
              class="modal-icon"
              @click="() => toggleRemoveComment(comment)"
              v-if="comment.selected"
              icon="rubbish-can"
              width="22"
              height="18"
            ></svgicon>
            <svgicon
              class="modal-icon"
              @click="() => toggleRemoveComment(comment)"
              v-if="!comment.selected"
              icon="undo"
              width="22"
              height="18"
            ></svgicon>
          </td>
        </tr>
      </table>
      <div>
        <b-button @click="() => applyTags(comments)" type="button">
          Apply tags
        </b-button>
      </div>
    </div>
    <div>
      <b-button @click="() => closeModal()" type="button">
        Close
      </b-button>
    </div>
  </modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import '@/assets/compiled-icons/undo';
import '@/assets/compiled-icons/rubbish-can';
import '@/assets/compiled-icons/edit';

export default {
  name: 'TagsAnalysisModal',
  computed: {
    ...mapState('tracks', ['comments']),
  },
  methods: {
    ...mapActions({
      analyzeComments: 'tracks/analyzeComments',
      toggleRemoveComment: 'tracks/toggleRemoveComment',
      updateComment: 'tracks/updateComment',
      applyTags: 'tracks/applyTags',
    }),
    beforeOpen() {
      this.analyzeComments();
    },
    opened() {
      this.initialCommentsLength = this.comments.length;
    },
    editComment(comment) {
      if (!comment.selected) {
        this.toggleRemoveComment(comment);
      }
      const newValue = comment.modifiedComment.trim();
      this.updateComment({ comment, newValue });
      const elt = window.document.getElementById(comment.originalComment);
      elt.setAttribute('contentEditable', true);
      setTimeout(() => {
        elt.focus();
      }, 0);
      elt.onblur = () => {
        this.updateComment({ comment, newValue: elt.innerText });
        elt.setAttribute('contentEditable', false);
      };
    },
    onEnter(event, comment) {
      if ([13, 27].indexOf(event.keyCode) === -1) {
        return;
      }
      event.preventDefault();
      if (event.target.innerText) {
        this.updateComment({ comment, newValue: event.target.innerText });
      }
      event.target.blur();
    },
    closeModal() {
      this.$modal.hide('tags-analysis-modal');
    },
  },
};
</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .strike {
    text-decoration: line-through;
  }

  .new-tag {
    color: $mainColor;
  }

  .modal-icon {
    cursor: pointer;
    &:hover {
      color: $mainColor;
    }
  }

  .tags-analysis-header {
    margin-bottom: 12px;
  }

  table.previous-comments {
    margin-bottom: 12px;
  }
</style>
