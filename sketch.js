// Variables globales para el cubo reactivo
let rotationX = 0;
let rotationY = 0;
let cubeSize = 100;
let colorHue = 0;
let mic;
let audioLevel = 0;
let isAudioEnabled = false;

// Variables para análisis de frecuencias
let fft;
let bassLevel = 0;      // 🔵 Graves (20-250 Hz)
let midLevel = 0;       // 🟡 Medios (250-4000 Hz) 
let trebleLevel = 0;    // 🔴 Agudos (4000+ Hz)
let spectrum = [];
let bassRotation = 0;
let midRotation = 0;

function setup() {
  // Crear canvas proporcional a 1080x1920 (9:16)
  let canvas = createCanvas(540, 960, WEBGL);
  canvas.parent('sketch-holder');
  
  // Configurar modo de color
  colorMode(HSB, 360, 100, 100);
  
  // Inicializar micrófono y análisis FFT
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 1024); // Suavizado 0.8, 1024 bins
  fft.setInput(mic);
  
  console.log("Sketch iniciado - Cubo Reactivo");
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
    // Obtener espectro de frecuencias
    spectrum = fft.analyze();
    audioLevel = mic.getLevel();
    
    // Analizar bandas de frecuencias
    analyzeFrequencyBands();
    
    // 🔵 GRAVES → Escala del cubo
    let bassScale = map(bassLevel, 0, 255, 0.3, 5);
    scale(bassScale);
    
    // 🟡 MEDIOS → Rotación 
    bassRotation += midLevel * 0.01;
    midRotation += midLevel * 0.015;
    rotateX(bassRotation);
    rotateY(midRotation);
    rotateZ(frameCount * 0.01 + midLevel * 0.02);
    
    // 🔴 AGUDOS → Brillo (saturación y valor)
    let brightness = map(trebleLevel, 0, 255, 60, 100);
    let saturation = map(trebleLevel, 0, 255, 50, 100);
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
  let currentBrightness = 90;
  let currentSaturation = 80;
  
  if (isAudioEnabled) {
    currentBrightness = map(trebleLevel, 0, 255, 60, 100);
    currentSaturation = map(trebleLevel, 0, 255, 50, 100);
  }
  
  fill(colorHue, currentSaturation, currentBrightness);
  stroke(colorHue, 100, 100);
  strokeWeight(2);
  
  // Dibujar el cubo
  box(dynamicSize);
  
  pop();
  
  // Actualizar información de controles en HTML
  updateControlsInfo();
}

function updateControlsInfo() {
  // Actualizar div de controles con información en tiempo real
  let controlsDiv = document.querySelector('.controls');
  if (controlsDiv) {
    controlsDiv.innerHTML = `
      <h3>🎮 Controles:</h3>
      <p>• <strong>CLICK</strong>: Cambiar color</p>
      <p>• <strong>ESPACIO</strong>: Activar/desactivar análisis FFT</p>
      <p>• <strong>R</strong>: Cambiar color</p>
      
      <h3>📊 Estado del Sistema:</h3>
      <p>• FPS: ${Math.round(frameRate())}</p>
      <p>• Color HSB: ${Math.round(colorHue)}°</p>
      
      <h3>🎵 Análisis de Audio:</h3>
      <p>• Estado: <span style="color: ${isAudioEnabled ? '#4ecdc4' : '#ff6b6b'}">${isAudioEnabled ? 'ANÁLISIS FFT ACTIVO' : 'DESACTIVADO'}</span></p>
      ${isAudioEnabled ? `
      <p>• Nivel General: <strong>${(audioLevel * 100).toFixed(1)}%</strong></p>
      
      <h3>🎛️ Bandas de Frecuencia:</h3>
      <p>🔵 <strong>GRAVES</strong> (20-250Hz): ${bassLevel.toFixed(1)}</p>
      <p>   └── Efecto: <strong>Escala del cubo</strong></p>
      <p>   └── Factor: ${isAudioEnabled ? map(bassLevel, 0, 255, 0.8, 2.5).toFixed(2) : '1.0'}x</p>
      
      <p>🟡 <strong>MEDIOS</strong> (250-4000Hz): ${midLevel.toFixed(1)}</p>
      <p>   └── Efecto: <strong>Rotación dinámica</strong></p>
      <p>   └── Velocidad X: ${(midLevel * 0.01).toFixed(4)} rad/frame</p>
      <p>   └── Velocidad Y: ${(midLevel * 0.015).toFixed(4)} rad/frame</p>
      
      <p>🔴 <strong>AGUDOS</strong> (4000+Hz): ${trebleLevel.toFixed(1)}</p>
      <p>   └── Efecto: <strong>Brillo del cubo</strong></p>
      <p>   └── Saturación: ${isAudioEnabled ? map(trebleLevel, 0, 255, 50, 100).toFixed(1) : '80.0'}%</p>
      <p>   └── Brillo: ${isAudioEnabled ? map(trebleLevel, 0, 255, 60, 100).toFixed(1) : '90.0'}%</p>
      ` : `
      <p>• Para activar: presiona <strong>ESPACIO</strong></p>
      <p>• Análisis FFT: Inactivo</p>
      <p>• Bandas: Sin datos</p>
      `}
      
      <h3>🎨 Animación:</h3>
      <p>• Rotación X: ${(isAudioEnabled ? bassRotation : rotationX).toFixed(3)} rad</p>
      <p>• Rotación Y: ${(isAudioEnabled ? midRotation : rotationY).toFixed(3)} rad</p>
      <p>• Tamaño: ${Math.round(cubeSize + sin(frameCount * 0.05) * 20)}px</p>
    `;
  }
}

function mousePressed() {
  // Solo cambiar color al hacer clic (no activar audio)
  colorHue = random(360);
  console.log("Color cambiado con CLICK");
}

function keyPressed() {
  if (key === ' ') {
    // Espacebar para toggle audio (SIN cambiar color)
    if (isAudioEnabled) {
      mic.stop();
      isAudioEnabled = false;
      console.log("Audio desactivado");
    } else {
      enableAudio();
    }
  }
  
  if (key === 'r' || key === 'R') {
    // Reset rotación (ahora solo cambia color)
    colorHue = random(360);
    console.log("Color cambiado con R");
  }
  
  if (key === 'c' || key === 'C') {
    // Cambiar color con tecla C
    colorHue = random(360);
    console.log("Color cambiado con C");
  }
}

function enableAudio() {
  mic.start();
  isAudioEnabled = true;
  console.log("Audio habilitado - Análisis FFT activo");
}

// Función para analizar bandas de frecuencias
function analyzeFrequencyBands() {
  // FFT devuelve 1024 bins de frecuencia (0-22kHz aprox)
  // Cada bin representa ~21.5 Hz (22050 / 1024)
  
  // 🔵 GRAVES: 20-250 Hz (bins 1-12 aprox)
  let bassSum = 0;
  for (let i = 1; i <= 12; i++) {
    bassSum += spectrum[i];
  }
  bassLevel = bassSum / 12;
  
  // 🟡 MEDIOS: 250-4000 Hz (bins 12-186 aprox)  
  let midSum = 0;
  for (let i = 12; i <= 186; i++) {
    midSum += spectrum[i];
  }
  midLevel = midSum / (186 - 12);
  
  // 🔴 AGUDOS: 4000+ Hz (bins 186-512)
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