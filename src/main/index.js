import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron' // eslint-disable-line
import Store from 'electron-store';
import { Promise } from 'bluebird';
import NodeID3 from 'node-id3';
import BulkSearch from 'bulksearch';
import fs from 'fs';
import path from 'path';
import mime from 'mime-type/with-db';

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

const readDir = Promise.promisify(fs.readdir);
const stat = Promise.promisify(fs.stat);
const moveFile = Promise.promisify(fs.rename);

const store = new Store();
// store.clear();

const tags = store.get('tags') || [];
const tracks = store.get('tracks') || [];
const mainIndex = new BulkSearch();
tracks.forEach((t) => {
  mainIndex.add(t.id, t.name);
});
store.set({ tracks, tags });

const columns = store.get('columns') || [
  {
    id: 'name', size: 450, revColOrder: 3, sortOrder: 1, trad: 'name', visible: true,
  },
  {
    id: 'genre', size: 150, revColOrder: 2, sortOrder: 1, trad: 'genre', visible: true,
  },
  {
    id: 'shortComment', size: null, revColOrder: 1, sortOrder: 1, trad: 'comment', visible: true,
  },
  {
    id: 'createdAt', size: null, revColOrder: null, sortOrder: 1, trad: 'added_at', visible: false,
  },
];
store.set({ columns });

const autoId = (() => {
  let seed = store.get('seed') || 0;
  return () => {
    seed += 1;
    store.set({ seed });
    return seed;
  };
})();

const analyzeDirectory = async (dir) => {
  const subdirs = await readDir(dir);
  const files = await Promise.map(
    subdirs,
    async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? analyzeDirectory(res) : res;
    },
  );
  return files.reduce((a, f) => a.concat(f), []);
};

const flattenFolder = async (dir) => {
  const files = await analyzeDirectory(dir);
  Promise.map(
    files,
    async file => moveFile(file, path.join(dir, path.basename(file))),
  );
};

const analyzePaths = dirs => Promise
  .map(
    dirs,
    dir => analyzeDirectory(dir),
    { concurrency: 5 },
  );

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9081'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1100,
    minWidth: 1100,
    height: 600,
    minHeight: 600,
    useContentSize: true,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const parseComment = comment => comment.replace('[Custom Tags]', '').trim();

const updateTrack = (trackId, trackFields) => {
  const tracks = store.get('tracks').filter(t => t.id !== trackId);
  let modifiedTrack = store.get('tracks').find(t => t.id === trackId);
  modifiedTrack = { ...modifiedTrack, ...trackFields };
  tracks.push(modifiedTrack);
  store.set({ tracks });
  return modifiedTrack;
};

const addTracks = (filepaths) => {
  const oldPaths = store.get('tracks').map(f => f.path);
  const filteredFiles = filepaths
    .filter((filepath) => {
      const mimeType = mime.lookup(filepath);
      return mimeType && mimeType.includes('audio') && mimeType !== 'audio/mpegurl';
    })
    .filter(filepath => oldPaths.indexOf(filepath) === -1)
    .map(filepath => ({
      path: filepath,
      name: path.basename(filepath),
      type: mime.lookup(filepath),
      id: autoId(),
      created_at: Date.now(),
      tagBag: [],
    }));

  Promise.map(
    filteredFiles,
    t => readMetadata(t.path)
      .then((data) => {
        if (!data) {
          return Promise.reject(new Error('No metadata found'));
        }
        const modifiedTrack = updateTrack(t.id, {
          genre: data.genre,
          shortComment: data.comment && parseComment(data.comment.text),
          metadataComment: data.comment && data.comment.text,
        });
        mainWindow.webContents.send('track:updated', modifiedTrack);
        return Promise.resolve();
      })
      .catch((err) => {
        console.log(err);
      }),
    { concurrency: 5 },
  );
  const tracks = store.get('tracks').concat(filteredFiles);
  store.set({ tracks });

  tracks.forEach((t) => {
    mainIndex.add(t.id, t.name);
  });
  store.set({ mainIndex });

  mainWindow.webContents.send('tracks:added', filteredFiles);
};

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
  const tags = store.get('tags');
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
  const tags = store.get('tags').filter(t => t.id !== updatedTag.id);
  tags.push(updatedTag);
  store.set({ tags });
  mainWindow.webContents.send('tag:updated', updatedTag);
});

ipcMain.on('tag:delete', (event, deletedTag) => {
  const tags = store.get('tags').filter(t => t.id !== deletedTag.id);
  store.set({ tags });
  mainWindow.webContents.send('tag:deleted', deletedTag);

  const tracks = store.get('tracks');
  tracks.forEach((track) => {
    const idx = track.tagBag.indexOf(deletedTag.id);
    if (idx > -1) {
      track.tagBag.splice(idx, 1);
      mainWindow.webContents.send('track:updated', track);
    }
  });
  store.set({ tracks });
});

ipcMain.on('tags:load', () => {
  mainWindow.webContents.send('tags:loaded', store.get('tags'));
});

ipcMain.on('tracks:load', (event, tagId) => {
  let tracks = store.get('tracks') || [];
  if (tagId) {
    tracks = tracks.filter(t => t.tagBag.indexOf(tagId) > -1);
  }
  mainWindow.webContents.send('tracks:loaded', tracks);
});

ipcMain.on('tracks:addTag', (event, { tagId, trackIds }) => {
  const unmodifiedTracks = store.get('tracks').filter(t => trackIds.indexOf(t.id) === -1);
  const modifiedTracks = store.get('tracks').filter(t => trackIds.indexOf(t.id) > -1);
  modifiedTracks.forEach((track) => {
    if (track.tagBag.indexOf(parseInt(tagId, 10)) === -1) {
      track.tagBag.push(parseInt(tagId, 10));
    }
    mainWindow.webContents.send('track:tagsAdded', track);
  });
  store.set({ tracks: unmodifiedTracks.concat(modifiedTracks) });
});

ipcMain.on('tag:applyToMetadata', (event, currentTag) => {
  const tracks = store.get('tracks').filter(t => t.tagBag.indexOf(currentTag.id) > -1);
  Promise.map(
    tracks,
    (t) => {
      let comments = [];
      if (!t.metadataComment || t.metadataComment.indexOf('[Custom Tags]') !== 0) {
        comments = [currentTag.name.trim()];
      } else {
        const previousList = parseComment(t.metadataComment);
        comments = previousList.split(' - ').map(c => c.trim());
        if (comments.indexOf(currentTag.name.trim()) === -1) {
          comments.push(currentTag.name.trim());
        }
      }
      const modifiedTrack = updateTrack(t.id, {
        shortComment: comments.join(' - '),
        metadataComment: `[Custom Tags] ${comments.join(' - ')}`,
      });
      mainWindow.webContents.send('track:updated', modifiedTrack);
      return writeMetadata(t.path, {
        comment: {
          language: 'eng',
          text: `[Custom Tags] ${comments.join(' - ')}`,
        },
      });
    },
    { concurrency: 5 },
  );
});

ipcMain.on('tracks:clearAllMetadata', () => {
  const tracks = store.get('tracks');
  Promise.map(
    tracks,
    (track) => {
      const tagNames = [];
      track.tagBag.forEach((tagId) => {
        const tag = tags.find(tagObj => tagObj.id === tagId);
        tagNames.push(tag.name);
      });
      const modifiedTrack = updateTrack(track.id, {
        shortComment: '',
        metadataComment: '',
      });
      mainWindow.webContents.send('track:updated', modifiedTrack);
      return writeMetadata(track.path, {
        comment: {
          language: 'eng',
          text: '',
        },
      });
    },
    { concurrency: 5 },
  );
});

ipcMain.on('tracks:analyzeComments', () => {
  const tracksWithUnprocessedTags = store.get('tracks')
    .filter(t => t.metadataComment && t.metadataComment.indexOf('[Custom Tags]') === 0);
  if (tracksWithUnprocessedTags.length === 0) {
    mainWindow.webContents.send('tracks:analyzed', []);
    return;
  }
  const tagNames = store.get('tags').map(t => t.name);
  const unprocessedTagsArrays = tracksWithUnprocessedTags.map(c => parseComment(c.metadataComment).split(' - '));
  let unprocessedTags = Array.concat.apply([], unprocessedTagsArrays)
    .map(ut => ut.trim())
    .filter(ut => tagNames.indexOf(ut) === -1);
  unprocessedTags = unprocessedTags.filter((t, pos) => unprocessedTags.indexOf(t) === pos);
  mainWindow.webContents.send('tracks:analyzed', unprocessedTags);
});

ipcMain.on('tracks:applyTags', (event, comments) => {
  let tags = store.get('tags');
  const tagNames = tags.map(t => t.name);
  const newTags = comments
    .filter(c => tagNames.indexOf(c.modifiedComment.trim()) === -1)
    .map((c, idx) => ({
      id: autoId(),
      name: c.modifiedComment.trim(),
      created_at: Date.now(),
      order: tags.length + idx + 1,
    }));
  tags = tags.concat(newTags);
  store.set({ tags });
  mainWindow.webContents.send('tags:created', newTags);

  const tracksWithoutCustomTags = store.get('tracks')
    .filter(t => !t.metadataComment || t.metadataComment.indexOf('[Custom Tags]') !== 0);
  const tracksWithCustomTags = store.get('tracks')
    .filter(t => t.metadataComment && t.metadataComment.indexOf('[Custom Tags]') === 0);

  tracksWithCustomTags.forEach((track) => {
    comments.forEach((c) => {
      if (track.metadataComment.indexOf(c.originalComment) > -1) {
        const newTag = tags.find(tag => tag.name === c.modifiedComment);
        if (track.tagBag.indexOf(newTag.id) === -1) {
          track.tagBag.push(newTag.id);
        }
      }
    });
    mainWindow.webContents.send('track:tagsAdded', track);
  });
  store.set({ tracks: tracksWithoutCustomTags.concat(tracksWithCustomTags) });

  Promise.map(
    tracksWithCustomTags,
    (track) => {
      const tagNames = [];
      track.tagBag.forEach((tagId) => {
        const tag = tags.find(tagObj => tagObj.id === tagId);
        tagNames.push(tag.name);
      });
      const shortComment = tagNames.join(' - ');
      const modifiedTrack = updateTrack(track.id, {
        shortComment,
        metadataComment: `[Custom Tags] ${shortComment}`,
      });
      mainWindow.webContents.send('track:updated', modifiedTrack);
      return writeMetadata(track.path, {
        comment: {
          language: 'eng',
          text: `[Custom Tags] ${shortComment}`,
        },
      });
    },
    { concurrency: 5 },
  ).then(() => {
    mainWindow.webContents.send('tracks:tagsAppliedSuccessfully');
  });
});

ipcMain.on('track:search', (event, { searchTerms, tag }) => {
  let tracks = store.get('tracks');
  if (searchTerms.length > 0) {
    const trackIds = mainIndex.search(searchTerms);
    tracks = tracks
      .filter(t => trackIds.indexOf(t.id) > -1 && (!tag || t.tagBag.indexOf(tag.id) > -1));
  }
  mainWindow.webContents.send('tracks:loaded', tracks);
});

ipcMain.on('tracks:remove', (event, { trackIds, tag }) => {
  let remainingTracks = store.get('tracks').filter(t => trackIds.indexOf(t.id) === -1);
  const removedTracks = store.get('tracks').filter(t => trackIds.indexOf(t.id) > -1);
  if (tag) {
    removedTracks.forEach((track) => {
      const idx = track.tagBag.indexOf(tag.id);
      if (idx > -1) {
        track.tagBag.splice(idx, 1);
      }
    });
    remainingTracks = remainingTracks.concat(removedTracks);
  }
  store.set({ tracks: remainingTracks });
  mainWindow.webContents.send('tracks:loaded', remainingTracks);
});

ipcMain.on('columns:load', () => {
  const columns = store.get('columns').filter(c => c.visible);
  mainWindow.webContents.send('columns:loaded', columns);
});

ipcMain.on('columns:load_all', () => {
  const columns = store.get('columns');
  mainWindow.webContents.send('columns:loaded_all', columns);
});

ipcMain.on('columns:invert_order', (event, columnId) => {
  const columns = store.get('columns');
  columns.forEach((c) => {
    if (c.id === columnId) {
      c.sortOrder *= -1;
    }
  });
  store.set({ columns });
  mainWindow.webContents.send('columns:loaded', columns.filter(c => c.visible));
});

ipcMain.on('columns:update', (event, { columns }) => {
  store.set({ columns });
  mainWindow.webContents.send('columns:loaded', columns.filter(c => c.visible));
});

const menuTemplate = [
  {
    label: '',
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Import',
        submenu: [
          {
            label: 'Import Track',
            click() {
              dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'multiSelections'] })
                .then(result => addTracks(result.filePaths));
            },
          },
          {
            label: 'Import Folder',
            accelerator: 'Command+O',
            click() {
              dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'multiSelections'] })
                .then(result => analyzePaths(result.filePaths))
                .then(filepathsArrays => addTracks(Array.concat.apply([], filepathsArrays)));
            },
          },
        ],
      },
      {
        label: 'Flatten Folder',
        click() {
          dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
            .then(result => flattenFolder(result.filePaths[0]));
        },
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        },
      },
    ],
  },
];

const mainMenu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(mainMenu);
