/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// In the preload script.
const { ipcRenderer, Menu, dialog } = require('electron')

// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];


const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');

stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;




// Buttons
const videoElement = document.querySelector('video');

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

    // Preview the source in a video element
    // const video = document.querySelector('video')
    // console.log("pkp:  ~ file: renderer.js:43 ~ handleStream ~ video", video)
    // video.srcObject = stream
    // video.onloadedmetadata = (e) => video.play()

    // Create the Media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    // Updates the UI

}
function handleError(e) {
    console.log(e)
}

// Captures all recorded chunks
function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}
// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    console.log("pkp:  ~ file: renderer.js:119 ~ handleStop ~ buffer", buffer)
    var arg1 = {
        "msg": "stopRecord",
        "buffer": buffer
    }
    ipcRenderer.send('onEvent', arg1)
}

