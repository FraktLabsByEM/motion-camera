# 🧠 Motion Detection Engine

A multi-language motion detection system using image processing techniques to detect differences between successive video frames. It can highlight motion areas and calculate motion intensity.

Supported Platforms:
- ✅ JavaScript (Browser)
- ✅ Python (OpenCV)
- ✅ Java (OpenCV)

---

## 💻 JavaScript (Browser)

### 📁 Files

- `motion-camera.js` – Contains the `MotionCamera` class for motion detection in the browser.

---

### ⚙️ Requirements

- A modern browser (Chrome, Firefox, Edge)
- Access to user's webcam via `MediaDevices.getUserMedia`
- No additional libraries required

---

### 🚀 How to Use

```html
<script type="module">
  import { MotionCamera } from './motion-camera.js';

  const camera = new MotionCamera('Integrated Webcam', false, 640, 480);
  await camera.init();

  setInterval(() => {
    const { originalFrame, motionFrame, motionAmount } = camera.getMotion();
    document.getElementById("original").src = originalFrame;
    document.getElementById("motion").src = motionFrame;
    console.log("Motion:", motionAmount.toFixed(2) + "%");
  }, 100);
</script>

<img id="original" />
<img id="motion" />
```

> Replace `'Integrated Webcam'` with the device name or leave it blank to auto-select the first camera.

---

### ✨ Features

- Captures video directly from the user's webcam
- Applies a convolution kernel (default: blur) to smooth frames
- Computes differences between consecutive frames
- Outputs:
  - The current frame
  - The motion mask
  - Percentage of pixels in motion

---

## 🐍 Python (with OpenCV)

### 📁 Files

- `motion_camera.py` – Class-based implementation using OpenCV and NumPy.

---

### ⚙️ Requirements

- Python 3.7+
- Libraries:
  - `opencv-python`
  - `numpy`

Install with:

```bash
pip install -r requirements.txt
```

---

### 🚀 How to Use

```python
from motion_camera import MotionCamera
import cv2

cam = MotionCamera(0, 640, 480)

while True:
    result = cam.get_motion()
    if result is None:
        break

    cv2.imshow("Original", result.original)
    cv2.imshow("Motion", result.motion)
    print(f"Motion Detected: {result.motion_percentage:.2f}%")

    if cv2.waitKey(30) & 0xFF == ord('q'):
        break

cam.stop()
cv2.destroyAllWindows()
```

---

### ✨ Features

- Captures video from any webcam via OpenCV
- Converts to grayscale and applies a custom kernel (default: blur)
- Compares consecutive frames to detect motion
- Outputs:
  - The current frame
  - The motion mask
  - Percentage of motion

---

## ☕ Java (with OpenCV)

### 📁 Files

- `MotionCamera.java` – Java implementation for real-time motion detection.

---

### ⚙️ Requirements

- JDK 11+ recommended
- OpenCV installed and configured
  - Download from: https://opencv.org/releases/
  - Add `opencv-xxx.jar` to your classpath
  - Load native library (DLL, SO, DYLIB)

Example:

```java
System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
```

---

### 🚀 How to Use

```java
System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
MotionCamera cam = new MotionCamera(0, 640, 480);

while (true) {
    MotionCamera.Result result = cam.getMotion();
    if (result == null) break;

    HighGui.imshow("Original", result.original);
    HighGui.imshow("Motion", result.motion);
    System.out.printf("Motion: %.2f%%\n", result.motionPercentage);

    if (HighGui.waitKey(30) == 'q') break;
}

cam.stopCapture();
HighGui.destroyAllWindows();
```

---

### ✨ Features

- Captures frames using `VideoCapture`
- Applies grayscale + convolution filters
- Computes pixel-wise differences between frames
- Outputs:
  - The current frame
  - The motion-highlighted image
  - Motion percentage

---

### 🧠 Notes

- You can easily adapt the Java version for desktop GUIs (Swing/JavaFX)
- All versions support customizable convolution kernels
- Extendable for region-based motion, motion tracking, etc.

---

Let me know if you’d like this in a downloadable `.md` file or if you want to attach license or contribution guidelines.