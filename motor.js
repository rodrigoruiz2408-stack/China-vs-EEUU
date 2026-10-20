const canvas = document.getElementById('lienzoJuego'), ctx = canvas.getContext('2d');
function res() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', res); res();

let jug = { x: 0, y: 140, r: 14, color: '#3b82f6', v: 9.5 }, velH = 3.5;

// CUATRO BOTONES INTERACTIVOS (AÑADIDO EL BOTÓN DE EXPANDIR MAPA)
let pFab = { x: -150, y: 100, radio: 26, color: '#22c55e', texto: 'FÁBRICA', cat: 'maquinas' };
let pPer = { x: -50, y: 100, radio: 26, color: '#a855f7', texto: 'PERSONAL', cat: 'personal' };
let pDef = { x: 50, y: 100, radio: 26, color: '#3b82f6', texto: 'DEFENSA', cat: 'defensa' };
let pExp = { x: 150, y: 100, radio: 26, color: '#f97316', texto: 'EXPANDIR', cat: 'expansion' };

let zVent = { x: 240, y: -80, w: 60, h: 60 }, teclas = {};
let tamanoMapa = 0.5; // El mapa empieza pequeño (50% de su tamaño)
let costeExpansion = 200;

window.addEventListener('keydown', e => teclas[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => teclas[e.key.toLowerCase()] = false);

function iniciarConBando(sel) {
    bando = sel; divisa = bando === 'usa' ? '$' : '¥';
    jug.color = bando === 'usa' ? '#3b82f6' : '#eab308';
    document.getElementById('borde-bando-ui').style.borderLeftColor = jug.color;
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('ui-juego').style.display = 'flex';
    
    dineroBilletera = 150; productosEnCinta = []; fabricasFisicas = []; tamanoMapa = 0.5; costeExpansion = 200;
    mejorasCompradas = { maquinas: 0, personal: 0, defensa: 0 };
    
    actualizarHUD();
    
    setInterval(() => {
        let b = bando === 'usa' ? comprasUSA : comprasChina;
        for (let i = 0; i < mejorasCompradas.maquinas; i++) {
            if (productosEnCinta.length < 15) {
                productosEnCinta.push({ x: -200 + (i * 90), y: -100, txt: b.maquinas[i].prod, valor: b.maquinas[i].v * 5, tx: zVent.x });
            }
        }
    }, 1800);

    setInterval(() => {
        let az = Math.random(), div = document.getElementById('alerta-arancel');
        if (az < 0.55 && mejorasCompradas.defensa === 0) {
            multiplicadorArancel = 0.3;
            div.innerText = bando === 'usa' ? "🚨 ¡Aranceles! Tecnología se vende un 70% más barata." : "🚨 ¡Sanción! El Litio pierde el 70% de su valor.";
            div.style.display = 'block';
        } else { multiplicadorArancel = 1; div.style.display = 'none'; }
    }, 10000);
    
    requestAnimationFrame(render);
}

function pPad(p, act, cost) {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.globalAlpha = act ? 0.95 : 0.3; ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.texto, p.x, p.y - 2); ctx.font = '7px sans-serif'; ctx.fillText(cost, p.x, p.y + 8);
}

function render() {
    let bActivo = bando === 'usa' ? comprasUSA : comprasChina;
    ctx.fillStyle = bando === 'usa' ? '#0c111d' : '#221003'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); 
    // Efecto de cámara que se aleja dinámicamente al expandir el territorio externo
    let escalaCamara = 1 / tamanoMapa;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(escalaCamara * 0.7, escalaCamara * 0.7);

    // DIBUJAR EL SUELO GRIS DINÁMICO (CRECE CON LAS EXPANSIONES)
    ctx.fillStyle = '#334155'; 
    let dW = canvas.width * tamanoMapa, dH = canvas.height * tamanoMapa;
    ctx.fillRect(-dW * 0.8, -dH * 0.8, dW * 1.6, dH * 1.5);

    // LÍNEAS DE REJILLA DE CONSTRUCCIÓN
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for(let lx = -dW; lx <= dW; lx += 40) { ctx.beginPath(); ctx.moveTo(lx, -dH); ctx.lineTo(lx, dH); ctx.stroke(); }

    // DIBUJAR LA HUINCHA TRANSPORTADORA
    ctx.fillStyle = '#475569'; ctx.fillRect(-220, -105, 480, 12);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-220, -102, 480, 6);

    // ZONA DE EXPORTACIÓN VERDE
    ctx.fillStyle = '#16a34a'; ctx.fillRect(zVent.x, zVent.y, zVent.w, zVent.h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText("EXPORTAR", zVent.x + 30, zVent.y + 34);

    // PRECIOS DE LOS BOTONES
    let cM = mejorasCompradas.maquinas < bActivo.maquinas.length ? divisa + bActivo.maquinas[mejorasCompradas.maquinas].c : 'MAX';
    let cP = mejorasCompradas.personal < bActivo.personal.length ? divisa + bActivo.personal[mejorasCompradas.personal].c : 'MAX';
    let cD = mejorasCompradas.defensa < bActivo.defensa.length ? divisa + bActivo.defensa[mejorasCompradas.defensa].c : 'MAX';
    let cE = tamanoMapa < 1.2 ? divisa + costeExpansion : 'MAX';

    pPad(pFab, cM !== 'MAX' && dineroBilletera >= bActivo.maquinas[mejorasCompradas.maquinas].c, cM);
    pPad(pPer, cP !== 'MAX' && dineroBilletera >= bActivo.personal[mejorasCompradas.personal].c, cP);
    pPad(pDef, cD !== 'MAX' && dineroBilletera >= bActivo.defensa[mejorasCompradas.defensa].c, cD);
    pPad(pExp, cE !== 'MAX' && dineroBilletera >= costeExpansion, cE);

    // RENDERIZAR FÁBRICAS FISICAS
    fabricasFisicas.forEach(f => {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(f.x - 16, f.y - f.h + 6, 36, f.h);
        ctx.fillStyle = f.color; ctx.fillRect(f.x - 20, f.y - f.h, 40, f.h);
        ctx.fillStyle = bando === 'usa' ? '#00f0ff' : '#ffcc00';
        ctx.fillRect(f.x - 12, f.y - f.h + 10, 6, 8); ctx.fillRect(f.x + 6, f.y - f.h + 10, 6, 8);
        ctx.fillStyle = '#fff'; ctx.fillRect(f.x - 20, f.y - f.h, 40, 5);
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 7px sans-serif'; ctx.fillText(f.nombre, f.x, f.y + 12);
    });

    // PROCESAR PRODUCTOS EN LA HUINCHA
    for (let i = productosEnCinta.length - 1; i >= 0; i--) {
        let pr = productosEnCinta[i]; pr.x += velH;
        ctx.fillStyle = bando === 'usa' ? '#3b82f6' : '#eab308'; ctx.fillRect(pr.x - 12, pr.y - 6, 24, 12);
        ctx.fillStyle = '#fff'; ctx.font = '7px sans-serif'; ctx.fillText(pr.txt, pr.x, pr.y + 3);
        if (pr.x >= pr.tx) { dineroBilletera += Math.round(pr.valor * multiplicadorArancel); productosEnCinta.splice(i, 1); actualizarHUD(); }
    }

    // DIBUJAR AL JUGADOR (AVATAR HUMANO ACTIVADO)
    let px = jug.x, py = jug.y, r = jug.r;
    ctx.fillStyle = '#1e293b'; let osc = Math.sin(Date.now() / 90) * 4;
    ctx.fillRect(px - 5, py + r - 3, 3, 6 + osc); ctx.fillRect(px + 2, py + r - 3, 3, 6 - osc); // Piernas
    ctx.fillStyle = jug.color; ctx.fillRect(px - r, py - r + 4, r * 2, r * 2 - 4); // Ropa
    ctx.beginPath(); ctx.arc(px, py - r + 4, 6, 0, Math.PI * 2); ctx.fillStyle = '#fed7aa'; ctx.fill(); // Cabeza
    ctx.fillStyle = '#000'; ctx.fillRect(px - 2, py - r + 3, 1, 2); ctx.fillRect(px + 2, py - r + 3, 1, 2); // Ojos

    ctx.restore();

    // ENTRADAS DE MOVIMIENTO
    if (teclas['w'] || teclas['arrowup']) jug.y -= jug.v; if (teclas['s'] || teclas['arrowdown']) jug.y += jug.v;
    if (teclas['a'] || teclas['arrowleft']) jug.x -= jug.v; if (teclas['d'] || teclas['arrowright']) jug.x += jug.v;

    // LÍMITES SENSITIVOS RESPECTO AL TAMAÑO DEL MAPA COMPRADO
    let limitX = (dW * 0.78), limitY = (dH * 0.72);
    jug.x = Math.max(-limitX, Math.min(limitX, jug.x));
    jug.y = Math.max(-limitY, Math.min(limitY, jug.y));

    // SISTEMA DE COLISIONES CON LOS CUATRO BOTONES
    [pFab, pPer, pDef, pExp].forEach(p => {
        let d = Math.sqrt((jug.x - p.x)**2 + (jug.y - p.y)**2);
        if (d < jug.r + p.radio) {
            if (p.cat === 'expansion') {
                if (dineroBilletera >= costeExpansion && tamanoMapa < 1.2) {
                    dineroBilletera -= costeExpansion; tamanoMapa += 0.25; costeExpansion = Math.round(costeExpansion * 2.5);
                    jug.y += 45; actualizarHUD();
                }
            } else {
                let cat = p.cat, idx = mejorasCompradas[cat], item = bActivo[cat][idx];
                if (item && dineroBilletera >= item.c) {
                    dineroBilletera -= item.c; mejorasCompradas[cat]++;
                    if (cat === 'maquinas') {
                        fabricasFisicas.push({ nombre: item.n, x: -200 + (idx * 90), y: -115, h: 50 + (idx * 15), color: bando === 'usa' ? '#1e40af' : '#b45309' });
                    }
                    if (item.mejora === 'velocidad_cinta') velH += 2.5;
                    if (item.mejora === 'velocidad_personaje') jug.v += 3;
                    jug.y += 45; actualizarHUD();
                }
            }
        }
    });

    requestAnimationFrame(render);
}
