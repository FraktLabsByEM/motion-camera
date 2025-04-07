import { MotionCamera } from '../javascript/motion-camera.js';

// UI Elements
const toggleBtn = document.getElementById("toggleEngine");
const showOriginal = document.getElementById("showOriginal");
const showMotion = document.getElementById("showMotion");
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");
const videoList = document.getElementById("videoList");

// Motion camera instance
const cam = new MotionCamera("Integrated Camera", false, 320, 240);

// State
let engineRunning = false;
let recorder = null;
let chunks = [];
let recording = false;
let motionStartedAt = null;
let monitorInterval = null;

// Helpers
function getCurrentTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, "-");
}

function startRecording() {
    const stream = previewCanvas.captureStream(60); // 10 fps
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = exportVideo;
    recorder.start();
    recording = true;
}

function stopRecording() {
    if (recorder && recording) {
        recorder.stop();
        recording = false;
    }
}

function exportVideo() {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const timestamp = getCurrentTimestamp();

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${timestamp}.webm`;
    link.innerText = `Video @ ${timestamp}`;
    item.appendChild(link);
    videoList.appendChild(item);

    chunks = [];
}

function monitorLoop() {
    const { originalFrame, motionFrame, motionAmount } = cam.getMotion();

    const selected =
        showOriginal.checked && !showMotion.checked
            ? originalFrame
            : !showOriginal.checked && showMotion.checked
                ? motionFrame
                : showMotion.checked
                    ? motionFrame
                    : originalFrame;

    if (motionAmount > 1) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
        img.src = selected;

        if (!recording) {
            startRecording();
            motionStartedAt = Date.now();
        } else {
            motionStartedAt = Date.now();
        }
    }

    if (recording && Date.now() - motionStartedAt > 1000) {
        stopRecording();
    }
}

// Event Listeners
toggleBtn.addEventListener("click", async () => {
    if (!engineRunning) {
        await cam.init();
        monitorInterval = setInterval(monitorLoop, 200);
        toggleBtn.innerText = "Stop Engine";
    } else {
        clearInterval(monitorInterval);
        cam.stopCapture();
        monitorInterval = null;
        toggleBtn.innerText = "Start Engine";
    }
    engineRunning = !engineRunning;
});
