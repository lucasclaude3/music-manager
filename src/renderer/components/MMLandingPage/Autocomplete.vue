<template>
  <div class="autocomplete">
    <label :for="id">{{label}}</label>
    <textarea
      v-if="textarea"
      v-model="inputValue"
      :id="id"
      :rows="rows"
      :cols="cols"
      :placeholder="placeholder"
      @focusout="focusout"
      @focus="focus"
      @keydown.13="chooseItem"
      @keydown.tab="chooseItem"
      @keydown.40="moveDown"
      @keydown.38="moveUp"
      type="text"
      class="autocomplete-input"></textarea>
    <input
      v-else
      v-model="inputValue"
      :id="id"
      :placeholder="placeholder"
      @focusout="focusout"
      @focus="focus"
      @keydown.13="chooseItem"
      @keydown.tab="chooseItem"
      @keydown.40="moveDown"
      @keydown.38="moveUp"
      @keyup.enter="submit"
      type="text"
      class="autocomplete-input">
    <ul v-if="searchMatch.length > 0" :class="{'autocomplete-list': true, [id+'-list']: true}">
      <li
        @click="selectItem(index), chooseItem()"
        v-for="(result, index) in searchMatch"
        v-html="highlightWord(result)"
        v-bind:key="index"
        :class="{active: selectedIndex === index}"></li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

/* eslint-disable */
// Thanks: https://github.com/component/textarea-caret-position
(function(){function e(b,e,f){if(!h)throw Error("textarea-caret-position#getCaretCoordinates should only be called in a browser");if(f=f&&f.debug||!1){var a=document.querySelector("#input-textarea-caret-position-mirror-div");a&&a.parentNode.removeChild(a)}a=document.createElement("div");a.id="input-textarea-caret-position-mirror-div";document.body.appendChild(a);var c=a.style,d=window.getComputedStyle?window.getComputedStyle(b):b.currentStyle,k="INPUT"===b.nodeName;c.whiteSpace="pre-wrap";k||(c.wordWrap=
"break-word");c.position="absolute";f||(c.visibility="hidden");l.forEach(function(a){k&&"lineHeight"===a?c.lineHeight=d.height:c[a]=d[a]});m?b.scrollHeight>parseInt(d.height)&&(c.overflowY="scroll"):c.overflow="hidden";a.textContent=b.value.substring(0,e);k&&(a.textContent=a.textContent.replace(/\s/g,"\u00a0"));var g=document.createElement("span");g.textContent=b.value.substring(e)||".";a.appendChild(g);b={top:g.offsetTop+parseInt(d.borderTopWidth),left:g.offsetLeft+parseInt(d.borderLeftWidth),height:parseInt(d.lineHeight)};
f?g.style.backgroundColor="#aaa":document.body.removeChild(a);return b}var l="direction boxSizing width height overflowX overflowY borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth borderStyle paddingTop paddingRight paddingBottom paddingLeft fontStyle fontVariant fontWeight fontStretch fontSize fontSizeAdjust lineHeight fontFamily textAlign textTransform textIndent textDecoration letterSpacing wordSpacing tabSize MozTabSize".split(" "),h="undefined"!==typeof window,m=h&&null!=window.mozInnerScreenX;
"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=e:h&&(window.getCaretCoordinates=e)})();
/* eslint-enable */

export default {
  name: 'autocomplete',
  props: ['items', 'placeholder', 'label', 'textarea', 'rows', 'cols'],
  data() {
    return {
      id: `input-${parseInt(Math.random() * 1000, 10)}`,
      inputValue: '',
      searchMatch: [],
      selectedIndex: 0,
      clickedChooseItem: false,
      wordIndex: 0,
    };
  },
  mounted() {
    const self = this;
    this.loadTags();
    document.querySelector(`#${this.id}`)
      .addEventListener('input', () => {
        const caret = window.getCaretCoordinates(this, this.selectionEnd);

        if (self.searchMatch.length > 0) {
          const element = document.querySelectorAll(`.${self.id}-list`);

          if (element[0]) {
            element[0].style.top = `${caret.top + 40}px`;
            element[0].style.left = `${caret.left}px`;
          }
        }
      });
  },
  computed: {
    listToSearch() {
      if (typeof this.items !== 'undefined' && this.items.length > 0) {
        return this.items;
      }
      return this.tags;
    },
    currentWord() {
      return this.inputValue.replace(/(\r\n|\n|\r)/gm, ' ').split(' ')[this.wordIndex];
    },
    inputSplitted() {
      return this.inputValue.replace(/(\r\n|\n|\r)/gm, ' ').split(' ');
    },
    ...mapState('Autocomplete', ['tags']),
  },
  watch: {
    inputValue() {
      this.focus();
      this.selectedIndex = 0;
      this.wordIndex = this.inputSplitted.length - 1;
    },
  },
  methods: {
    highlightWord(word) {
      const regex = new RegExp(`(${this.currentWord})`, 'g');
      return word.replace(regex, '<mark>$1</mark>');
    },
    setWord(word) {
      const currentWords = this.inputValue.replace(/(\r\n|\n|\r)/gm, '__br__ ').split(' ');
      currentWords[this.wordIndex] = currentWords[this.wordIndex].replace(this.currentWord, `${word} `);
      this.wordIndex += 1;
      this.inputValue = currentWords.join(' ').replace(/__br__\s/g, '\n');
    },
    moveDown() {
      if (this.selectedIndex < this.searchMatch.length - 1) {
        this.selectedIndex += 1;
      }
    },
    moveUp() {
      if (this.selectedIndex !== -1) {
        this.selectedIndex -= 1;
      }
    },
    selectItem(index) {
      this.selectedIndex = index;
      this.chooseItem();
    },
    chooseItem(e) {
      this.clickedChooseItem = true;

      if (this.selectedIndex !== -1 && this.searchMatch.length > 0) {
        if (e) {
          e.preventDefault();
        }
        this.setWord(this.searchMatch[this.selectedIndex]);
        this.selectedIndex = -1;
      }
    },
    focusout() {
      setTimeout(() => {
        if (!this.clickedChooseItem) {
          this.searchMatch = [];
          this.selectedIndex = -1;
        }
        this.clickedChooseItem = false;
      }, 100);
    },
    focus() {
      this.searchMatch = [];
      if (this.currentWord !== '') {
        this.searchMatch = this.listToSearch.filter(el => el.indexOf(this.currentWord) >= 0);
      }
      if (
        this.searchMatch.length === 1 &&
          this.currentWord === this.searchMatch[0]
      ) {
        this.searchMatch = [];
      }
    },
    submit() {
      this.createTag(this.currentWord);
    },
    ...mapActions({
      createTag: 'Autocomplete/createTag',
      loadTags: 'Autocomplete/loadTags',
    }),
  },
};
</script>
