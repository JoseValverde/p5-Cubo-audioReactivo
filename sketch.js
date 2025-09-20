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
let bassLevel = 0;              console.log("🎛️ FFT conectado - Análisis activo");
        console.log("⚡ Configuración: Sin suavizado, optimizada para electrónica");
        
        updateAudioStatus('✅ Micrófono conectado', '#00ff00');     // 🔵 Graves (20-250 Hz)
let midLevel = 0;              // 🟡 Medios (250-4000 Hz) 
let trebleLevel = 0;           // 🔴 Agudos (4000+ Hz)
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
  fft = new p5.FFT(0, 1024); // Suavizado 0.8, 1024 bins
  // NO conectar FFT aquí - se conecta cuando se activa el audio
  
  // Detectar dispositivos de audio disponibles
  detectAudioDevices();
  
  // Activar audio automáticamente al iniciar
  setTimeout(() => {
    console.log("🚀 Intentando activar audio automáticamente...");
    enableAudio();
  }, 500); // Dar tiempo para que se cargue todo
  
  // Verificación adicional si falla el primer intento
  setTimeout(() => {
    if (!isAudioEnabled) {
      console.log("⚠️ Primer intento falló, reintentando...");
      enableAudio();
    }
  }, 2000);
  
  console.log("Sketch iniciado - Cubo Reactivo");
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
      console.log("Micrófono desconectado - Intentando reconectar...");
      reconnectAudio();
      return;
    }
    
    // Obtener espectro de frecuencias
    spectrum = fft.analyze();
    audioLevel = mic.getLevel();
    
    // Verificar si realmente hay datos de audio
    if (audioLevel === 0 && spectrum.every(val => val === 0)) {
      console.log("Sin datos de audio - Verificando conexión...");
    }
    
    // Analizar bandas de frecuencias
    analyzeFrequencyBands();
    
    // 🔵 SUB-GRAVES → Escala del cubo (más reactivo para kicks potentes)
    let bassScale = map(bassLevel, 0, 255, 0.1, 4);
    scale(bassScale);
  
    // 🟡 MEDIOS → Rotación (ajustado para elementos melódicos electrónicos)
    bassRotation += midLevel * 0.005;  // Más sensible a cambios melódicos
    midRotation += midLevel * 0.008;   // Rotación Y más rápida para leads
    rotateX(bassRotation/10);
    rotateY(midRotation/10);
    rotateZ(frameCount * 0.001); // Z más dinámico para drops
    
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
      <h3>Controles:</h3>
      <p>• <strong>ANÁLISIS AUTOMÁTICO</strong>: Activo al cargar</p>
      <p>• <strong>CLICK</strong>: Cambiar color</p>
      <p>• <strong>ESPACIO</strong>: ON/OFF análisis FFT</p>
      <p>• <strong>C</strong>: Cambiar color</p>
      <p>• <strong>R</strong>: Cambiar color</p>
      <p>• <strong>X</strong>: Forzar reconexión de audio</p>
      
      <h3>Estado del Sistema:</h3>
      <p>• FPS: ${Math.round(frameRate())}</p>
      <p>• Color HSB: ${Math.round(colorHue)}°</p>
      
      <h3>Análisis de Audio:</h3>
      <p>• Estado: <span style="color: ${isAudioEnabled ? '#4ecdc4' : '#ff6b6b'}">${isAudioEnabled ? 'ANÁLISIS FFT ACTIVO' : 'DESACTIVADO'}</span></p>
      ${isAudioEnabled ? `
      <p>• Nivel General: <strong>${(audioLevel * 100).toFixed(1)}%</strong></p>
      
      <h3>Bandas de Frecuencia - MÚSICA ELECTRÓNICA:</h3>
      <p><strong>SUB-GRAVES</strong> (20-100Hz): ${bassLevel.toFixed(1)}</p>
      <p>   └── Efecto: <strong>Escala del cubo</strong> (kicks, sub-bass)</p>
      <p>   └── Factor: ${isAudioEnabled ? map(bassLevel, 0, 255, 0.5, 3.5).toFixed(2) : '1.0'}x</p>
      
      <p><strong>MEDIOS</strong> (100-4000Hz): ${midLevel.toFixed(1)}</p>
      <p>   └── Efecto: <strong>Rotación dinámica</strong> (basslines, leads)</p>
      <p>   └── Velocidad X: ${(midLevel * 0.005).toFixed(4)} rad/frame</p>
      <p>   └── Velocidad Y: ${(midLevel * 0.008).toFixed(4)} rad/frame</p>
      
      <p><strong>AGUDOS</strong> (4000+Hz): ${trebleLevel.toFixed(1)}</p>
      <p>   └── Efecto: <strong>Brillo del cubo</strong> (hi-hats, crashes)</p>
      <p>   └── Saturación: ${isAudioEnabled ? map(trebleLevel, 0, 255, 50, 100).toFixed(1) : '80.0'}%</p>
      <p>   └── Brillo: ${isAudioEnabled ? map(trebleLevel, 0, 255, 60, 100).toFixed(1) : '90.0'}%</p>
      ` : `
      <p>• Para activar: presiona <strong>ESPACIO</strong></p>
      <p>• Análisis FFT: Inactivo</p>
      <p>• Bandas: Sin datos</p>
      `}
      
      <h3>Animación:</h3>
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
  
  if (key === 'x' || key === 'X') {
    // Forzar reconexión de audio
    console.log("Forzando reconexión de audio...");
    reconnectAudio();
  }
}

// Función para detectar dispositivos de audio disponibles
async function detectAudioDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    console.log("🎤 Dispositivos de audio detectados:");
    audioInputs.forEach((device, index) => {
      const label = device.label || `Dispositivo ${index + 1}`;
      const type = label.includes('BlackHole') || label.includes('Virtual') ? '(Virtual)' : '(Built-in)';
      console.log(`${index}: ${label} ${type} (ID: ${device.deviceId})`);
    });
    
    // Buscar micrófono real (no virtual)
    const realMic = audioInputs.find(device => 
      !device.label.includes('BlackHole') && 
      !device.label.includes('Virtual') &&
      (device.label.includes('MacBook') || device.label.includes('Built-in'))
    );
    
    if (realMic) {
      console.log(`✅ Micrófono real encontrado: ${realMic.label}`);
      return realMic.deviceId;
    } else {
      console.log("⚠️ No se encontró micrófono real, usando por defecto");
      return null;
    }
    
  } catch (error) {
    console.log("❌ Error detectando dispositivos:", error);
    return null;
  }
}

function enableAudio() {
  console.log("🎤 Iniciando proceso de activación de audio...");
  
  // Primero intentar obtener acceso específico al micrófono
  navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    } 
  })
  .then(stream => {
    console.log("✅ Acceso al micrófono concedido");
    console.log("🔧 Stream obtenido:", stream.active ? "Activo" : "Inactivo");
    
    // Detener micrófono anterior si existe
    if (mic && mic.stream) {
      mic.stop();
    }
    
    // Crear nuevo AudioIn con el stream obtenido
    mic = new p5.AudioIn();
    
    // Verificar que p5.AudioIn esté disponible
    if (!mic) {
      console.log("❌ Error: p5.AudioIn no disponible");
      return;
    }
    
    mic.start();
    console.log("🎵 Micrófono iniciado");
    
    // Dar tiempo para que se inicie el micrófono
    setTimeout(() => {
      if (mic && fft) {
        fft.setInput(mic);
        isAudioEnabled = true;
        console.log("�️ FFT conectado - Análisis activo");
        console.log("⚡ Configuración: Sin suavizado, optimizada para electrónica");
        
        // Verificar que realmente está recibiendo audio
        setTimeout(() => {
          if (mic) {
            const testLevel = mic.getLevel();
            console.log(`🔊 Nivel de audio: ${(testLevel * 100).toFixed(1)}%`);
            
            if (testLevel === 0) {
              console.log("⚠️ Nivel cero detectado:");
              console.log("   • Verifica que hay sonido reproduciéndose");
              console.log("   • Comprueba el volumen del sistema");
              console.log("   • Revisa permisos del navegador");
            } else {
              console.log("✅ Audio detectado correctamente");
            }
          }
        }, 1000);
      } else {
        console.log("❌ Error: mic o fft no disponibles");
      }
    }, 300);
  })
  .catch(error => {
    console.log("❌ Error accediendo al micrófono:", error.name, error.message);
    
    if (error.name === 'NotAllowedError') {
      console.log("� Permisos denegados - Haz clic en el icono de micrófono en la barra de direcciones");
    } else if (error.name === 'NotFoundError') {
      console.log("🔍 Micrófono no encontrado - Verifica que esté conectado");
    } else if (error.name === 'NotReadableError') {
      console.log("📵 Micrófono ocupado por otra aplicación");
    }
    
    console.log("💡 Para solucionarlo:");
    console.log("   • Presiona X para reconectar");
    console.log("   • Verifica permisos en el navegador");
    console.log("   • Prueba a recargar la página");
  });
}

// Función para reconectar audio cuando se pierde la conexión
function reconnectAudio() {
  console.log("🔄 === RECONEXIÓN DE AUDIO ===");
  isAudioEnabled = false;
  
  // Detener micrófono actual
  if (mic) {
    console.log("🛑 Deteniendo micrófono actual");
    mic.stop();
  }
  
  // Recrear FFT con la configuración sin suavizado
  console.log("🔧 Recreando FFT");
  fft = new p5.FFT(0, 1024);
  
  // Reiniciar audio con verificación mejorada
  setTimeout(() => {
    console.log("🔄 Iniciando reconexión...");
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

// Función para actualizar el estado en la interfaz
function updateAudioStatus(message, color = '#00ff00') {
  const statusDiv = document.getElementById('audio-status');
  if (statusDiv) {
    statusDiv.innerHTML = message;
    statusDiv.style.color = color;
  }
}

// Redimensionar canvas manteniendo proporción 9:16