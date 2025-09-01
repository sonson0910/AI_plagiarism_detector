const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../assets/icon.png') // Giả sử bạn có icon
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Mở DevTools.
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Cung cấp API Key từ biến môi trường của main process
  ipcMain.handle('get-api-key', () => process.env.GEMINI_API_KEY || process.env.API_KEY);

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
