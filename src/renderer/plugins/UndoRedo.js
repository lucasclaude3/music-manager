class UndoRedoHistory {
  store;
  history = [];
  currentIndex = -1;

  init(store) {
    this.store = store;
  }

  addState(state) {
    // Remove redo steps after several undos
    if (this.currentIndex + 1 < this.history.length) {
      this.history.splice(this.currentIndex + 1);
    }
    this.history.push(state);
    this.currentIndex += 1;
  }

  undo() {
    if (this.currentIndex - 1 < 0) {
      return;
    }
    const prevState = this.history[this.currentIndex - 1];
    const stateCopy = JSON.parse(JSON.stringify(prevState));
    this.store.replaceState(stateCopy);
    this.currentIndex -= 1;
  }

  redo() {
    if (this.currentIndex + 1 >= this.history.length) {
      return;
    }
    const nextState = this.history[this.currentIndex + 1];
    const stateCopy = JSON.parse(JSON.stringify(nextState));
    this.store.replaceState(stateCopy);
    this.currentIndex += 1;
  }
}

export default () => {
  const undoRedoHistory = new UndoRedoHistory();

  const plugin = (store) => {
    undoRedoHistory.init(store);
    const stateCopy = JSON.parse(JSON.stringify(store.state));
    undoRedoHistory.addState(stateCopy);

    store.subscribe((mutation, state) => {
      const stateCopy = JSON.parse(JSON.stringify(state));
      undoRedoHistory.addState(stateCopy);
    });
  };

  return { plugin, undoRedoHistory };
};
