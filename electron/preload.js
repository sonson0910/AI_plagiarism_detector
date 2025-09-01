const { contextBridge, ipcRenderer } = require('electron');

// Phơi bày một API an toàn ra môi trường của trang web (renderer process)
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key')
});
