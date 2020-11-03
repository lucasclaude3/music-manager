<template>
  <div class="main-window">
    <div class="searchbar">
      <label for="search"></label>
      <b-form-input
        id="search"
        v-model="searchTerms"
        type="text"
        @keypress="event => onNewChar(event, searchTerms)"
        @keydown="event => onNewChar(event, searchTerms)"
      ></b-form-input>
    </div>
    <table>
      <thead id="tracks-header">
        <tr>
          <th
            v-for="column in orderedColumns"
            v-bind:key="column.id"
            v-bind:id="column.id"
            @click="sortBy(column.id)"
            draggable="true"
            @dragstart="handleDragColumn"
            @dragend="handleDragEnd"
            @drop="handleDropColumn"
            :class="{ active: sortKey == column.id, selected: selectedColumnId == column.id }"
            :style="{
              'max-width': `${column.size}px`,
              'min-width': `${column.size}px`
            }"
          >
            <div
              class="resize"
              @mousedown="event => startResizing(event)"
            ></div>
            <div
              class="reorder reorder-before"
              @dragover="handleDragColumnover"
              @dragleave="handleDragLeave"
            ></div>
            <div
              class="reorder reorder-after"
              @dragover="handleDragColumnover"
              @dragleave="handleDragLeave"
            ></div>
            <span class="column-name">{{ capitalize(column.trad) }}</span>
            <span class="arrow" :class="column.sortOrder > 0 ? 'asc' : 'dsc'">
            </span>
          </th>
        </tr>
      </thead>
      <tbody
        class="table-scroll"
        :style="{ 'max-height': `${winHeight - 226}px` }"
        @keydown="event => removeTracks(event)"
      >
        <tr
          class="track"
          v-for="track in orderedTracks"
          :key="track.id"
          :id="track.index"
          :data-id="track.id"
          tabindex="0"
          draggable="true"
          @dragstart="handleDragTrack"
          @dblclick="() => launchTrack(track)"
          @click.exact="handleFocus"
          @click.shift="handleFocusShift"
          @blur="handleBlur"
          @contextmenu="openTracksContextMenu"
          :class="{ selected: firstSelectedElement
                           && track.index >= parseInt(firstSelectedElement.id, 10)
                           && track.index <= parseInt(secondSelectedElement.id, 10) }"
        >
          <td
            v-for="column in orderedColumns"
            v-bind:key="column.id"
            class="no-pointer-events"
            :style="{
              'max-width': `${column.size}px`,
              'min-width': `${column.size}px`
            }"
          >
            <span>{{track[column.id]}}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <FlatteningFolderProgressModal />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { remote, ipcRenderer, shell } from 'electron';
import FlatteningFolderProgressModal from './FlatteningFolderProgressModal';

const { Menu, MenuItem } = remote;

export default {
  name: 'MainWindow',
  components: {
    FlatteningFolderProgressModal,
  },
  data() {
    return {
      searchTerms: '',
      firstSelectedElement: null,
      secondSelectedElement: null,
      sortKey: '',
      winHeight: window.innerHeight,
      winWidth: window.innerWidth,
      resizing: false,
      startX: null,
      endX: null,
      diffX: null,
      columnId: null,
      selectedColumnId: null,
      tracksContextMenu: null,
    };
  },
  mounted() {
    this.loadColumnsContextMenu();
    this.loadColumns(window.innerWidth - 250);
    this.loadTracks();
    this.loadTracksContextMenu();
    this.watchTrackAddition();
    this.watchTrackModification();
    window.addEventListener('resize', () => {
      this.winHeight = window.innerHeight;
      this.winWidth = window.innerWidth;
      this.loadColumns(window.innerWidth - 250);
    });
    window.document.addEventListener('mousemove', this.onMouseMove);
    window.document.addEventListener('mouseup', this.onMouseUp);
    this.watchFolderFlattening();
  },
  computed: {
    ...mapState('tracks', ['tracks']),
    ...mapState('tags', ['currentTag']),
    ...mapState('columns', ['columns']),
    orderedColumns() {
      return [...this.columns]
        .filter(c => c.visible)
        .sort((a, b) => (a.revColOrder > b.revColOrder ? -1 : 1));
    },
    orderedTracks() {
      const { sortKey, columns, tracks } = this;
      const column = columns.find(c => c.id === sortKey);
      const order = (column && column.sortOrder) || 1;
      const tmpTracks = [...tracks]
        .sort((a, b) => {
          const aSortKey = a[sortKey] || '';
          const bSortKey = b[sortKey] || '';
          if (aSortKey < bSortKey || (aSortKey === bSortKey && a.id < b.id)) {
            return order;
          }
          return -order;
        });
      tmpTracks.forEach((t, index) => {
        t.index = index;
      });
      return tmpTracks;
    },
  },
  methods: {
    ...mapActions({
      loadTracks: 'tracks/loadTracks',
      watchTrackAddition: 'tracks/watchTrackAddition',
      watchTrackModification: 'tracks/watchTrackModification',
      launchTrack: 'tracks/launchTrack',
      searchTrack: 'tracks/searchTrack',
      removeTracksFromList: 'tracks/removeTracksFromList',
      loadColumns: 'columns/loadColumns',
      invertOrder: 'columns/invertOrder',
      updateColumnSize: 'columns/updateColumnSize',
      saveColumnSize: 'columns/saveColumnSize',
      toggleColumnVisibility: 'columns/toggleColumnVisibility',
      updateColumnOrder: 'columns/updateColumnOrder',
      updateFlatteningStatus: 'files/updateFlatteningStatus',
      updateCopiedFilesCount: 'files/updateCopiedFilesCount',
    }),
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    removeTracks(event) {
      if (!(event.metaKey && event.keyCode === 8)) {
        return;
      }
      if (this.firstSelectedElement === null) {
        return;
      }
      const selectedTrackIds = this.orderedTracks
        .filter(t => t.index >= parseInt(this.firstSelectedElement.id, 10)
                  && t.index <= parseInt(this.secondSelectedElement.id, 10))
        .map(t => t.id);
      this.removeTracksFromList({ trackIds: selectedTrackIds, tag: this.currentTag });
    },
    handleDragTrack(event) {
      if (this.firstSelectedElement === null
        || event.target.id < parseInt(this.firstSelectedElement.id, 10)
        || event.target.id > parseInt(this.secondSelectedElement.id, 10)) {
        this.handleFocus(event);
      }
      const selectedTracks = this.orderedTracks
        .filter(t => t.index >= parseInt(this.firstSelectedElement.id, 10)
                  && t.index <= parseInt(this.secondSelectedElement.id, 10))
        .map(t => t.id);
      event
        .dataTransfer
        .setData('text/plain', selectedTracks);
    },
    handleDragColumn(event) {
      if (this.selectedColumnId === null) {
        this.selectedColumnId = event.target.id;
      }
      event
        .dataTransfer
        .setData('text/plain', event.target.id);
    },
    handleDragColumnover(event) {
      event.preventDefault();
      event.target.classList.add('dragover');
    },
    handleDragLeave(event) {
      event.target.classList.remove('dragover');
    },
    handleDragEnd() {
      this.selectedColumnId = null;
    },
    handleDropColumn(event) {
      event.target.classList.remove('dragover');
      const droppedOn = this.columns.find(c => c.id === event.target.parentNode.id);
      const columnId = event
        .dataTransfer
        .getData('text');
      this.updateColumnOrder({
        movedColumn: this.columns.find(c => c.id === columnId),
        droppedOn,
        before: event.target.classList.contains('reorder-before'),
      });
    },
    onNewChar(event, searchTerms) {
      let searchTermsUpdated;
      const char = String.fromCharCode(event.keyCode);
      if (event.type === 'keypress' && /[a-zA-Z0-9-_ ]/.test(char)) {
        searchTermsUpdated = searchTerms + char;
      } else if (event.type === 'keydown' && event.keyCode === 8) {
        searchTermsUpdated = searchTerms.slice(0, searchTerms.length - 1);
      } else {
        return;
      }
      this.searchTrack({ searchTerms: searchTermsUpdated, tag: this.currentTag });
    },
    handleFocus(event) {
      this.firstSelectedElement = event.target;
      this.secondSelectedElement = event.target;
    },
    handleFocusShift(event) {
      if (parseInt(event.target.id, 10) < parseInt(this.firstSelectedElement.id, 10)) {
        this.firstSelectedElement = event.target;
        return;
      }
      this.secondSelectedElement = event.target;
    },
    handleBlur(event) {
      if (!event.relatedTarget || !event.relatedTarget.classList.contains('track')) {
        this.firstSelectedElement = null;
        this.secondSelectedElement = null;
      }
    },
    loadColumnsContextMenu() {
      const vm = this;
      ipcRenderer.send('columns:load_all');
      ipcRenderer.on('columns:loaded_all', (event, columns) => {
        ipcRenderer.removeAllListeners('columns:loaded_all');
        const menu = new Menu();
        columns.forEach((c) => {
          menu.append(new MenuItem({
            label: this.capitalize(c.trad),
            type: 'checkbox',
            checked: c.visible,
            click() {
              vm.toggleColumnVisibility({ columnId: c.id, windowWidth: (window.innerWidth - 250) });
            },
          }));
        });

        window.document.getElementById('tracks-header').addEventListener('contextmenu', () => {
          menu.popup(remote.getCurrentWindow());
        }, false);
      });
    },
    loadTracksContextMenu() {
      const vm = this;
      this.tracksContextMenu = new Menu();
      this.tracksContextMenu.append(new MenuItem({
        label: 'Open file in folder',
        click() {
          const trackId = parseInt(vm.firstSelectedElement.getAttribute('data-id'), 10);
          const track = vm.tracks.find(t => t.id === trackId);
          const url = track.path;
          shell.openItem(url.substring(0, url.lastIndexOf('/')));
        },
      }));
    },
    openTracksContextMenu(event) {
      this.firstSelectedElement = event.target;
      this.secondSelectedElement = event.target;
      this.tracksContextMenu.popup(remote.getCurrentWindow());
    },
    sortBy(key) {
      if (this.resizing) {
        this.resizing = false;
        return;
      }
      if (this.sortKey === key) {
        const columnToUpdate = this.columns.find(c => c.id === key);
        this.invertOrder(columnToUpdate.id);
      }
      this.sortKey = key;
    },
    onMouseMove(e) {
      if (!this.startX) {
        return;
      }
      this.endX = e.pageX;
      this.diffX = this.endX - this.startX;
      this.updateColumnSize({ columnId: this.columnId, diffX: this.diffX });
      this.startX = this.endX;
    },
    onMouseUp() {
      this.saveColumnSize({ columns: this.columns });
      this.startX = null;
      this.endX = null;
      this.diffX = null;
    },
    startResizing(event) {
      this.resizing = true;
      event.preventDefault();
      event.stopPropagation();
      this.startX = event.pageX;
      this.columnId = event.target.parentNode.id;
    },
    watchFolderFlattening() {
      ipcRenderer.on('folder:start_flattening', () => {
        this.updateFlatteningStatus({ flattening: true });
        this.$modal.show('flattening-folder-progress-modal');
      });
      ipcRenderer.on('file:copied', (event, { countFiles, countCopiedFiles }) => {
        this.updateCopiedFilesCount({ countFiles, countCopiedFiles });
        if (countFiles === countCopiedFiles) {
          this.updateFlatteningStatus({ flattening: false });
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
  @import 'styles/_vars.scss';

  .main-window {
    margin-top: 130px;
    overflow: hidden;
    line-height: 2;
  }

  .searchbar {
    position: fixed;
    padding-left: 20px;
    z-index: 1;
  }

  #search {
    background-color: $moreBlack;
    color: $mainColor;
    border-color: #6c757d;
    &:hover {
      border-color: #545B62;
    }
  }

  input.form-control {
    margin-top: -8px;
    height: 30px;
  }

  table {
    width: 100%;
    margin-top: 60px;
    position: relative;

    thead, tbody {
      display: block;
    }
    tbody {
      overflow-y: scroll;
    }
  }

  thead tr {
    background-color: $grey;
  }

  tbody tr {
    display: block;
    color: rgba($white, 0.8);
    border-top: 1px solid $moreBlack;
    &.selected {
      background-color: rgba($mainColor, 0.5);
    }
    &:focus {
      box-shadow: none;
    }
  }

  tr {
    td, th {
      padding-left: 20px;
    }
    td:last-of-type {
      padding-right: 20px;
    }
  }

  td, th {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    opacity: 0.66;
    position: relative;

    .column-name {
      user-select: none;
    }

    .resize {
      width: 5px;
      right: 0px;
      top: 0px;
      height: 100%;
      position:absolute;
      user-select: none;
      cursor: col-resize;
      &:hover {
        background-color: rgba($mainColor, 0.5);
      }
    }

    .reorder {
      width: 30px;
      top: 0px;
      height: 100%;
      position: absolute;
      z-index: -1;

      &.reorder-before {
        left: 0px;
        &.dragover {
          border-left: 1px solid rgba($mainColor, 0.5);
          z-index: 10;
        }
      }
      &.reorder-after {
        right: 0px;
        &.dragover {
          border-right: 1px solid rgba($mainColor, 0.5);
          z-index: 10;
        }
      }
    }

    &.selected {
      background-color: rgba($mainColor, 0.5);
    }
  }

  th.active {
    opacity: 1;
    .arrow {
      opacity: 1;
    }
  }

  .arrow {
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    margin-left: 5px;
    opacity: 0.66;
  }

  .arrow.asc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid $white;
  }

  .arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid $white;
  }
</style>
