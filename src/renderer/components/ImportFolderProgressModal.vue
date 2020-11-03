<template>
  <modal
    name="import-folder-progress-modal"
    id="import-folder-progress-modal"
    :clickToClose="false"
  >
    <div class="text-centered">
      Importing files with their metadata... {{ countImportedFiles }} / {{ countFilesToImport }}
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
  name: 'ImportFolderProgressModal',
  computed: {
    ...mapState('files', ['countFilesToImport', 'countImportedFiles']),
    currentProgress() {
      return 100 * (this.countImportedFiles / this.countFilesToImport);
    },
    hasEnded() {
      return this.countImportedFiles === this.countFilesToImport;
    },
  },
  methods: {
    ...mapActions({
      updateImportedFilesCount: 'files/updateImportedFilesCount',
    }),
    closeModal() {
      ipcRenderer.send('folder:imported');
      this.$modal.hide('import-folder-progress-modal');
      this.updateImportedFilesCount({ countFilesToImport: 0, countImportedFiles: 0 });
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
