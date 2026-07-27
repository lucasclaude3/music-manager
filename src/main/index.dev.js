/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// NOTE: vue-devtools auto-install disabled. electron-devtools-installer
// pulls the latest Vue Devtools extension (now Manifest V3), which is
// incompatible with this project's Electron 22 (too old to load MV3
// extensions) and crashes the entire renderer sandbox, leaving no window.

// Require `main` process to boot app
require('./index')