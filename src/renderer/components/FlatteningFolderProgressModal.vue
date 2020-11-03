<template>
  <modal
    name="flattening-folder-progress-modal"
    id="flattening-folder-progress-modal"
    :clickToClose="false"
  >
    <div class="text-centered">
      Copying files... {{ countCopiedFiles }} / {{ countFiles }}
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
import { mapState } from 'vuex';
import { ipcRenderer } from 'electron';

export default {
  name: 'FlatteningFolderProgressModal',
  computed: {
    ...mapState('files', ['flattening', 'countFiles', 'countCopiedFiles']),
    currentProgress() {
      return 100 * (this.countCopiedFiles / this.countFiles);
    },
    hasEnded() {
      return this.countCopiedFiles === this.countFiles;
    },
  },
  methods: {
    closeModal() {
      ipcRenderer.send('folder:flattened');
      this.$modal.hide('flattening-folder-progress-modal');
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
