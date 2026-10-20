// VARIABLES GLOBALES DE LA PARTIDA ECONÓMICA
let bando = '';
let divisa = '\$';
let dineroBilletera = 100;
let dineroCajero = 0; // Dinero acumulado físicamente en la bóveda
let multiplicadorArancel = 1;

// LISTA MASIVA DE EDIFICIOS COMPRABLES (A LOS COSTADOS DEL MAPA)
const expansionesUSA = [
    { n: "Garaje de Código", h: 45, desc: "Tu primer cuartel de software" },
    { n: "Oficina de Ciberseguridad", h: 60, desc: "Protección contra hackeos" },
    { n: "Servidores Cloud LED", h: 75, desc: "Nube de datos de alta velocidad" },
    { n: "Laboratorio de Robótica", h: 80, desc: "Brazos mecánicos automatizados" },
    { n: "Mega-Fábrica Silicon", h: 100, desc: "Producción en masa de semiconductores" },
    { n: "Antena Espía Satelital", h: 120, desc: "Vigilancia de rutas rivales" },
    { n: "Matriz Cuántica Central", h: 140, desc: "La Inteligencia Artificial definitiva" }
];

const expansionesChina = [
    { n: "Taller de Ensamble", h: 45, desc: "Inicio manual en Shenzhen" },
    { n: "Cinta Transportadora", h: 55, desc: "Automatización básica de línea" },
    { n: "Fábrica de Neón Solar", h: 70, desc: "Producción de paneles fotovoltaicos" },
    { n: "Giga-Fábrica de Litio", h: 90, desc: "Baterías para vehículos eléctricos" },
    { n: "Grúa del Puerto Autónomo", h: 110, desc: "Logística marina robotizada" },
    { n: "Centro de Carga Ferroviaria", h: 125, desc: "Exportación terrestre exprés" },
    { n: "Refinería de Tierras Raras", h: 145, desc: "Monopolio mundial de minerales" }
];

let edificiosComprados = [];
let animacionBilletes = [];

// CÁLCULO DE COSTES PROGRESIVOS ESTILO ROBLOX TYCOON
function calcularCosteSiguiente() {
    // Cada edificio cuesta el triple que el anterior para máxima adicción
    return Math.round(50 * Math.pow(3, edificiosComprados.length));
}

// ACTUALIZACIÓN DE TEXTOS EN LA INTERFAZ SUPERIOR
function actualizarHUD() {
    let listaActual = bando === 'usa' ? expansionesUSA : expansionesChina;
    let coste = calcularCosteSiguiente();
    
    let textoSiguiente = edificiosComprados.length < listaActual.length 
        ? `Siguiente: ${listaActual[edificiosComprados.length].n} (${divisa}${coste})`
        : "🏆 ¡IMPERIO COMERCIAL COMPLETADO! 🏆";

    document.getElementById('txt-billetera').innerText = `${divisa}${dineroBilletera}`;
    document.getElementById('txt-cajero').innerText = `🏦 En Cajero / Bóveda: ${divisa}${dineroCajero}`;
    document.getElementById('txt-siguiente').innerText = textoSiguiente;
}
