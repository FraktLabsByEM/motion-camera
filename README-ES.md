# 🧠 Motion Detection Engine

Este proyecto proporciona una implementación multi-lenguaje de un sistema de detección de movimiento basado en diferencias de cuadros sucesivos. Utiliza técnicas de procesamiento de imágenes para identificar áreas en movimiento a partir de una cámara.

Soporta:

- ✅ JavaScript (navegador)
- ✅ Python (con OpenCV)
- ✅ Java (con OpenCV)

---

## 💻 JavaScript (Browser)

### 📁 Archivos involucrados

- `motion-camera.js` – Clase `MotionCamera` que gestiona la cámara y detecta movimiento.
- Tu archivo HTML puede incluir este script y usar la clase para mostrar el resultado.

---

### ⚙️ Requisitos del entorno

- ✅ Un navegador moderno con soporte para `MediaDevices` API (Chrome, Firefox, Edge, etc.)
- ✅ Acceso permitido a la cámara web
- ❌ No requiere instalación de paquetes externos

---

### 🚀 Cómo usarlo

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

> Asegúrate de reemplazar `'Integrated Webcam'` con el nombre de tu dispositivo o dejarlo vacío para usar la primera cámara disponible.

---

### ✨ Características

- Captura video desde la cámara del usuario.
- Aplica un kernel convolucional (por defecto: blur) para suavizar la imagen.
- Calcula la diferencia entre cuadros consecutivos.
- Devuelve la imagen con movimiento resaltado y un porcentaje de movimiento detectado.
- Funciona completamente en el navegador.

---

Perfecto, ahora vamos con la sección de **Python** en el `README.md`. Aquí va:

---

## 🐍 Python (con OpenCV)

### 📁 Archivos involucrados

- `motion_camera.py` – Implementación de la clase `MotionCamera` utilizando OpenCV.
- Puedes integrarlo en cualquier script Python que procese video o imágenes.

---

### ⚙️ Requisitos del entorno

- Python 3.7+
- Librerías:
  - `opencv-python`
  - `numpy`

Instalación rápida:

```bash
pip install -r requirementx.txt
```

---

### 🚀 Cómo usarlo

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

### ✨ Características

- Captura video desde cualquier dispositivo de cámara usando OpenCV.
- Convierte imágenes a escala de grises y aplica un kernel convolucional.
- Calcula la diferencia entre cuadros consecutivos.
- Devuelve:
  - El cuadro original.
  - La imagen del movimiento resaltado.
  - Porcentaje de movimiento detectado.
- Se puede usar fácilmente para análisis de video o seguridad.

---

¡Vamos con el bloque final! Aquí tienes la sección para **Java + OpenCV** en el `README.md`:

---

## ☕ Java (con OpenCV)

### 📁 Archivos involucrados

- `MotionCamera.java` – Clase principal que se encarga de capturar video, aplicar un kernel y detectar movimiento.
- Puedes integrarlo en cualquier aplicación Java (consola, Swing, JavaFX, etc.).

---

### ⚙️ Requisitos del entorno

1. **Java Development Kit (JDK)** – Recomendado JDK 11 o superior.
2. **OpenCV para Java** – Descargable desde [opencv.org](https://opencv.org/releases/).

#### 📦 Configuración:

- Importar el archivo `opencv-xxx.jar` a tu proyecto.
- Añadir la ruta nativa de las librerías (`.dll`, `.so`, o `.dylib`) en tu código o en las variables del sistema:

```java
System.loadLibrary(Core.NATIVE_LIBRARY_NAME);  // O especifica la ruta completa
```

---

### 🚀 Cómo usarlo

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

### ✨ Características

- Accede a la cámara usando `VideoCapture`.
- Convierte a escala de grises y aplica un filtro (blur por defecto).
- Detecta movimiento comparando marcos consecutivos.
- Devuelve:
  - Imagen original.
  - Máscara de movimiento.
  - Porcentaje de píxeles con diferencia significativa.

---

### 🧠 Extras

- Puedes adaptar fácilmente esta clase para trabajar con Swing o JavaFX.
- El kernel de convolución es personalizable.
- Se puede extender para detección por zonas (ROI), historial de movimiento, y más.

---