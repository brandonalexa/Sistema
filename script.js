// URL del modelo de Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/kj8dNAyOx/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;
let animationFrameId = null;

// Cargar el modelo de imagen
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Cargar el modelo y los metadatos
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Configurar la webcam
    const flip = true; // Voltear la imagen horizontalmente
    webcam = new tmImage.Webcam(640, 480, flip); // Ancho, alto, voltear
    await webcam.setup(); // Solicitar acceso a la webcam
    await webcam.play();
    
    // Mostrar el video de la cámara
    const videoElement = document.getElementById("webcam");
    const canvasElement = document.getElementById("canvas");
    
    // Configurar el video para mostrar el stream
    videoElement.srcObject = webcam.webcam;
    videoElement.width = webcam.width;
    videoElement.height = webcam.height;
    
    // Configurar el canvas para las predicciones
    canvasElement.width = webcam.width;
    canvasElement.height = webcam.height;
    
    // Mostrar el video y ocultar el mensaje inicial
    videoElement.classList.add("active");
    const labelContainer = document.getElementById("label-container");
    labelContainer.style.background = "transparent";
    labelContainer.style.alignItems = "flex-end";
    labelContainer.style.justifyContent = "center";
    labelContainer.style.paddingBottom = "20px";
    document.getElementById("prediction-label").textContent = "Cargando...";
    
    // Actualizar la UI
    document.getElementById("start-button").style.display = "none";
    document.getElementById("stop-button").style.display = "block";
    isRunning = true;
    
    // Iniciar el loop de predicción
    loop();
}

async function loop() {
    if (!isRunning) return;
    
    webcam.update(); // Actualizar el frame de la webcam
    await predict();
    animationFrameId = window.requestAnimationFrame(loop);
}

// Ejecutar la predicción del modelo
async function predict() {
    // Predecir puede tomar tanto como quieras. Puedes pasar una imagen HTML
    // o un elemento canvas de HTML como argumento
    const prediction = await model.predict(webcam.canvas);
    
    // Encontrar la predicción con mayor probabilidad
    let maxProb = 0;
    let maxLabel = "";
    
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > maxProb) {
            maxProb = prediction[i].probability;
            maxLabel = prediction[i].className;
        }
    }
    
    // Actualizar la etiqueta mostrada
    const labelElement = document.getElementById("prediction-label");
    const probability = (maxProb * 100).toFixed(1);
    
    // Formatear el texto según la clase detectada
    let displayText = "";
    if (maxLabel.toLowerCase().includes("persona") || maxLabel.toLowerCase().includes("ocupado") || maxLabel.toLowerCase().includes("alguien")) {
        displayText = `👤 Persona Detectada\n${probability}%`;
        labelElement.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    } else if (maxLabel.toLowerCase().includes("libre") || maxLabel.toLowerCase().includes("vacío") || maxLabel.toLowerCase().includes("nadie")) {
        displayText = `✅ Espacio Libre\n${probability}%`;
        labelElement.style.background = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
    } else {
        displayText = `${maxLabel}\n${probability}%`;
    }
    
    labelElement.textContent = displayText;
}

// Función para iniciar la cámara
async function startCamera() {
    try {
        await init();
    } catch (error) {
        console.error("Error al iniciar la cámara:", error);
        document.getElementById("prediction-label").textContent = "Error al acceder a la cámara. Por favor, permite el acceso.";
        document.getElementById("prediction-label").style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    }
}

// Función para detener la cámara
function stopCamera() {
    isRunning = false;
    
    // Cancelar el loop de animación
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Detener la webcam de Teachable Machine
    if (webcam) {
        webcam.stop();
    }
    
    // Detener el stream de video
    const video = document.getElementById("webcam");
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    
    // Restaurar la UI
    video.classList.remove("active");
    document.getElementById("label-container").style.background = "rgba(15, 23, 42, 0.8)";
    document.getElementById("prediction-label").textContent = "Cámara detenida. Haz clic en 'Iniciar Cámara' para comenzar de nuevo.";
    document.getElementById("prediction-label").style.background = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
    document.getElementById("start-button").style.display = "block";
    document.getElementById("stop-button").style.display = "none";
}

// Event listeners
document.getElementById("start-button").addEventListener("click", startCamera);
document.getElementById("stop-button").addEventListener("click", stopCamera);

