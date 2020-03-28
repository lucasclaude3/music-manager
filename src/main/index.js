import { app, BrowserWindow, ipcMain } from 'electron' // eslint-disable-line
import Store from 'electron-store';
import { Promise } from 'bluebird';
import NodeID3 from 'node-id3';
import BulkSearch from 'bulksearch';


const readMetadata = filepath =>
  new Promise((resolve, reject) => {
    NodeID3.read(filepath, (err, tags) => {
      if (err) {
        reject(err);
      }
      resolve(tags);
    });
  });

const writeMetadata = (filepath, tags) =>
  new Promise((resolve, reject) => {
    NodeID3.update(tags, filepath, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

const store = new Store();
// store.clear();
const mainIndex = new BulkSearch();
const tracks = store.get('tracks') || [];
tracks.forEach((t) => {
  mainIndex.add(t.id, t.name);
});

const autoId = (() => {
  let seed = store.get('seed') || 0;
  return () => {
    seed += 1;
    store.set({ seed });
    return seed;
  };
})();

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    height: 563,
    useContentSize: true,
    width: 1000,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

ipcMain.on('tag:create', () => {
  const tags = store.get('tags') || [];
  const newTag = {
    id: autoId(),
    name: `New tag ${tags.length + 1}`,
    created_at: Date.now(),
    order: tags.length + 1,
  };
  tags.push(newTag);
  store.set({ tags });
  mainWindow.webContents.send('tag:created', newTag);
});

ipcMain.on('tag:update', (event, updatedTag) => {
  const tags = (store.get('tags') || []).filter(t => t.id !== updatedTag.id);
  tags.push(updatedTag);
  store.set({ tags });
  mainWindow.webContents.send('tag:updated', updatedTag);
});

ipcMain.on('tag:delete', (event, deletedTag) => {
  const tags = (store.get('tags') || []).filter(t => t.id !== deletedTag.id);
  store.set({ tags });
  mainWindow.webContents.send('tag:deleted', deletedTag);
});

ipcMain.on('tags:load', () => {
  mainWindow.webContents.send('tags:loaded', store.get('tags') || []);
});

const updateTrack = (trackId, trackFields) => {
  const tracks = (store.get('tracks') || []).filter(t => t.id !== trackId);
  let modifiedTrack = store.get('tracks').find(t => t.id === trackId);
  modifiedTrack = { ...modifiedTrack, ...trackFields };
  tracks.push(modifiedTrack);
  store.set({ tracks });
};

ipcMain.on('tracks:add', (event, files) => {
  const filteredFiles = files
    .filter(f => f.type.includes('audio') && f.type !== 'audio/mpegurl')
    .map((f) => {
      const newFields = {
        id: autoId(),
        created_at: Date.now(),
        tagBag: [],
      };
      return { ...f, ...newFields };
    });
  Promise.map(
    filteredFiles,
    f => readMetadata(f.path)
      .then((data) => {
        f.genre = data ? data.genre : '';
        updateTrack(f.id, { genre: f.genre });
        mainWindow.webContents.send('track:updated', f);
        return Promise.resolve();
      })
      .catch((err) => {
        console.log(err);
      }),
    { concurrency: 5 },
  );
  const tracks = (store.get('tracks') || []).concat(filteredFiles);
  store.set({ tracks });

  tracks.forEach((t) => {
    mainIndex.add(t.id, t.name);
  });
  store.set({ mainIndex });

  mainWindow.webContents.send('tracks:added', filteredFiles);
});

ipcMain.on('tracks:load', (event, tagId) => {
  let tracks = store.get('tracks') || [];
  if (tagId) {
    tracks = tracks.filter(t => t.tagBag.indexOf(tagId) > -1);
  }
  mainWindow.webContents.send('tracks:loaded', tracks);
});

ipcMain.on('track:add_tag', (event, { tagId, trackId }) => {
  const tracks = (store.get('tracks') || []).filter(t => t.id !== parseInt(trackId, 10));
  const modifiedTrack = store.get('tracks').find(t => t.id === parseInt(trackId, 10));
  modifiedTrack.tagBag.push(parseInt(tagId, 10));
  tracks.push(modifiedTrack);
  store.set({ tracks });
  mainWindow.webContents.send('track:tag_added', modifiedTrack);
});

ipcMain.on('tags:applyToMetadata', (event, currentTag) => {
  const tracks = (store.get('tracks') || []).filter(t => t.tagBag.indexOf(currentTag.id) > -1);
  Promise.map(
    tracks,
    (t) => {
      t.comment = currentTag.name;
      updateTrack(t.id, { comment: currentTag.name });
      mainWindow.webContents.send('track:updated', t);
      return writeMetadata(t.path, {
        comment: {
          language: 'eng',
          text: currentTag.name,
        },
      });
    },
    { concurrency: 5 },
  );
});

ipcMain.on('track:search', (event, { searchTerms, tag }) => {
  let tracks = (store.get('tracks') || []);
  if (searchTerms.length > 0) {
    const tracksIds = mainIndex.search(searchTerms);
    tracks = tracks
      .filter(t => tracksIds.indexOf(t.id) > -1 && (!tag || t.tagBag.indexOf(tag.id) > -1));
  }
  mainWindow.webContents.send('tracks:loaded', tracks);
});
