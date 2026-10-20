let bando = '';
let divisa = '\$';
let dineroBilletera = 100; 
let multiplicadorArancel = 1;
let productosEnCinta = [];

// LISTA AMPLIADA Y EXTENSA PARA DURAR MÁS DE 6 MINUTOS
const comprasUSA = {
    maquinas: [
        { n: "Garaje de Código", c: 50, prod: "Código 📄", v: 8 },
        { n: "Oficina de Ciberseguridad", c: 150, prod: "Firewall 🛡️", v: 22 },
        { n: "Servidores Cloud LED", c: 450, prod: "Datos 💾", v: 65 },
        { n: "Laboratorio de Robótica", c: 1200, prod: "Microchip ⚡", v: 180 },
        { n: "Mega-Fábrica Silicon", c: 3500, prod: "Procesador 🎛️", v: 450 },
        { n: "Antena Espía Satelital", c: 9000, prod: "Plano IA 🛰️", v: 1200 },
        { n: "Matriz Cuántica Central", c: 25000, prod: "IA Cuántica 🧠", v: 3500 }
    ],
    personal: [
        { n: "Becario Técnico", c: 60, mejora: "velocidad_cinta" },
        { n: "Ingeniero Senior", c: 300, mejora: "velocidad_cinta" },
        { n: "Científico de Datos", c: 1500, mejora: "velocidad_personaje" },
        { n: "Director de Innovación", c: 6000, mejora: "velocidad_cinta" }
    ],
    defensa: [
        { n: "Encriptación Local", c: 100, mejora: "antivirus" },
        { n: "Cortafuegos Nacional", c: 800, mejora: "antivirus" },
        { n: "Protección del Pentágono", c: 5000, mejora: "antivirus" }
    ]
};

const comprasChina = {
    maquinas: [
        { n: "Taller de Ensamble", c: 50, prod: "Mineral 🪨", v: 8 },
        { n: "Cinta Transportadora", c: 150, prod: "Celda Litio 🔋", v: 22 },
        { n: "Fábrica de Neón Solar", c: 450, prod: "Panel Solar ☀️", v: 65 },
        { n: "Giga-Fábrica de Litio", c: 1200, prod: "Batería EV ⚡", v: 180 },
        { n: "Grúa del Puerto Autónomo", c: 3500, prod: "Contenedor 📦", v: 450 },
        { n: "Carga Ferroviaria", c: 9000, prod: "Tren Logístico 🚂", v: 1200 },
        { n: "Refinería Tierras Raras", c: 25000, prod: "Imán Neodimio 💎", v: 3500 }
    ],
    personal: [
        { n: "Obrero Industrial", c: 60, mejora: "velocidad_cinta" },
        { n: "Supervisor de Planta", c: 300, mejora: "velocidad_cinta" },
        { n: "Especialista Logístico", c: 1500, mejora: "velocidad_personaje" },
        { n: "Superintendente Shenzhen", c: 6000, mejora: "velocidad_cinta" }
    ],
    defensa: [
        { n: "Aduana Básica", c: 100, mejora: "antivirus" },
        { n: "Inspección de Contenedores", c: 800, mejora: "antivirus" },
        { n: "Arancel de Represalia 25%", c: 5000, mejora: "antivirus" }
    ]
};

let mejorasCompradas = { maquinas: 0, personal: 0, defensa: 0 };
let fabricasFisicas = [];

function actualizarHUD() {
    let base = bando === 'usa' ? comprasUSA : comprasChina;
    let txtSiguiente = "";
    
    if (mejorasCompradas.maquinas < base.maquinas.length) {
        let sigM = base.maquinas[mejorasCompradas.maquinas];
        txtSiguiente = `Infraestructura: ${sigM.n} (${divisa}${sigM.c})`;
    } else {
        txtSiguiente = "🏆 ¡SUPERPOTENCIA ECONÓMICA MUNDIAL CONSTRUIDA! 🏆";
    }

    document.getElementById('txt-billetera').innerText = `${divisa}${dineroBilletera}`;
    document.getElementById('txt-cajero').innerText = `Defensas Activas: Nivel ${mejorasCompradas.defensa}`;
    document.getElementById('txt-siguiente').innerText = txtSiguiente;
}

