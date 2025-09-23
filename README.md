# Cubo Reactivo Audio-Visual v2.2 🎵🎨

Un cubo 3D interactivo que reacciona en tiempo real al audio, creado con p5.js y WebGL. El proyecto combina análisis de frecuencias FFT con visualizaciones dinámicas y controles personalizables.

## 🎬 Demo en Video

[![Ver Demo](https://img.youtube.com/vi/VmpKj5NFPos/maxresdefault.jpg)](https://youtu.be/VmpKj5NFPos)

**[▶️ Ver resultado en YouTube](https://youtu.be/VmpKj5NFPos)**

## ✨ Características Principales

### 🎵 Análisis de Audio Avanzado
- **Análisis FFT en tiempo real** con 1024 bins de frecuencia
- **Separación en 3 bandas optimizada para música electrónica:**
  - 🔵 **SUB-GRAVES** (20-100 Hz): Kick drums, sub-bass → **Escala del cubo**
  - 🟡 **MEDIOS** (100-4000 Hz): Basslines, leads, voces → **Rotación dinámica**
  - 🔴 **AGUDOS** (4000+ Hz): Hi-hats, crashes, brillos → **Brillo y saturación**

### 🎛️ Controles Personalizables
- **Sliders de rotación** (X, Y, Z) con multiplicadores de -2x a +2x
- **Control de escala** reactiva a graves (0.1x a 3x)
- **Saturación** ajustable (-100% a +100%)
- **Brillo** controlable (0% a 100%)
- **Sistema aditivo**: Los sliders establecen valores base y el audio añade variación

### 🎨 Sistema Visual
- **Modo de color HSB** (360°, 100%, 100%)
- **Color manual** (no cambia automáticamente con audio)
- **Fondo personalizable** con imagen de textura
- **Textura del cubo** independiente del fondo
- **Bordes reactivos** con strokeWeight y colores dinámicos
- **Iluminación 3D** completa (ambiente, direccional, puntual)

### 📊 Información en Tiempo Real
- **FPS** y estado del sistema
- **Valores de audio** por banda de frecuencia
- **Colores actuales** del cubo (HSB)
- **Información de iluminación**
- **Velocidades de rotación** en tiempo real
- **Factores de escala** dinámicos

## 🎹 Controles de Teclado

| Tecla | Función |
|-------|---------|
| **ESPACIO** | Toggle audio ON/OFF |
| **R** | Color aleatorio |
| **C** | Cambiar color |
| **X** | Reconectar audio |
| **CLICK** | Cambiar color base |

## 🛠️ Tecnologías Utilizadas

- **p5.js** - Framework de creative coding
- **p5.sound** - Análisis de audio y FFT
- **WebGL** - Renderizado 3D acelerado
- **Web Audio API** - Captura de audio del micrófono
- **HTML5 Canvas** - Superficie de dibujo
- **CSS3** - Interfaz glassmorphism

## 📁 Estructura del Proyecto

```
cubo-reactivo/
├── index.html              # Interfaz principal con controles
├── sketch.js               # Lógica principal del cubo reactivo
├── styles.css              # Estilos glassmorphism
├── fondo-vertical.jpg      # Imagen de fondo del canvas
├── textura-cubo.png        # Textura aplicada al cubo 3D
└── README.md               # Este archivo
```

## 🔧 Configuración y Uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/JoseValverde/p5-Cubo-audioReactivo.git
cd p5-Cubo-audioReactivo
```

### 2. Servir localmente
```bash
# Con Python 3
python3 -m http.server 8000

# Con Node.js
npx http-server

# Con PHP
php -S localhost:8000
```

### 3. Abrir en navegador
Navegar a `http://localhost:8000`

## 🎧 Configuración de Audio

### Para macOS - BlackHole
Para capturar audio del sistema (música, aplicaciones, etc.) en macOS, recomiendo usar **BlackHole**:

**[📥 Descargar BlackHole](https://github.com/ExistentialAudio/BlackHole)**

BlackHole es un driver de audio virtual que permite:
- Capturar audio interno del sistema
- Rutear audio entre aplicaciones
- Grabación de alta calidad sin bucles de retroalimentación

#### Configuración:
1. Instalar BlackHole desde el enlace oficial
2. En **Configuración de Audio MIDI** crear un dispositivo multi-salida
3. Incluir tanto BlackHole como tus altavoces
4. En el navegador, seleccionar BlackHole como entrada de audio

### Permisos de Micrófono
El navegador solicitará permisos de micrófono al cargar la aplicación. Aceptar para habilitar la reactividad al audio.

## 🎮 Parámetros Técnicos

### Análisis FFT
- **Bins**: 1024 frecuencias (0-22kHz aprox)
- **Resolución**: ~21.5 Hz por bin
- **Suavizado**: Sin suavizado (0) para máxima sensibilidad
- **Actualización**: 60 FPS sincronizado con draw()

### Rangos de Audio Reactivo
- **Escala por graves**: 0.1x - 4.0x del tamaño base
- **Rotación por medios**: Velocidad variable según intensidad
- **Brillo por agudos**: Valor base ± 60 puntos
- **Saturación por agudos**: Valor base ± 60 puntos

### Canvas y Rendering
- **Dimensiones**: 540×960px (proporción 9:16)
- **Modo**: WEBGL para renderizado 3D
- **Color**: HSB (360°, 100%, 100%)
- **FPS objetivo**: 60 FPS

## 🎨 Personalización

### Cambiar Imágenes
- **Fondo**: Reemplazar `fondo-vertical.jpg`
- **Textura del cubo**: Reemplazar `textura-cubo.png`

### Ajustar Sensibilidad
Modificar en `sketch.js`:
```javascript
// Sensibilidad de rotación
bassRotation += midLevel * 0.005;  // Cambiar 0.005
midRotation += midLevel * 0.008;   // Cambiar 0.008

// Rango de brillo/saturación
let audioBoost = map(trebleLevel, 0, 100, -20, 40); // Cambiar -20, 40
```

### Modificar Bandas de Frecuencia
```javascript
// Ajustar rangos en analyzeFrequencyBands()
for (let i = 1; i <= 5; i++)     // Graves: bins 1-5
for (let i = 5; i <= 37; i++)    // Medios bajos: bins 5-37
for (let i = 37; i <= 186; i++)  // Medios altos: bins 37-186
for (let i = 186; i <= 512; i++) // Agudos: bins 186-512
```

## 📈 Optimizaciones

- **Análisis de bandas específicas** para música electrónica
- **Mapeo inteligente** de frecuencias a efectos visuales
- **Sistema de controles no-invasivo** que no bloquea la animación
- **Gestión de memoria** eficiente en análisis FFT
- **Reconexión automática** de audio en caso de pérdida

## 🐛 Solución de Problemas

### El audio no se detecta
1. Verificar permisos de micrófono en el navegador
2. Comprobar que hay audio reproduciéndose
3. Presionar 'X' para forzar reconexión
4. Revisar configuración de BlackHole (macOS)

### Rendimiento bajo
1. Usar navegadores basados en Chromium (Chrome, Edge)
2. Cerrar otras pestañas que usen audio
3. Reducir multiplicadores de efectos visuales
4. Verificar que WebGL esté habilitado

### Colores no cambian
1. Los colores solo cambian manualmente (diseño intencional)
2. Usar CLICK, R, o C para cambiar colores
3. Los sliders afectan saturación/brillo, no el tono

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crear una rama: `git checkout -b nueva-caracteristica`
3. Commit cambios: `git commit -m 'Añadir nueva característica'`
4. Push a la rama: `git push origin nueva-caracteristica`
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**José Valverde**
- GitHub: [@JoseValverde](https://github.com/JoseValverde)
- YouTube: [Ver Demo](https://youtu.be/VmpKj5NFPos)

---

### 🎵 ¡Disfruta creando visualizaciones con tu música favorita! 🎨

*Optimizado para música electrónica, pero funciona con cualquier tipo de audio.*