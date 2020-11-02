<template>
  <div>
    <div class="sidebar">
      Tags
      <ul>
        <li
          class="tag"
          @click="event => onClickAllTracks(event, false)"
          :class="{ selected: !currentTag && !withoutTags }">
          All tracks
        </li>
        <li
          class="tag"
          @click="event => onClickAllTracks(event, true)"
          :class="{ selected: !currentTag && withoutTags }">
          Tracks without Tags
        </li>
        <li
          class="tag"
          v-for="tag in orderedTags"
          v-html="tag.name"
          v-bind:key="tag.id"
          v-bind:id="tag.id"
          @keydown="event => onEnter(event, tag)"
          @dragover="handleDragTrackover"
          @dragleave="handleDragLeave"
          @drop="handleDropTrack"
          @click="event => onClick(event, tag)"
          @dblclick="onDblClick"
          @blur="onBlur"
          :class="{ selected: currentTag && currentTag.id === tag.id }">
        </li>
      </ul>
      <b-button @click="applyCurrentTag()" type="button" v-if="currentTag !== null">
        Apply current Tag
      </b-button>
      <b-button @click="createTag()" type="button">
        &#43; Add Tag
      </b-button>
      <b-button @click="analyzeComments()" type="button">
        &#43; Analyze comments
      </b-button>
      <!-- <b-button @click="clearAllMetadata()" type="button">
        &#43; Clear all Metadata
      </b-button> -->
    </div>
    <TagsAnalysisModal />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ipcRenderer } from 'electron';
import TagsAnalysisModal from './TagsAnalysisModal';

export default {
  name: 'Sidebar',
  components: {
    TagsAnalysisModal,
  },
  data() {
    return {
      withoutTags: false,
    };
  },
  mounted() {
    this.loadTags();
  },
  computed: {
    ...mapState('tags', ['tags', 'currentTag']),
    orderedTags() {
      return [...this.tags].sort((a, b) => (a.order < b.order ? -1 : 1));
    },
  },
  methods: {
    ...mapActions({
      loadTags: 'tags/loadTags',
      createTag: 'tags/createTag',
      updateTag: 'tags/updateTag',
      setCurrentTag: 'tags/setCurrentTag',
      deleteTag: 'tags/deleteTag',
      applyCurrentTag: 'tags/applyCurrentTag',
      addTagToTracks: 'tracks/addTagToTracks',
      loadTracks: 'tracks/loadTracks',
      loadAllTracks: 'tracks/loadAllTracks',
    }),
    onEnter(event, tag) {
      if ([13, 27].indexOf(event.keyCode) === -1) {
        return;
      }
      event.preventDefault();
      const updatedTag = { ...tag };
      if (event.keyCode === 27) {
        event.target.innerText = updatedTag.name;
      } else if (event.keyCode === 13 && event.target.innerText) {
        updatedTag.name = event.target.innerText;
        this.updateTag(updatedTag);
      } else {
        this.deleteTag(updatedTag);
      }
      event.target.blur();
    },
    handleDragTrackover(event) {
      event.preventDefault();
      event.target.classList.add('dragover');
    },
    handleDragLeave(event) {
      event.target.classList.remove('dragover');
    },
    handleDropTrack(event) {
      const tagId = event.target.id;
      const trackIds = event
        .dataTransfer
        .getData('text')
        .split(',')
        .map(t => parseInt(t, 10));
      this.addTagToTracks({ tagId, trackIds });
      this.handleDragLeave(event);
    },
    onClick(event, tag) {
      this.loadTracks(tag.id);
      this.setCurrentTag(tag);
    },
    onClickAllTracks(event, withoutTags) {
      this.loadAllTracks(withoutTags);
      this.setCurrentTag(null);
      this.withoutTags = withoutTags;
    },
    onDblClick(event) {
      event.target.contentEditable = true;
    },
    onBlur(event) {
      const updatedTag = this.tags.find(t => t.id === parseInt(event.target.id, 10));
      event.target.innerText = updatedTag.name;
      event.target.contentEditable = false;
    },
    analyzeComments() {
      this.$modal.show('tags-analysis-modal');
      ipcRenderer.on('tracks:tagsAppliedSuccessfully', () => {
        this.$modal.hide('tags-analysis-modal');
        ipcRenderer.removeAllListeners('tracks:tagsAppliedSuccessfully');
      });
    },
    clearAllMetadata() {
      ipcRenderer.send('tracks:clearAllMetadata');
    },
  },
};

</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .sidebar {
    position: fixed;
    min-width: $readerWidth;
    max-width: $readerWidth;
    min-height: 100vh;
    padding: 20px;
    background-color: $black;
    color: rgba($white, 0.8);
    line-height: 1.5;
    z-index: 1;
  }

  .selected {
    color: $mainColor;
  }

  .dragover {
    font-weight: 700;
  }
</style>
