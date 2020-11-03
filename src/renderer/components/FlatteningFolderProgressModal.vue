<template>
  <modal
    name="flattening-folder-progress-modal"
    id="flattening-folder-progress-modal"
    :clickToClose="false"
  >
    <div class="text-centered">
      Copying files... {{ countCopiedFiles }} / {{ countFilesToCopy }}
      <b-progress
        class="mt-2"
        :max="100"
        :value="currentProgress"
      ></b-progress>
    </div>
    <div v-if="hasEnded">
      <b-button @click="closeModal" class="btn-centered">Close</b-button>
    </div>
  </modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ipcRenderer } from 'electron';

export default {
  name: 'FlatteningFolderProgressModal',
  computed: {
    ...mapState('files', ['countFilesToCopy', 'countCopiedFiles']),
    currentProgress() {
      return 100 * (this.countCopiedFiles / this.countFilesToCopy);
    },
    hasEnded() {
      return this.countCopiedFiles === this.countFilesToCopy;
    },
  },
  methods: {
    ...mapActions({
      updateCopiedFilesCount: 'files/updateCopiedFilesCount',
    }),
    closeModal() {
      ipcRenderer.send('folder:flattened');
      this.$modal.hide('flattening-folder-progress-modal');
      this.updateCopiedFilesCount({ countFilesToCopy: 0, countCopiedFiles: 0 });
    },
  },
};
</script>

<style lang="scss">
  @import 'styles/_vars.scss';

  .text-centered {
    text-align: center;
  }

  .btn-centered {
    margin: 12px auto;
  }
</style>
