// Access information about media sources that can be used to capture audio
// and video from the desktop using the navigator.mediaDevices.getUserMedia API.
//
// For more info, see:
// https://electronjs.org/docs/api/desktop-capturer

const { ipcMain, app, BrowserWindow, desktopCapturer, screen, dialog } = require('electron')
console.log("pkp:  ~ file: main.js:8 ~ dialog", dialog)
const path = require('path')
let mainWindow
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    height: 1800,
    width: 1000,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools({ mode: 'right' })
  setTimeout(startCapture, 1000)
})

/**
   * Handle all events like min max exit
   */

// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

const { writeFile } = require('fs');
// Saves the video file on stop
async function handleStop(event, buffer) {
  console.log("pkp:  ~ file: main.js:38 ~ handleStop ~ event", event)

  // const { filePath } = await dialog.showSaveDialog({
  //   buttonLabel: 'Save video',
  //   defaultPath: `vid-${Date.now()}.webm`
  // });

  // if (filePath) {
  //   writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  // }


  var filePath = `/Users/tce_admin/Documents/videos/` + `vid-${Date.now()}.webm`;
  writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  console.log("pkp:  ~ file: main.js:54 ~ handleStop ~ filePath", filePath)

}

// Get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source)
      };
    })
  );
  videoOptionsMenu.popup();
}

ipcMain.on("onEvent", (event, message) => {
  console.log("pkp:  ~ file: main.js:51 ~ ipcMain.on ~ message", message)

  if (message && message.msg == "stopRecord") {
    console.log("pkp:  ~ file: main.js:34 ~ ipcMain.on ~ message", message)
    handleStop(event, message.buffer)
  } else if (message && message.msg == "stopRecord") {
    console.log("pkp:  ~ file: main.js:34 ~ ipcMain.on ~ message", message)
    handleStop(event, message.buffer)
  } else {
    console.log("pkp:  ~ file: main.js:37 ~ ipcMain.on ~ else")

  }
});

function startCapture() {
  let allDisp = screen.getAllDisplays()
  console.log("pkp:  ~ file: main.js:30 ~ startCapture ~ allDisp", allDisp)
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