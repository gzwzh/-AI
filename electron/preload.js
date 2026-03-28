const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkUpdate: (software, version) => ipcRenderer.invoke('check-update', software, version),
  startUpdate: (updateInfo) => ipcRenderer.invoke('start-update', updateInfo),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  request: (options) => ipcRenderer.invoke('http-request', options),
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
})
