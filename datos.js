let bando = '';
let divisa = '\$';
let dineroBilletera = 100; 
let multiplicadorArancel = 1;
let productosEnCinta = [];

// Lista masiva y extendida de compras para la presentación
const comprasUSA = {
    maquinas: [
        { n: "Taller Manual de Chips", c: 0, prod: "Chip Base ⚡", v: 6 }, // ¡Gratis e inicial!
        { n: "Línea de Ensamble LED", c: 180, prod: "Circuito 🎛️", v: 24 },
        { n: "Fábrica Silicon Valley", c: 600, prod: "Procesador 💾", v: 80 },
        { n: "Matriz de IA Cuántica", c: 2500, prod: "Cerebro IA 🧠", v: 300 }
    ],
    personal: [
        { n: "Contratar Técnico 1", c: 80, x: -140, y: -210 },
        { n: "Contratar Técnico 2", c: 350, x: -50, y: -210 },
        { n: "Contratar Científico 1", c: 900, x: 40, y: -210 },
        { n: "Contratar Científico 2", c: 4000, x: 130, y: -210 }
    ],
    defensa: [
        { n: "Antivirus Local", c: 150 },
        { n: "Cortafuegos Pentágono", c: 1200 }
    ]
};

const comprasChina = {
    maquinas: [
        { n: "Taller Manual Shenzhen", c: 0, prod: "Placa Base 🛠️", v: 6 }, // ¡Gratis e inicial!
        { n: "Planta de Celdas Litio", c: 180, prod: "Celda 🔋", v: 24 },
        { n: "Giga-Fábrica de Baterías", c: 600, prod: "Batería EV ⚡", v: 80 },
        { n: "Red de Tierras Raras", c: 2500, prod: "Neodimio 💎", v: 300 }
    ],
    personal: [
        { n: "Contratar Obrero 1", c: 80, x: -140, y: -210 },
        { n: "Contratar Obrero 2", c: 350, x: -50, y: -210 },
        { n: "Contratar Ingeniero 1", c: 900, x: 40, y: -210 },
        { n: "Contratar Ingeniero 2", c: 4000, x: 130, y: -210 }
    ],
    defensa: [
        { n: "Aduana Perimetral", c: 150 },
        { n: "Arancel Defensivo", c: 1200 }
    ]
};

let mejorasCompradas = { maquinas: 1, personal: 0, defensa: 0 }; // Empezamos con la máquina 1 ya desbloqueada
let fabricasFisicas = [];
let trabajadoresFisicos = [];

function actualizarHUD() {
    let base = bando === 'usa' ? comprasUSA : comprasChina;
    let txtSiguiente = "";
    
    if (mejorasCompradas.maquinas < base.maquinas.length) {
        let sigM = base.maquinas[mejorasCompradas.maquinas];
        txtSiguiente = `Siguiente Máquina: ${sigM.n} (${divisa}${sigM.c})`;
    } else {
        txtSiguiente = "🏆 ¡IMPERIO INDUSTRIAL COMPLETADO! 🏆";
    }

    document.getElementById('txt-billetera').innerText = `${divisa}${dineroBilletera}`;
    document.getElementById('txt-cajero').innerText = `Trabajadores Activos: ${mejorasCompradas.personal} / 4`;
    document.getElementById('txt-siguiente').innerText = txtSiguiente;
}
