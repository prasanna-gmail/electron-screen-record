// Access information about media sources that can be used to capture audio
// and video from the desktop using the navigator.mediaDevices.getUserMedia API.
//
// For more info, see:
// https://electronjs.org/docs/api/desktop-capturer

const { app, BrowserWindow, desktopCapturer, screen } = require('electron')
const path = require('path')
let mainWindow
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 600,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools({ mode: 'detach' })
  setTimeout(startCapture, 1000)
})

function startCapture() {
  let allDisp = screen.getAllDisplays()
  desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {
    for (const source of sources) {

      allDisp.forEach((sc, k) => {
        if (source.display_id == sc.id) {

          mainWindow.webContents.send('SET_SOURCE', source.id, sc.scaleFactor, sc.size)

        }

      })
    }
  })
}