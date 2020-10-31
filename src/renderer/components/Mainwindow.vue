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
      <thead>
        <tr>
          <th
            v-for="key in Object.keys(columns)"
            v-bind:key="key"
            @click="sortBy(key)"
            :class="{ active: sortKey == key }"
            :style="{ 'max-width': `${columns[key].size}px`, 'min-width': `${columns[key].size}px`}"
          >
            {{ columns[key].trad | capitalize }}
            <span class="arrow" :class="columns[key].sortOrder > 0 ? 'asc' : 'dsc'">
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
          v-bind:key="track.id"
          v-bind:id="track.index"
          tabindex="0"
          draggable="true"
          @dragstart="handleDragTrack"
          @dblclick="() => launchTrack(track)"
          @click.exact="handleFocus"
          @click.shift="handleFocusShift"
          @blur="handleBlur"
          :class="{ selected: firstSelectedElement
                           && track.index >= parseInt(firstSelectedElement.id, 10)
                           && track.index <= parseInt(secondSelectedElement.id, 10) }"
        >
          <td
            v-for="key in Object.keys(columns)"
            v-bind:key="key"
            class="no-pointer-events"
            :style="{ 'max-width': `${columns[key].size}px`, 'min-width': `${columns[key].size}px`}"
          >
            <span>{{track[key]}}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'MainWindow',
  data() {
    const columns = {
      name: { size: 450, sortOrder: 1, trad: 'name' },
      genre: { size: 150, sortOrder: 1, trad: 'genre' },
      shortComment: { size: window.innerWidth, sortOrder: 1, trad: 'comment' },
    };

    return {
      searchTerms: '',
      firstSelectedElement: null,
      secondSelectedElement: null,
      columns,
      sortKey: '',
      winHeight: window.innerHeight,
      winWidth: window.innerWidth,
    };
  },
  mounted() {
    this.loadTracks();
    this.watchTrackAddition();
    this.watchTrackModification();
    window.addEventListener('resize', () => {
      this.winHeight = window.innerHeight;
      this.winWidth = window.innerWidth;
    });
  },
  computed: {
    ...mapState('tracks', ['tracks']),
    ...mapState('tags', ['currentTag']),
    orderedTracks() {
      const { sortKey } = this;
      const order = (this.columns[sortKey] && this.columns[sortKey].sortOrder) || 1;
      const tmpTracks = [...this.tracks]
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
  filters: {
    capitalize: str => str.charAt(0).toUpperCase() + str.slice(1),
  },
  methods: {
    ...mapActions({
      loadTracks: 'tracks/loadTracks',
      watchTrackAddition: 'tracks/watchTrackAddition',
      watchTrackModification: 'tracks/watchTrackModification',
      launchTrack: 'tracks/launchTrack',
      searchTrack: 'tracks/searchTrack',
      removeTracksFromList: 'tracks/removeTracksFromList',
    }),
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
    sortBy(key) {
      this.sortKey = key;
      this.columns[key].sortOrder *= -1;
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
