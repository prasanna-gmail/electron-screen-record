/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// In the preload script.
const { ipcRenderer } = require('electron')

ipcRenderer.on('SET_SOURCE', async (event, sourceId, scaleFactor, size) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 10000,
                    minHeight: 720,
                    maxHeight: 4000
                }
            }
        })
        handleStream(stream, scaleFactor, size)
    } catch (e) {
        handleError(e)
    }
})

function handleStream(stream, scaleFactor, size) {
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = function (e) {
        video.play()
        console.log('video.size', this.videoWidth, this.videoHeight)
        var canvas = document.getElementById('screenshot-canvas')
        canvas.width = this.videoWidth
        canvas.height = this.videoHeight
        var ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        video.remove()
        document.getElementById('screenshot-img').src = canvas.toDataURL("image/png")
        document.getElementById('screenshot-img').style.display = "block"
        console.log('screen-size,scaleFactor', size, scaleFactor)
        console.log('screenshot-img:size:',
            canvas.width,
            canvas.height)

    }
}

function handleError(e) {
    console.log(e)
}