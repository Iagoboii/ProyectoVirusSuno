

const palabraClaveBase = "DEACTIVATE.MODULE/"; 
const tiempoTotalEspera = 300; 

let faseActual = 1;
const totalFases = 6;
let juegoActivo = false;
let esperando = false; 
let comandoActual = "";
let comandoRequerido = "";
let tiempoRestante = 0; 
let sistemaIniciado = false; 
let modoCritico = false; 

let erroresActivos = 0;
let temporizadorInterval;
let generadorErroresTimeout;

const gameWindow = document.getElementById('game-window');
const terminalOutput = document.getElementById('terminal-output');
const errorContainer = document.getElementById('error-container');
const bootScreen = document.getElementById('boot-screen');
const desktop = document.getElementById('desktop');
const taskbar = document.getElementById('taskbar');
const flashEffect = document.getElementById('flash-effect');

// --- INICIO DE SESIÓN ---
function iniciarSesion() {
    if (sistemaIniciado) return; 
    sistemaIniciado = true;
    bootScreen.style.opacity = '0';
    desktop.style.display = 'block';
    taskbar.style.display = 'flex'; 
    setTimeout(() => {
        bootScreen.style.display = 'none';
    }, 1000);
}

function generarCodigoHex() {
    const chars = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < 3; i++) {
        code += chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
        if (i < 2) code += '-';
    }
    return palabraClaveBase + code;
}

function openWindow() {
    gameWindow.style.display = 'block';
    juegoActivo = true;
    iniciarFase(1);
}

function closeWindow() {
    gameWindow.style.display = 'none';
    juegoActivo = false;
    terminalOutput.innerHTML = "";
    limpiarTodo();
    document.body.classList.remove('hacked-desktop');
    modoCritico = false;
}

function iniciarFase(fase) {
    faseActual = fase;
    esperando = false;
    comandoActual = "";
    comandoRequerido = generarCodigoHex();
    tiempoRestante = tiempoTotalEspera;
    erroresActivos = 0;
    errorContainer.innerHTML = ""; 
    
    modoCritico = false;
    document.body.classList.remove('hacked-desktop');
    
    actualizarTerminal();
}

document.addEventListener('keydown', function(event) {
    if (!sistemaIniciado) return; 
    if (!juegoActivo) return;

    if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault(); 
        retrocederFase();
        return;
    }

    if (esperando || erroresActivos > 0) return; 

    if (event.key === 'Enter') {
        event.preventDefault();
        procesarComando();
    } 
    else if (event.key === 'Backspace') {
        event.preventDefault();
        comandoActual = comandoActual.slice(0, -1);
        actualizarTerminal();
    } 
    else if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
        comandoActual += event.key.toUpperCase(); 
        actualizarTerminal();
    }
});

function actualizarTerminal(mensajeExtra = "") {
    let mensajeVulnerabilidad = modoCritico ? "¡PELIGRO: SISTEMA CRÍTICO!" : "SE HA DETECTADO UNA VULNERABILIDAD.";
    let estadoErrores = erroresActivos > 0 ? `\n[!] ALERTA: ${mensajeVulnerabilidad} SISTEMA BLOQUEADO.\n` : "";
    
    let cabecera = `=== SISTEMA CENTRAL ===\nFASE ${faseActual} DE ${totalFases}\nCódigo Requerido: '${comandoRequerido}'\n${mensajeExtra}${estadoErrores}\n`;
    
    let prompt = "";
    if (!esperando) {
        prompt = `C:\\User> ${comandoActual}<span class="blink">_</span>`;
    } else {
        prompt = `[ OK ] Código validado.\nEjecutando... Tiempo restante: ${tiempoRestante}s\n<span class="blink">_</span>`;
    }

    terminalOutput.innerHTML = cabecera + prompt;
}

function procesarComando() {
    const comandoIngresado = comandoActual.trim();
    comandoActual = ""; 

    if (comandoIngresado === comandoRequerido) {
        iniciarSecuencia();
    } else if (comandoIngresado !== "") {
        actualizarTerminal("\n[!] ERROR: Comando desconocido.\n");
    }
}

// --- LÓGICA DE SECUENCIA Y FLASH ---
function iniciarSecuencia() {
    esperando = true;
    actualizarTerminal();
    
    
    if (faseActual === totalFases) {
        
        flashEffect.classList.add('flash-active');
        
        setTimeout(() => {
            document.body.classList.add('hacked-desktop');
            modoCritico = true;
            flashEffect.classList.remove('flash-active'); 
            
            temporizadorInterval = setInterval(ticTac, 1000);
            programarSiguienteError();
        }, 200);
    } else {
        temporizadorInterval = setInterval(ticTac, 1000);
        programarSiguienteError();
    }
}

function ticTac() {
    if (erroresActivos === 0) {
        tiempoRestante--;
        actualizarTerminal();

        if (tiempoRestante <= 0) {
            avanzarFase();
        }
    }
}

function programarSiguienteError() {
    if (!esperando) return;     
    let tiempoBase = 4000 - (faseActual * 550); 
    if (tiempoBase < 500) tiempoBase = 500; 
    
    let randomOffset = Math.random() * 2000;
    let tiempoParaError = tiempoBase + randomOffset;

    generadorErroresTimeout = setTimeout(() => {
        generarError();
        new Audio('eff/eff_error_winXp.mp3').play();
        if(esperando) programarSiguienteError();
    }, tiempoParaError);
}

function generarError() {
    erroresActivos++;
    
    actualizarTerminal(); 
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-window';
    
    const maxX = window.innerWidth - 250;
    const maxY = window.innerHeight - 150;
    const posX = Math.max(0, Math.floor(Math.random() * maxX));
    const posY = Math.max(0, Math.floor(Math.random() * maxY));
    
    errorDiv.style.left = `${posX}px`;
    errorDiv.style.top = `${posY}px`;

    let tituloError = "Error Fatal";
    let mensajeError = `Violación de acceso en el sector 0x${Math.floor(Math.random()*9999)}`;
    let imgSrc = "img/img_error_Icon.png";

    if (modoCritico) {
        errorDiv.classList.add('critical'); 
        tituloError = "¡SISTEMA COMPROMETIDO!";
        mensajeError = `¡SISTEMA COMPROMETIDO!\nSECTOR 0x${Math.floor(Math.random()*9999)}`;
        imgSrc = "img/img_error_Icon_critical.png"; 
    }

    errorDiv.innerHTML = `
        <div class="error-title-bar">
            <span class="error-title-text">${tituloError}</span>
            <button class="error-close-btn" onclick="cerrarError(this)">X</button>
        </div>
        <div class="error-content">
            <img src="${imgSrc}" style="width: 30px; height: 30px;">
            <span class="error-message">${mensajeError}</span>
            <button class="error-ok-btn" onclick="cerrarError(this.parentElement.parentElement)">Aceptar</button>
        </div>
    `;

    errorContainer.appendChild(errorDiv);
}

window.cerrarError = function(elementoVentana) {
    elementoVentana.remove();
    erroresActivos--;
    if (erroresActivos < 0) erroresActivos = 0;
    actualizarTerminal(); 
};

function avanzarFase() {
    limpiarTodo();
    
    if (faseActual >= totalFases) {
        terminalOutput.innerHTML = `=== SISTEMA CENTRAL ===\n\n***********************************\n* SISTEMA ESTABILIZADO            *\n* Amenaza eliminada.              *\n***********************************\n\nYa puedes cerrar la ventana.`;
        juegoActivo = false;
        
        document.body.classList.remove('hacked-desktop'); 
        modoCritico = false;
    } else {
        iniciarFase(faseActual + 1);
        actualizarTerminal("\n[ OK ] Sector estabilizado. Siguiente fase.\n");
    }
}

function retrocederFase() {
    if (faseActual > 1) {
        
        limpiarTodo(); 
        
        iniciarFase(faseActual - 1);

    }
}

function limpiarTodo() {
    clearInterval(temporizadorInterval);
    clearTimeout(generadorErroresTimeout);
    errorContainer.innerHTML = "";
    erroresActivos = 0;
    esperando = false; 
}