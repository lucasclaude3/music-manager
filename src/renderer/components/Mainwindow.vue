<template>
  <div class="main-window">
    <b-button
      v-if="currentTag !== null"
      @click="applyCurrentTag()"
    >Apply current Tag {{ currentTag.name }}</b-button>
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
            {{ key | capitalize }}
            <span class="arrow" :class="columns[key].sortOrder > 0 ? 'asc' : 'dsc'">
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="table-scroll">
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
          v-bind:class="{ selected: firstSelectedElement
                                  && track.index >= parseInt(firstSelectedElement.id, 10)
                                  && track.index <= parseInt(secondSelectedElement.id, 10) }"
        >
          <td class="no-pointer-events"
            v-for="key in Object.keys(columns)"
            v-bind:key="key"
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
      name: { size: 450, sortOrder: 1 },
      genre: { size: 150, sortOrder: 1 },
      shortComment: { size: 200, sortOrder: 1 },
    };

    return {
      searchTerms: '',
      firstSelectedElement: null,
      secondSelectedElement: null,
      columns,
      sortKey: '',
    };
  },
  mounted() {
    this.loadTracks();
    this.watchTrackAddition();
    this.watchTrackModification();
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
      applyCurrentTag: 'tags/applyCurrentTag',
      launchTrack: 'tracks/launchTrack',
      searchTrack: 'tracks/searchTrack',
    }),
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

<style lang="scss" scoped>
  .main-window {
    margin-left: 250px;
    padding-left: 20px;
  }

  .searchbar {
    position: fixed;
    z-index: 1;
  }

  table {
    margin-top: 100px;
    position: relative;

    thead, tbody {
      display: block;
    }
    tbody {
      max-height: 300px;
      overflow-y: scroll;
    }
  }

  thead tr {
    background-color: rgba(95, 158, 160, 0.2);
    border-bottom: 1px solid rgba(0, 0, 0, 0.66);
  }

  tbody tr {
    display: block;
    color: #000;
    &:nth-child(even) {
      background-color: rgba(95, 158, 160, 0.2);
    }
    &:nth-child(odd) {
      background-color: white;
    }
    &.selected {
      background-color: rgba(95, 158, 160, 0.66);
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
    border-bottom: 4px solid #000;
  }

  .arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #000;
  }
</style>
