// Variables globales para el cubo reactivo
let rotationX = 0;
let rotationY = 0;
let cubeSize = 100;
let colorHue = 0;
let mic;
let audioLevel = 0;
let isAudioEnabled = false;

// Variables de frecuencia de audio
let fft;
let bassLevel = 0;             // 🔵 Graves (20-250 Hz)
let midLevel = 0;              // 🟡 Medios (250-4000 Hz) 
let trebleLevel = 0;           // 🔴 Agudos (4000+ Hz)
let spectrum = [];
let bassRotation = 0;
let midRotation = 0;

// Variables de control de parámetros
let rotXMultiplier = 1.0;
let rotYMultiplier = 1.0;
let rotZMultiplier = 1.0;
let scaleMultiplier = 1.0;
let saturationControl = 80;
let brightnessControl = 80;

function setup() {
  // Crear canvas proporcional a 1080x1920 (9:16)
  let canvas = createCanvas(540, 960, WEBGL);
  canvas.parent('sketch-holder');
  
  // Configurar modo de color
  colorMode(HSB, 360, 100, 100);
  
  // Inicializar micrófono y análisis FFT
  mic = new p5.AudioIn();
  fft = new p5.FFT(0, 1024); // Suavizado 0.8, 1024 bins
  // NO conectar FFT aquí - se conecta cuando se activa el audio
  
  // Detectar dispositivos de audio disponibles
  detectAudioDevices();
  
  // Auto-activar audio si está disponible
  if (getAudioContext) {
    setTimeout(() => {
      enableAudio();
    }, 100);
    setTimeout(() => {
      enableAudio();
    }, 2000);
  }  // Configurar controles después de un delay más largo para asegurar que el DOM esté listo
  setTimeout(setupControls, 500);
  
  updateAudioStatus('🔍 Inicializando audio...', '#ffaa00');
}

function draw() {
  // Fondo dinámico
  background(220, 50, 20);
  
  // Iluminación
  ambientLight(60);
  directionalLight(255, 255, 255, -1, 0.5, -1);
  pointLight(255, 255, 255, 0, -200, 200);
  
  // Rotación automática suave (cuando no hay audio)
  if (!isAudioEnabled) {
    rotationX = sin(frameCount * 0.008) * 0.3;
    rotationY = cos(frameCount * 0.012) * 0.4;
  }
  
  // Aplicar transformaciones
  push();
  
  // Posicionar en el centro
  translate(0, 0, 0);
  
  // Reactividad al audio con análisis FFT (si está habilitado)
  if (isAudioEnabled) {
    // Audio real - verificar si el micrófono sigue conectado
    if (!mic || !mic.enabled) {
      reconnectAudio();
      return;
    }
    
    // Obtener espectro de frecuencias
    spectrum = fft.analyze();
    audioLevel = mic.getLevel();
    
    // Analizar bandas de frecuencias
    analyzeFrequencyBands();
    
    // 🔵 SUB-GRAVES → Escala del cubo (más reactivo para kicks potentes)
    let bassScale = map(bassLevel, 0, 255, 0.1, 4) * scaleMultiplier;
    scale(bassScale);
  
    // 🟡 MEDIOS → Rotación (ajustado para elementos melódicos electrónicos)
    bassRotation += midLevel * 0.005;  // Más sensible a cambios melódicos
    midRotation += midLevel * 0.008;   // Rotación Y más rápida para leads
    rotateX(bassRotation/10 * rotXMultiplier);
    rotateY(midRotation/10 * rotYMultiplier);
    rotateZ(frameCount * 0.001 * rotZMultiplier); // Z más dinámico para drops
    
    // 🔴 AGUDOS → Brillo (saturación y valor)
    let brightness = map(trebleLevel, 0, 255, 20, brightnessControl);
    let saturation = saturationControl;
    colorHue = map(audioLevel, 0, 1, 0, 360); // Color general por nivel
  } else {
    // Rotaciones normales sin audio
    rotateX(rotationX);
    rotateY(rotationY);
    rotateZ(frameCount * 0.01);
  }
  // Sin audio: mantener el color actual (solo cambia con controles)
  
  // Tamaño reactivo
  let dynamicSize = cubeSize + sin(frameCount * 0.05) * 20;
  
  // Material del cubo con brillo reactivo a agudos
  let currentBrightness = brightnessControl;
  let currentSaturation = saturationControl;
  
  if (isAudioEnabled) {
    currentBrightness = map(trebleLevel, 0, 255, 20, brightnessControl);
    currentSaturation = saturationControl;
  }
  
  fill(colorHue, currentSaturation, currentBrightness);
  stroke(colorHue, 100, 100);
  strokeWeight(2);
  
  // Dibujar el cubo
  box(dynamicSize);
  
  pop();
  
  // Actualizar solo los valores numéricos sin tocar los sliders
  updateNumericInfo();
}

function updateNumericInfo() {
  // Actualizar información numérica SIN usar innerHTML en .controls
  const fpsValue = document.getElementById('fps-value');
  const colorValue = document.getElementById('color-value');
  const audioStatusText = document.getElementById('audio-status-text');
  const audioLevelValue = document.getElementById('audio-level');
  const bassLevelValue = document.getElementById('bass-level');
  const bassFactor = document.getElementById('bass-factor');
  const midLevelValue = document.getElementById('mid-level');
  const rotXSpeed = document.getElementById('rot-x-speed');
  const rotYSpeed = document.getElementById('rot-y-speed');
  const trebleLevelValue = document.getElementById('treble-level');
  const dynamicSaturation = document.getElementById('dynamic-saturation');
  const dynamicBrightness = document.getElementById('dynamic-brightness');
  const currentRotX = document.getElementById('current-rot-x');
  const currentRotY = document.getElementById('current-rot-y');
  const currentSize = document.getElementById('current-size');
  
  // Actualizar valores individuales
  if (fpsValue) fpsValue.textContent = Math.round(frameRate());
  if (colorValue) colorValue.textContent = Math.round(colorHue);
  
  if (audioStatusText) {
    audioStatusText.textContent = isAudioEnabled ? 'ANÁLISIS FFT ACTIVO' : 'DESACTIVADO';
    audioStatusText.style.color = isAudioEnabled ? '#4ecdc4' : '#ff6b6b';
  }
  
  if (audioLevelValue) audioLevelValue.textContent = (audioLevel * 100).toFixed(1);
  if (bassLevelValue) bassLevelValue.textContent = bassLevel.toFixed(1);
  if (bassFactor) bassFactor.textContent = isAudioEnabled ? map(bassLevel, 0, 255, 0.5, 3.5).toFixed(2) : '1.0';
  if (midLevelValue) midLevelValue.textContent = midLevel.toFixed(1);
  if (rotXSpeed) rotXSpeed.textContent = (midLevel * 0.005).toFixed(4);
  if (rotYSpeed) rotYSpeed.textContent = (midLevel * 0.008).toFixed(4);
  if (trebleLevelValue) trebleLevelValue.textContent = trebleLevel.toFixed(1);
  if (dynamicSaturation) dynamicSaturation.textContent = isAudioEnabled ? map(trebleLevel, 0, 255, 50, 100).toFixed(1) : '80.0';
  if (dynamicBrightness) dynamicBrightness.textContent = isAudioEnabled ? map(trebleLevel, 0, 255, 60, 100).toFixed(1) : '90.0';
  if (currentRotX) currentRotX.textContent = (isAudioEnabled ? bassRotation : rotationX).toFixed(3);
  if (currentRotY) currentRotY.textContent = (isAudioEnabled ? midRotation : rotationY).toFixed(3);
  if (currentSize) currentSize.textContent = Math.round(cubeSize + sin(frameCount * 0.05) * 20);
}

function mousePressed() {
  // Cambiar color base al hacer click
  currentHue = (currentHue + 30) % 360;
}

function keyPressed() {
  if (key === ' ') {
    // Espacebar para toggle audio (SIN cambiar color)
    if (isAudioEnabled) {
      mic.stop();
      isAudioEnabled = false;
    } else {
      enableAudio();
    }
  }
  
  if (key === 'r' || key === 'R') {
    // Reset rotación (ahora solo cambia color)
    colorHue = random(360);
  }
  
  if (key === 'c' || key === 'C') {
    // Cambiar color con tecla C
    colorHue = random(360);
  }
  
  if (key === 'x' || key === 'X') {
    // Forzar reconexión de audio
    reconnectAudio();
  }
}

// Función para detectar dispositivos de audio disponibles
async function detectAudioDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    // Buscar dispositivos específicos en orden de preferencia
    const blackHoleDevice = audioInputs.find(device => 
      device.label.toLowerCase().includes('blackhole'));
    const virtualDevice = audioInputs.find(device => 
      device.label.toLowerCase().includes('virtual'));
    const realMic = audioInputs.find(device => 
      !device.label.toLowerCase().includes('blackhole') &&
      !device.label.toLowerCase().includes('virtual'));
    
    if (blackHoleDevice) {
      return blackHoleDevice.deviceId;
    } else if (virtualDevice) {
      return virtualDevice.deviceId;
    } else if (realMic) {
      return realMic.deviceId;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

function enableAudio() {
  // Primero intentar obtener acceso específico al micrófono
  navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    } 
  })
  .then(stream => {
    // Detener micrófono anterior si existe
    if (mic && mic.stream) {
      mic.stop();
    }
    
    // Crear nuevo AudioIn con el stream obtenido
    mic = new p5.AudioIn();
    
    // Verificar que p5.AudioIn esté disponible
    if (!mic) {
      return;
    }
    
    mic.start();
    
    // Dar tiempo para que se inicie el micrófono
    setTimeout(() => {
      if (mic && fft) {
        fft.setInput(mic);
        isAudioEnabled = true;
      }
    }, 300);
  })
  .catch(error => {
    // Manejo silencioso de errores de audio
  });
}

// Función para reconectar audio cuando se pierde la conexión
function reconnectAudio() {
  isAudioEnabled = false;
  
  // Detener micrófono actual
  if (mic) {
    mic.stop();
  }
  
  // Recrear FFT
  fft = new p5.FFT(0, 1024);
  
  // Reiniciar audio
  setTimeout(() => {
    enableAudio();
  }, 500);
}

// Función para analizar bandas de frecuencias - OPTIMIZADO PARA MÚSICA ELECTRÓNICA
function analyzeFrequencyBands() {
  // FFT devuelve 1024 bins de frecuencia (0-22kHz aprox)
  // Cada bin representa ~21.5 Hz (22050 / 1024)
  
  // 🔵 SUB-GRAVES: 20-100 Hz (bins 1-5) - Kick drums, sub-bass
  let bassSum = 0;
  for (let i = 1; i <= 5; i++) {
    bassSum += spectrum[i];
  }
  bassLevel = bassSum / 5;
  
  // 🟡 MEDIOS-BAJOS: 100-800 Hz (bins 5-37) - Basslines, sintetizadores graves
  let midSum = 0;
  for (let i = 5; i <= 37; i++) {
    midSum += spectrum[i];
  }
  
  // 🟠 MEDIOS-ALTOS: 800-4000 Hz (bins 37-186) - Leads, voces, FX
  let midHighSum = 0;
  for (let i = 37; i <= 186; i++) {
    midHighSum += spectrum[i];
  }
  
  // Combinar medios para rotación (más sensible a cambios melódicos)
  midLevel = (midSum / (37 - 5)) + (midHighSum / (186 - 37)) * 0.7;
  
  // 🔴 AGUDOS: 4000+ Hz (bins 186-512) - Hi-hats, crashes, brillos
  let trebleSum = 0;
  for (let i = 186; i <= 512; i++) {
    trebleSum += spectrum[i];
  }
  trebleLevel = trebleSum / (512 - 186);
}

// Redimensionar canvas manteniendo proporción 9:16
function windowResized() {
  let newWidth = windowWidth * 0.4; // Más pequeño para dejar espacio a controles
  let newHeight = newWidth * (16/9); // Mantener proporción 9:16
  resizeCanvas(newWidth, newHeight);
}

// Función para configurar los controles de sliders
function setupControls() {
  // Event listeners para sliders
  const rotXSlider = document.getElementById('rotX-slider');
  const rotYSlider = document.getElementById('rotY-slider');
  const rotZSlider = document.getElementById('rotZ-slider');
  const scaleSlider = document.getElementById('scale-slider');
  const saturationSlider = document.getElementById('saturation-slider');
  const brightnessSlider = document.getElementById('brightness-slider');
  
  // Verificar que los elementos existen y agregar event listeners
  if (rotXSlider) {
    rotXSlider.addEventListener('input', (e) => {
      rotXMultiplier = parseFloat(e.target.value);
      document.getElementById('rotX-value').textContent = rotXMultiplier.toFixed(1);
    });
  }
  
  if (rotYSlider) {
    rotYSlider.addEventListener('input', (e) => {
      rotYMultiplier = parseFloat(e.target.value);
      document.getElementById('rotY-value').textContent = rotYMultiplier.toFixed(1);
    });
  }
  
  if (rotZSlider) {
    rotZSlider.addEventListener('input', (e) => {
      rotZMultiplier = parseFloat(e.target.value);
      document.getElementById('rotZ-value').textContent = rotZMultiplier.toFixed(1);
    });
  }
  
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      scaleMultiplier = parseFloat(e.target.value);
      document.getElementById('scale-value').textContent = scaleMultiplier.toFixed(1);
    });
  }
  
  if (saturationSlider) {
    saturationSlider.addEventListener('input', (e) => {
      saturationControl = parseInt(e.target.value);
      document.getElementById('saturation-value').textContent = saturationControl + '%';
    });
  }
  
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', (e) => {
      brightnessControl = parseInt(e.target.value);
      document.getElementById('brightness-value').textContent = brightnessControl + '%';
    });
  }
}

// Función para resetear controles a valores por defecto
function resetControls() {
  // Reset variables
  rotXMultiplier = 1.0;
  rotYMultiplier = 1.0;
  rotZMultiplier = 1.0;
  scaleMultiplier = 1.0;
  saturationControl = 80;
  brightnessControl = 80;
  
  // Reset sliders
  const rotXSlider = document.getElementById('rotX-slider');
  const rotYSlider = document.getElementById('rotY-slider');
  const rotZSlider = document.getElementById('rotZ-slider');
  const scaleSlider = document.getElementById('scale-slider');
  const saturationSlider = document.getElementById('saturation-slider');
  const brightnessSlider = document.getElementById('brightness-slider');
  
  if (rotXSlider) rotXSlider.value = 1.0;
  if (rotYSlider) rotYSlider.value = 1.0;
  if (rotZSlider) rotZSlider.value = 1.0;
  if (scaleSlider) scaleSlider.value = 1.0;
  if (saturationSlider) saturationSlider.value = 80;
  if (brightnessSlider) brightnessSlider.value = 80;
  
  // Reset displays
  const rotXValue = document.getElementById('rotX-value');
  const rotYValue = document.getElementById('rotY-value');
  const rotZValue = document.getElementById('rotZ-value');
  const scaleValue = document.getElementById('scale-value');
  const saturationValue = document.getElementById('saturation-value');
  const brightnessValue = document.getElementById('brightness-value');
  
  if (rotXValue) rotXValue.textContent = "1.0";
  if (rotYValue) rotYValue.textContent = "1.0";
  if (rotZValue) rotZValue.textContent = "1.0";
  if (scaleValue) scaleValue.textContent = "1.0";
  if (saturationValue) saturationValue.textContent = "80%";
  if (brightnessValue) brightnessValue.textContent = "80%";
}

// Función para resetear valores a defaults
function resetControls() {
  rotXMultiplier = 1.0;
  rotYMultiplier = 1.0;
  rotZMultiplier = 1.0;
  scaleMultiplier = 1.0;
  saturationControl = 80;
  brightnessControl = 80;
  
  // Actualizar sliders y valores en la interfaz
  updateSliderValues();
}

// Función para actualizar valores de sliders en la interfaz
function updateSliderValues() {
  const sliders = [
    {slider: 'rotX-slider', value: 'rotX-value', val: rotXMultiplier, suffix: ''},
    {slider: 'rotY-slider', value: 'rotY-value', val: rotYMultiplier, suffix: ''},
    {slider: 'rotZ-slider', value: 'rotZ-value', val: rotZMultiplier, suffix: ''},
    {slider: 'scale-slider', value: 'scale-value', val: scaleMultiplier, suffix: ''},
    {slider: 'saturation-slider', value: 'saturation-value', val: saturationControl, suffix: '%'},
    {slider: 'brightness-slider', value: 'brightness-value', val: brightnessControl, suffix: '%'}
  ];
  
  sliders.forEach(s => {
    const sliderEl = document.getElementById(s.slider);
    const valueEl = document.getElementById(s.value);
    if (sliderEl) sliderEl.value = s.val;
    if (valueEl) valueEl.textContent = s.val + s.suffix;
  });
}

// Función para actualizar el estado en la interfaz
function updateAudioStatus(message, color = '#00ff00') {
  const statusDiv = document.getElementById('audio-status');
  if (statusDiv) {
    statusDiv.innerHTML = message;
    statusDiv.style.color = color;
  }
}

// Redimensionar canvas manteniendo proporción 9:16