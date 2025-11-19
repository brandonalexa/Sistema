// URL del modelo de Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/kj8dNAyOx/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;

// Cargar el modelo de imagen
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Cargar el modelo y los metadatos
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Configurar la webcam
    const flip = true; // Voltear la imagen horizontalmente
    webcam = new tmImage.Webcam(400, 400, flip); // Ancho, alto, voltear
    await webcam.setup(); // Solicitar acceso a la webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Actualizar la UI
    document.getElementById("webcam").srcObject = webcam.webcam;
    document.getElementById("webcam").classList.add("active");
    document.getElementById("start-button").classList.add("hidden");
    document.getElementById("stop-button").classList.remove("hidden");
    isRunning = true;
}

async function loop() {
    webcam.update(); // Actualizar el frame de la webcam
    await predict();
    window.requestAnimationFrame(loop);
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
    if (webcam) {
        webcam.stop();
        isRunning = false;
    }
    
    const video = document.getElementById("webcam");
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    
    video.classList.remove("active");
    document.getElementById("prediction-label").textContent = "Cámara detenida";
    document.getElementById("prediction-label").style.background = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
    document.getElementById("start-button").classList.remove("hidden");
    document.getElementById("stop-button").classList.add("hidden");
}

// Event listeners
document.getElementById("start-button").addEventListener("click", startCamera);
document.getElementById("stop-button").addEventListener("click", stopCamera);

