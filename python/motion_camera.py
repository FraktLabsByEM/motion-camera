import cv2
import numpy as np

class MotionCamera:
    def __init__(self, camera_index=0, width=640, height=480):
        """
        Initializes the motion detection camera.

        :param camera_index: Index of the video device (0 for default)
        :param width: Width of the video capture
        :param height: Height of the video capture
        """
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.cap = None
        self.last_frame = None
        self.kernel = np.ones((3, 3), np.float32) / 9  # Default blur kernel

    def start_capture(self):
        """Starts the video capture device."""
        self.cap = cv2.VideoCapture(self.camera_index)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)

    def stop_capture(self):
        """Stops the video capture device and releases resources."""
        if self.cap:
            self.cap.release()
            self.cap = None
        self.last_frame = None

    def _apply_kernel(self, frame, kernel=None):
        """
        Applies a convolution kernel to the grayscale version of the frame.

        :param frame: Input BGR frame from the video capture.
        :param kernel: 2D NumPy array representing the convolution kernel.
        :return: Grayscale filtered image.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        kernel = kernel if kernel is not None else self.kernel
        return cv2.filter2D(gray, -1, kernel)

    def get_motion(self):
        """
        Captures a new frame, compares it with the previous one,
        and calculates the motion mask and motion amount.

        :return: (original_frame, motion_frame, motion_percentage)
        """
        if self.cap is None or not self.cap.isOpened():
            self.start_capture()

        ret, frame = self.cap.read()
        if not ret:
            return None, None, 0

        processed = self._apply_kernel(frame)

        motion_frame = np.zeros_like(processed)
        motion_amount = 0

        if self.last_frame is not None:
            diff = cv2.absdiff(processed, self.last_frame)
            _, motion_frame = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
            motion_amount = np.count_nonzero(motion_frame) * 100 / motion_frame.size

        self.last_frame = processed

        return frame, motion_frame, motion_amount
