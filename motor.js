const canvas = document.getElementById('lienzoJuego');
const ctx = canvas.getContext('2d');

function ajustarPantalla() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', ajustarPantalla);
ajustarPantalla();

// CONFIGURACIÓN DE ELEMENTOS DEL MAPA MASIVO
let jugador = { x: 0, y: 150, radio: 16, color: '#3b82f6', velocidad: 6.5 };
let padCompra = { x: -160, y: 40, radio: 35, color: '#22c55e', texto: 'COMPRAR' };
let padCajero = { x: 160, y: 40, radio: 35, color: '#eab308', texto: 'CAJERO' };

const teclas = {};
window.addEventListener('keydown', e => teclas[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => teclas[e.key.toLowerCase()] = false);

// FUNCIÓN DE ARRANQUE MANDATORIA AL SELECCIONAR PAÍS
function iniciarConBando(seleccion) {
    bando = seleccion;
    divisa = bando === 'usa' ? '$' : '¥';
    jugador.color = bando === 'usa' ? '#3b82f6' : '#eab308';
    
    // Cambiar estética de la UI según el bando
    document.getElementById('borde-bando-ui').style.borderLeftColor = jugador.color;
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('ui-juego').style.display = 'flex';
    
    // Resetear variables por seguridad
    dineroBilletera = 100;
    dineroCajero = 0;
    edificiosComprados = [];
    animacionBilletes = [];
    
    actualizarHUD();
    bucleDineroPasivo();
    bucleAlertasIA();
    requestAnimationFrame(bucleRenderizado);
}

// GENERACIÓN DE DINERO PASIVO HACIA EL CAJERO AUTOMÁTICO
function bucleDineroPasivo() {
    setInterval(() => {
        if (edificiosComprados.length > 0) {
            let ingresosFraccion = 0;
            edificiosComprados.forEach((ed, idx) => {
                ingresosFraccion += (idx + 1) * 8; // Cada fábrica produce más que la anterior
                // Crear efecto visual de fajo volando hacia el cajero
                animacionBilletes.push({ x: ed.x, y: ed.y - 20, tx: padCajero.x, ty: padCajero.y, p: 0 });
            });
            dineroCajero += Math.round(ingresosFraccion * multiplicadorArancel);
            actualizarHUD();
        }
    }, 1500);
}

// EVENTOS ALEATORIOS DE IMPUESTOS Y ARANCELES
function bucleAlertasIA() {
    setInterval(() => {
        let azar = Math.random();
        const divAlerta = document.getElementById('alerta-arancel');
        if (azar < 0.55) {
            multiplicadorArancel = 0.4; // Reduce ingresos a la bóveda un 60%
            divAlerta.innerText = bando === 'usa' 
                ? "🚨 ¡China aplica Aranceles de Tecnología! Producción -60%" 
                : "🚨 ¡EE.UU. bloquea la Exportación Naval! Producción -60%";
            divAlerta.style.display = 'block';
        } else {
            multiplicadorArancel = 1;
            divAlerta.style.display = 'none';
        }
    }, 12000);
}

function pintarPlataforma(pad, activa) {
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.radio, 0, Math.PI * 2);
    ctx.fillStyle = pad.color;
    ctx.globalAlpha = activa ? 0.95 : 0.35;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pad.texto, pad.x, pad.y + 4);
}

// BUCLE GRÁFICO PRINCIPAL (60 FPS)
function bucleRenderizado() {
    // Fondo de color según bando elegido
    ctx.fillStyle = bando === 'usa' ? '#0b0f19' : '#1f0d02';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2); // Centrar plano en pantalla

    // Terreno masivo gris central
    ctx.fillStyle = '#222f3e';
    ctx.fillRect(-canvas.width * 0.45, -canvas.height * 0.4, canvas.width * 0.9, canvas.height * 0.75);

    // Pintar los botones interactivos del suelo
    let costeProgresivo = calcularCosteSiguiente();
    let listaFábricas = bando === 'usa' ? expansionesUSA : expansionesChina;
    pintarPlataforma(padCompra, dineroBilletera >= costeProgresivo && edificiosComprados.length < listaFábricas.length);
    pintarPlataforma(padCajero, dineroCajero > 0);

    // Renderizar fábricas en los costados con perspectiva/sombras
    edificiosComprados.forEach(f => {
        // Sombra proyectada inclinada al costado
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(f.x - 16, f.y - f.h + 8, 38, f.h);
        
        // Estructura principal
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x - 20, f.y - f.h, 40, f.h);
        
        // Ventanas brillantes de Neón
        ctx.fillStyle = bando === 'usa' ? '#00d2ff' : '#ffd700';
        ctx.fillRect(f.x - 12, f.y - f.h + 12, 7, 8);
        ctx.fillRect(f.x + 5, f.y - f.h + 12, 7, 8);
        if(f.h > 65) {
            ctx.fillRect(f.x - 12, f.y - f.h + 28, 7, 8);
            ctx.fillRect(f.x + 5, f.y - f.h + 28, 7, 8);
        }

        // Techo blanco lineal estilo bloque
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(f.x - 20, f.y - f.h, 40, 5);

        // Nombre flotante del edificio
        ctx.fillStyle = '#a4b0be';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.nombre, f.x, f.y + 15);
    });

    // Billetes en 2.5D volando físicamente hacia el cajero
    for (let i = animacionBilletes.length - 1; i >= 0; i--) {
        let b = animacionBilletes[i];
        b.p += 0.035; // Velocidad del vuelo
        let actualX = b.x + (b.tx - b.x) * b.p;
        let actualY = b.y + (b.ty - b.y) * b.p - (Math.sin(b.p * Math.PI) * 40); // Curva parabólica de salto

        ctx.fillStyle = '#2ed573';
        ctx.fillRect(actualX - 8, actualY - 4, 16, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(actualX - 2, actualY - 4, 4, 7); // Detalle del billete

        if (b.p >= 1) animacionBilletes.splice(i, 1);
    }

    // Dibujar dinero acumulado sobre el cajero si tiene fondos
    if (dineroCajero > 0) {
        ctx.fillStyle = '#2ed573';
        ctx.fillRect(padCajero.x - 14, padCajero.y - 24, 28, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(divisa + dineroCajero, padCajero.x, padCajero.y - 28);
    }

    // Dibujar Jugador (Avatar Roblox)
    ctx.fillStyle = jugador.color;
    ctx.fillRect(jugador.x - jugador.radio, jugador.y - jugador.radio, jugador.radio * 2, jugador.radio * 2);
    // Rostro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(jugador.x - 9, jugador.y - 5, 5, 5);
    ctx.fillRect(jugador.x + 4, jugador.y - 5, 5, 5);

    ctx.restore();

    // Procesamiento de Entradas de Teclado
    if (teclas['w'] || teclas['arrowup']) jugador.y -= jugador.velocidad;
    if (teclas['s'] || teclas['arrowdown']) jugador.y += jugador.velocidad;
    if (teclas['a'] || teclas['arrowleft']) jugador.x -= jugador.velocidad;
    if (teclas['d'] || teclas['arrowright']) jugador.x += jugador.velocidad;

    // Límites elásticos del mapa masivo
    let limitX = canvas.width * 0.43;
    let limitY = canvas.height * 0.38;
    jugador.x = Math.max(-limitX, Math.min(limitX, jugador.x));
    jugador.y = Math.max(-limitY, Math.min(limitY, jugador.y));

    // Colisión matemática radial con Botón de Compra 🟢
    let distCompra = Math.sqrt((jugador.x - padCompra.x)**2 + (jugador.y - padCompra.y)**2);
    let costeActual = calcularCosteSiguiente();
    if (distCompra < jugador.radio + padCompra.radio && dineroBilletera >= costeActual && edificiosComprados.length < listaFábricas.length) {
        dineroBilletera -= costeActual;
        
        // Las fábricas se construyen alineadas a los costados del fondo
        let numEdi = edificiosComprados.length;
        let lateralX = -240 + (numEdi * 80);
        let lateralY = -120;

        edificiosComprados.push({
            nombre: listaFábricas[numEdi].n,
            x: lateralX,
            y: lateralY,
            h: 55 + Math.random() * 35,
            color: bando === 'usa' ? '#2e519e' : '#a04000'
        });
        
        jugador.y += 45; // Rebote mecánico estilo Roblox pad
        actualizarHUD();
    }

    // Colisión matemática radial con Cajero Automático 🟡
    let distCajero = Math.sqrt((jugador.x - padCajero.x)**2 + (jugador.y - padCajero.y)**2);
    if (distCajero < jugador.radio + padCajero.radio && dineroCajero > 0) {
        dineroBilletera += dineroCajero;
        dineroCajero = 0;
        jugador.y += 45; // Rebote
        actualizarHUD();
    }

    requestAnimationFrame(bucleRenderizado);
}
