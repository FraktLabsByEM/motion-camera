

export class MotionCamera {

    // Device name provided by the user
    #cameraName;

    // Facing mode provided by the user
    #facingMode;

    // Camera device, video device in use
    #cameraDevice;

    // Video element
    #videoElement;

    // Last frame buffer
    #lastBuffer;
    #currentUnprocessed;

    // buffer size
    #bw; #bh;
    
    // Canvas and context
    #cnv; #ctx;

    // Is the engine running;
    #isRunning = false;


    /**
     * Initializes the MotionCamera instance.
     *
     * @param {string} cameraName - The name (label) of the camera to use.
     * @param {boolean} useFrontCamera - Whether to use the front-facing camera. Defaults to false.
     * @param {number} width - The desired video frame width. Defaults to 1280.
     * @param {number} height - The desired video frame height. Defaults to 720.
     */
    constructor(cameraName, useFrontCamera = false, width = 1280, height = 720) {
        // Store user-specified camera name
        this.#cameraName = cameraName;
    
        // Set facing mode based on front/rear camera flag
        this.#facingMode = useFrontCamera ? "user" : "environment";
    
        // Store frame buffer dimensions
        this.#bw = width;
        this.#bh = height;
    
        // Create and configure an off-screen canvas
        this.#cnv = document.createElement("canvas");
        this.#cnv.width = width;
        this.#cnv.height = height;
    
        // Get 2D context for drawing video frames
        this.#ctx = this.#cnv.getContext("2d");
    }    

    /**
     * Initializes the camera by finding the specified device or falling back to the first available one.
     *
     * @returns {Promise<Object>} Resolves with a status and message about the selected camera.
     *                            Rejects if no video devices are available or if an error occurs.
     */
    init = () => {
        return new Promise((resolve, reject) => {
            try {
                const availableCameras = [];
    
                // Get list of all connected media devices
                navigator.mediaDevices.enumerateDevices()
                    .then(devices => {
                        // Filter only video input devices
                        for (const device of devices) {
                            if (device.kind.includes("video")) {
                                availableCameras.push(device);
    
                                // Check if device name matches the one provided
                                if (device.label.includes(this.#cameraName)) {
                                    this.#cameraDevice = device;
                                    break;
                                }
                            }
                        }
    
                        // Case 1: Desired camera was found
                        if (this.#cameraDevice) {
                            setTimeout(() => this.#startCapture(), 100);
                            return resolve({
                                status: "ok",
                                message: `Camera device "${this.#cameraDevice.label}" found.`
                            });
                        }
    
                        // Case 2: No video input at all
                        if (availableCameras.length === 0) {
                            return reject({
                                status: "fail",
                                message: "No video input devices detected."
                            });
                        }
    
                        // Case 3: Use first available camera as fallback
                        this.#cameraDevice = availableCameras[0];
                        setTimeout(() => this.#startCapture(), 100);
                        return resolve({
                            status: "ok",
                            message: `Specified camera not found. Using fallback: "${this.#cameraDevice.label}".`
                        });
                    });
            } catch (err) {
                // Handle unexpected errors
                console.error(`${err.name}: ${err.message}`);
                reject({
                    status: "fail",
                    message: `${err.name}: ${err.message}`
                });
            }
        });
    }    

    /**
     * Starts capturing video from the selected camera device.
     * Initializes a hidden video element, processes the first frame, and stores it for motion comparison.
     *
     * @private
     * @param {Function} [callback] - Optional callback to be called after successful start.
     */
    #startCapture = (callback) => {
        navigator.mediaDevices.getUserMedia({
            audio: false, // Disable audio stream
            video: {
                deviceId: this.#cameraDevice.deviceId, // Use selected device
                facingMode: this.#facingMode,
                width: this.#bw,
                height: this.#bh,
            }
        })
        .then(stream => {
            // Create a video element and attach the stream
            this.#videoElement = document.createElement("video");
            this.#videoElement.srcObject = stream;
            this.#videoElement.play();

            // Set internal flag
            this.#isRunning = true;

            // Process and store the first frame using the kernel
            this.#lastBuffer = this.#applyKernel(this.#getFrame());

            // Execute optional callback
            if (typeof callback === "function") callback();
        })
        .catch(err => {
            // Log any errors during initialization
            console.error(`${err.name}: ${err.message}`);
        });
    }

    /**
     * Processes the current video frame to detect motion compared to the previous frame.
     * Applies kernel filtering, calculates the difference, and returns the result.
     *
     * @returns {Object} An object containing:
     *   - originalFrame {string}: Base64 image of the current frame (before filtering).
     *   - motionFrame {string}: Base64 image highlighting motion areas.
     *   - motionAmount {number}: Percentage of pixels with detected motion.
     */
    getMotion = () => {
        // If not running, restart capture and retry
        if (this.#isRunning) {
            // Get the current raw frame from video
            const currentBuffer = this.#getFrame();
    
            // Apply kernel filter to the current frame
            const filtered = this.#applyKernel(currentBuffer);
    
            // Compare filtered frame to previous and extract motion data
            const [motionImage, motionPercentage] = this.#getMotionImage(filtered);
    
            // Update stored frame for next comparison
            this.#lastBuffer = filtered;
    
            // Return both the raw and motion-detected images
            return {
                originalFrame: this.#getAsImage(currentBuffer),
                motionFrame: motionImage,
                motionAmount: motionPercentage
            };
        }
        this.#startCapture(this.getMotion);
    }


    /**
     * Stops the video capture and releases the camera device.
     * Also clears the last stored frame buffer.
     */
    stopCapture = () => {
        // Update flag
        this.#isRunning = false;

        if (this.#videoElement && this.#videoElement.srcObject) {
            // Stop all tracks in the media stream to properly release the camera
            const tracks = this.#videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());

            // Clean up the video element
            this.#videoElement.srcObject = null;
        }

        // Clear the last stored frame
        this.#lastBuffer = undefined;
    }


    /**
     * Captures the current video frame and returns it as ImageData.
     *
     * @private
     * @returns {ImageData|null} The captured frame as ImageData, or null if the video is not ready.
     */
    #getFrame = () => {
        // Ensure video is available
        if (!this.#videoElement) return null;

        // Clear canvas before drawing the new frame
        this.#ctx.clearRect(0, 0, this.#bw, this.#bh);

        // Draw current frame from video element to canvas
        this.#ctx.drawImage(this.#videoElement, 0, 0, this.#bw, this.#bh);

        // Extract the pixel data from canvas
        return this.#ctx.getImageData(0, 0, this.#bw, this.#bh);
    }


    /**
     * Compares the current frame buffer to the previous one to detect motion.
     * Highlights motion regions and returns both the visual result and motion intensity.
     *
     * @private
     * @param {ImageData} currentBuffer - The processed current frame.
     * @returns {[string, number]} An array containing:
     *   - Base64-encoded image with motion regions highlighted.
     *   - Percentage of pixels where motion was detected.
     */
    #getMotionImage = (currentBuffer) => {
        const motionBuffer = this.#ctx.createImageData(this.#bw, this.#bh);
        let motionPixelCount = 0;

        // Loop through each pixel (RGBA channels)
        for (let i = 0; i < currentBuffer.data.length; i += 4) {
            // Convert both frames to grayscale for comparison (sum of RGB)
            const grayLast = this.#lastBuffer.data[i] + this.#lastBuffer.data[i + 1] + this.#lastBuffer.data[i + 2];
            const grayCurrent = currentBuffer.data[i] + currentBuffer.data[i + 1] + currentBuffer.data[i + 2];

            const diff = Math.abs(grayLast - grayCurrent);

            // Motion threshold: highlight pixel if difference is high enough
            let pixelValue = 255;
            if (diff > 70) {
                pixelValue = grayCurrent;
                motionPixelCount++;
            }

            // Write the pixel (grayscale + full alpha)
            motionBuffer.data[i] = pixelValue;
            motionBuffer.data[i + 1] = pixelValue;
            motionBuffer.data[i + 2] = pixelValue;
            motionBuffer.data[i + 3] = 255;
        }

        // Convert motion image to Base64 and calculate motion percentage
        const motionImage = this.#getAsImage(motionBuffer);
        const motionPercentage = (motionPixelCount * 100) / (currentBuffer.data.length / 4);

        return [motionImage, motionPercentage];
    }


    /**
     * Draws an ImageData buffer to the internal canvas and returns it as a Base64-encoded PNG.
     *
     * @private
     * @param {ImageData} buffer - The image buffer to render.
     * @returns {string} A Base64-encoded PNG image as a data URL.
     */
    #getAsImage = (buffer) => {
        // Render the buffer onto the canvas
        this.#ctx.putImageData(buffer, 0, 0);

        // Convert canvas content to a Base64 image string
        return this.#cnv.toDataURL();
    }


    /**
     * Default convolution kernel (3x3 blur kernel).
     * Applies a soft blur to smooth out small pixel changes and noise.
     */
    defaultKernel = [
        [0.11, 0.11, 0.11],
        [0.11, 0.11, 0.11],
        [0.11, 0.11, 0.11]
    ];

    
    
    /**
     * Applies a convolution kernel to the given image buffer.
     * Converts the image to grayscale first, then processes with the kernel.
     *
     * @private
     * @param {ImageData} imageData - The source image data to be filtered.
     * @param {number[][]} [kernel=this.defaultKernel] - The convolution kernel to apply (2D array).
     * @returns {ImageData} The filtered ImageData after kernel application.
     */
    #applyKernel = (imageData, kernel = this.defaultKernel) => {
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const output = new ImageData(width, height);

        const kernelSize = kernel.length;
        const half = Math.floor(kernelSize / 2);

        // Convert to grayscale first (for better filtering)
        const gray = [];
        for (let i = 0; i < src.length; i += 4) {
            const r = src[i];
            const g = src[i + 1];
            const b = src[i + 2];
            gray.push(0.3 * r + 0.59 * g + 0.11 * b);
        }

        // Apply the kernel to each pixel
        for (let y = half; y < height - half; y++) {
            for (let x = half; x < width - half; x++) {
                let sum = 0;
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const px = x + kx - half;
                        const py = y + ky - half;
                        const pixel = gray[py * width + px];
                        sum += pixel * kernel[ky][kx];
                    }
                }

                const i = (y * width + x) * 4;
                const val = Math.max(0, Math.min(255, Math.abs(sum)));

                output.data[i] = val;
                output.data[i + 1] = val;
                output.data[i + 2] = val;
                output.data[i + 3] = 255;
            }
        }

        return output;
    }
}