const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  listGameSaves: () => ipcRenderer.invoke('list-game-saves'),

  saveNamedGameFile: (saveName, saveFile) =>
    ipcRenderer.invoke('save-named-game-file', saveName, saveFile),

  openNamedGameFile: (fileName) =>
    ipcRenderer.invoke('open-named-game-file', fileName),

  deleteNamedGameFile: (fileName) =>
    ipcRenderer.invoke('delete-named-game-file', fileName),
});