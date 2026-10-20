let bando = '';
let divisa = '\$';
let dineroBilletera = 150; // Empezamos con un extra para acelerar la presentación
let multiplicadorArancel = 1;

// Base de productos físicos para las cintas transportadoras
let productosEnCinta = [];

// TRES CATEGORÍAS DE BOTONES PARA COMPRAR (EVITA QUE SEA ABURRIDO)
const comprasUSA = {
    maquinas: [
        { n: "Línea de Microchips", c: 60, prod: "Chip ⚡", v: 25 },
        { n: "Ensambladora de PCs", c: 250, prod: "Computador 💻", v: 75 },
        { n: "Laboratorio de IA", c: 900, prod: "Super-Server 🧠", v: 250 }
    ],
    personal: [
        { n: "Contratar Ingeniero", c: 80, mejora: "velocidad_cinta" },
        { n: "Contratar Científico", c: 400, mejora: "velocidad_personaje" }
    ],
    defensa: [
        { n: "Ciberseguridad FBI", c: 150, mejora: "antivirus" }
    ]
};

const comprasChina = {
    maquinas: [
        { n: "Extracción de Litio", c: 60, prod: "Litio 🪨", v: 22 },
        { n: "Fábrica de Celdas", c: 250, prod: "Batería 🔋", v: 70 },
        { n: "Megaplanta Automotriz", c: 900, prod: "Auto Eléctrico 🚗", v: 240 }
    ],
    personal: [
        { n: "Contratar Operario", c: 80, mejora: "velocidad_cinta" },
        { n: "Contratar Supervisor", c: 400, mejora: "velocidad_personaje" }
    ],
    defensa: [
        { n: "Aduana Blindada", c: 150, mejora: "antivirus" }
    ]
};

// Contadores de progreso del Tycoon
let mejorasCompradas = { maquinas: 0, personal: 0, defensa: 0 };
let fabricasFisicas = [];

function actualizarHUD() {
    let base = bando === 'usa' ? comprasUSA : comprasChina;
    let txtSiguiente = "";
    
    if (mejorasCompradas.maquinas < base.maquinas.length) {
        let sigM = base.maquinas[mejorasCompradas.maquinas];
        txtSiguiente = `Siguiente Infraestructura: ${sigM.n} (${divisa}${sigM.c})`;
    } else {
        txtSiguiente = "🏆 ¡SUPERPOTENCIA INDUSTRIAL CONSTRUIDA! 🏆";
    }

    document.getElementById('txt-billetera').innerText = `${divisa}${dineroBilletera}`;
    document.getElementById('txt-cajero').innerText = `📦 Productos vendidos en Huincha de Carga`;
    document.getElementById('txt-siguiente').innerText = txtSiguiente;
}
