const { app, BrowserWindow, Cookies, electron} = require('electron')
const path = require('path')
require('electron-reload')(__dirname);

function createWindow () {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,      
        contextIsolation: false,
        enableRemoteModule: true,
        preload: path.join(__dirname, 'scripts/preload.js')
      }
    })
    win.setMenuBarVisibility(false)
    win.setAutoHideMenuBar(true)
    win.loadFile('pages/index.html')
    const ses = win.webContents.session
    ses.clearStorageData([Cookies])
  }

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})