const canvas = document.getElementById('lienzoJuego'), ctx = canvas.getContext('2d');
function res() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', res); res();

let jug = { x: 0, y: 140, r: 14, color: '#3b82f6', v: 8.5 }, velH = 3.2;

let pFab = { x: -180, y: 160, radio: 26, color: '#22c55e', texto: 'FÁBRICA', cat: 'maquinas' };
let pPer = { x: -60, y: 160, radio: 26, color: '#a855f7', texto: 'PERSONAL', cat: 'personal' };
let pDef = { x: 60, y: 160, radio: 26, color: '#3b82f6', texto: 'DEFENSA', cat: 'defensa' };
let pExp = { x: 180, y: 160, radio: 26, color: '#f97316', texto: 'TERRENO', cat: 'expansion' };

let zVent = { x: 380, y: -240, w: 75, h: 75 }, teclas = {};
let tamanoMapa = 0.6, costeExpansion = 100, nivelExpansion = 0;

// SISTEMA REVOLUCIONARIO DE ZOOM (RUEDITA Y PELLIZCO MULTITÁCTIL)
let zoomEscala = 1.0;
window.addEventListener('wheel', e => {
    zoomEscala += e.deltaY * -0.001;
    zoomEscala = Math.max(0.4, Math.min(2.0, zoomEscala));
}, { passive: true });

let distInicialTactil = null;
window.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
        let dx = e.touches[0].clientX - e.touches[1].clientX;
        let dy = e.touches[0].clientY - e.touches[1].clientY;
        let dActual = Math.sqrt(dx*dx + dy*dy);
        if (distInicialTactil === null) { distInicialTactil = dActual; }
        else {
            let factor = dActual / distInicialTactil;
            zoomEscala = Math.max(0.4, Math.min(2.0, zoomEscala * (factor > 1 ? 1.02 : 0.98)));
            distInicialTactil = dActual;
        }
    }
});
window.addEventListener('touchend', () => { distInicialTactil = null; });

window.addEventListener('keydown', e => teclas[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => teclas[e.key.toLowerCase()] = false);

function iniciarConBando(sel) {
    bando = sel; divisa = bando === 'usa' ? '$' : '¥';
    jug.color = bando === 'usa' ? '#3b82f6' : '#eab308';
    document.getElementById('borde-bando-ui').style.borderLeftColor = jug.color;
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('ui-juego').style.display = 'flex';
    
    dineroBilletera = 100; productosEnCinta = []; fabricasFisicas = []; tamanoMapa = 0.6; costeExpansion = 100; nivelExpansion = 0; zoomEscala = 1.0;
    mejorasCompradas = { maquinas: 0, personal: 0, defense: 0, defensa: 0 };
    
    actualizarHUD();
    
    setInterval(() => {
        let b = bando === 'usa' ? comprasUSA : comprasChina;
        for (let i = 0; i < mejorasCompradas.maquinas; i++) {
            if (productosEnCinta.length < 30) {
                let fY = -240 + (Math.floor(i/4) * 80);
                productosEnCinta.push({ x: -380 + ((i%4) * 160), y: fY + 35, txt: b.maquinas[i].prod, valor: b.maquinas[i].v, tx: zVent.x, ty: zVent.y + 35 });
            }
        }
    }, 1500);

    setInterval(() => {
        let az = Math.random(), div = document.getElementById('alerta-arancel');
        let factorMitigacion = 1.0 - (mejorasCompradas.defensa * 0.33); // Cada defensa reduce el daño
        if (az < 0.55 && factorMitigacion > 0) {
            multiplicadorArancel = 0.3 + (mejorasCompradas.defensa * 0.2);
            div.innerText = bando === 'usa' ? "🚨 ¡Crisis de Aranceles! Ganancias reducidas." : "🚨 ¡Sanción de EE.UU.! Valores de exportación afectados.";
            div.style.display = 'block';
        } else { multiplicadorArancel = 1; div.style.display = 'none'; }
    }, 11000);
    
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
    ctx.fillStyle = bando === 'usa' ? '#0c111d' : '#1a0d02'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); 
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomEscala, zoomEscala); // Aplicación del zoom en el renderizador

    // TERRENO CENTRAL AMPLIADO QUE ABRE TODO EL ESPACIO DE LA PANTALLA
    ctx.fillStyle = '#2d3748'; 
    let dW = 500 * tamanoMapa, dH = 400 * tamanoMapa;
    ctx.fillRect(-dW, -dH, dW * 2, dH * 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
    for(let lx = -dW; lx <= dW; lx += 40) { ctx.beginPath(); ctx.moveTo(lx, -dH); ctx.lineTo(lx, dH); ctx.stroke(); }

    // RENDERIZAR HUINCHAS LARGAS EN LOS COSTADOS DEL ESCENARIO
    ctx.fillStyle = '#4a5568'; ctx.fillRect(-390, -210, 840, 10);
    ctx.fillStyle = '#1a202c'; ctx.fillRect(-390, -207, 840, 4);

    // ZONA DE VENTA AL EXTREMO COSTADO DERECHO
    ctx.fillStyle = '#22c55e'; ctx.fillRect(zVent.x, zVent.y, zVent.w, zVent.h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText("ADUANA DE", zVent.x + 37, zVent.y + 32);
    ctx.fillText("VENTAS", zVent.x + 37, zVent.y + 44);

    let cM = mejorasCompradas.maquinas < bActivo.maquinas.length ? divisa + bActivo.maquinas[mejorasCompradas.maquinas].c : 'MAX';
    let cP = mejorasCompradas.personal < bActivo.personal.length ? divisa + bActivo.personal[mejorasCompradas.personal].c : 'MAX';
    let cD = mejorasCompradas.defensa < bActivo.defensa.length ? divisa + bActivo.defensa[mejorasCompradas.defensa].c : 'MAX';
    let cE = nivelExpansion < 3 ? divisa + costeExpansion : 'MAX';

    pPad(pFab, cM !== 'MAX' && dineroBilletera >= bActivo.maquinas[mejorasCompradas.maquinas].c, cM);
    pPad(pPer, cP !== 'MAX' && dineroBilletera >= bActivo.personal[mejorasCompradas.personal].c, cP);
    pPad(pDef, cD !== 'MAX' && dineroBilletera >= bActivo.defensa[mejorasCompradas.defensa].c, cD);
    pPad(pExp, cE !== 'MAX' && dineroBilletera >= costeExpansion, cE);

    // RENDERIZAR EDIFICIOS DISTRIBUIDOS POR EL COSTADO Y EL FONDO
    fabricasFisicas.forEach(f => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(f.x - 22, f.y - f.h + 8, 44, f.h);
        ctx.fillStyle = f.color; ctx.fillRect(f.x - 25, f.y - f.h, 50, f.h);
        ctx.fillStyle = bando === 'usa' ? '#38bdf8' : '#fbbf24';
        ctx.fillRect(f.x - 16, f.y - f.h + 12, 10, 10); ctx.fillRect(f.x + 6, f.y - f.h + 12, 10, 10);
        ctx.fillStyle = '#fff'; ctx.fillRect(f.x - 25, f.y - f.h, 50, 6);
        ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 8px sans-serif'; ctx.fillText(f.nombre, f.x, f.y + 14);
    });

    // PRODUCTOS FÍSICOS VIAJANDO POR LA CINTA
    for (let i = productosEnCinta.length - 1; i >= 0; i--) {
        let pr = productosEnCinta[i]; pr.x += velH;
        ctx.fillStyle = bando === 'usa' ? '#60a5fa' : '#fbbf24'; ctx.fillRect(pr.x - 14, pr.y - 7, 28, 14);
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 7px sans-serif'; ctx.fillText(pr.txt.substring(0,4), pr.x, pr.y + 4);
        if (pr.x >= pr.tx) { dineroBilletera += Math.round(pr.valor * multiplicadorArancel); productosEnCinta.splice(i, 1); actualizarHUD(); }
    }

    // AVATAR HUMANO ROBLOX
    let px = jug.x, py = jug.y, r = jug.r;
    ctx.fillStyle = '#1a202c'; let osc = Math.sin(Date.now() / 90) * 4;
    ctx.fillRect(px - 5, py + r - 3, 3, 6 + osc); ctx.fillRect(px + 2, py + r - 3, 3, 6 - osc);
    ctx.fillStyle = jug.color; ctx.fillRect(px - r, py - r + 4, r * 2, r * 2 - 4);
    ctx.beginPath(); ctx.arc(px, py - r + 4, 6, 0, Math.PI * 2); ctx.fillStyle = '#fed7aa'; ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(px - 2, py - r + 3, 1, 2); ctx.fillRect(px + 2, py - r + 3, 1, 2);

    ctx.restore();

    if (teclas['w'] || teclas['arrowup']) jug.y -= jug.v; if (teclas['s'] || teclas['arrowdown']) jug.y += jug.v;
    if (teclas['a'] || teclas['arrowleft']) jug.x -= jug.v; if (teclas['d'] || teclas['arrowright']) jug.x += jug.v;

    jug.x = Math.max(-dW + 15, Math.min(dW - 15, jug.x));
    jug.y = Math.max(-dH + 15, Math.min(dH - 15, jug.y));

    [pFab, pPer, pDef, pExp].forEach(p => {
        let d = Math.sqrt((jug.x - p.x)**2 + (jug.y - p.y)**2);
        if (d < jug.r + p.radio) {
            if (p.cat === 'expansion') {
                if (dineroBilletera >= costeExpansion && nivelExpansion < 3) {
                    dineroBilletera -= costeExpansion; tamanoMapa += 0.25; nivelExpansion++; costeExpansion = Math.round(costeExpansion * 3.5);
                    jug.y += 45; actualizarHUD();
                }
            } else {
                let cat = p.cat, idx = mejorasCompradas[cat], item = bActivo[cat][idx];
                if (item && dineroBilletera >= item.c) {
                    dineroBilletera -= item.c; mejorasCompradas[cat]++;
                    if (cat === 'maquinas') {
                        // Las fábricas se distribuyen por las nuevas zonas laterales del mapa ampliado
                        let lX = -310 + ((idx % 4) * 160);
                        let lY = -240 + (Math.floor(idx / 4) * 80);
                        fabricasFisicas.push({ nombre: item.n, x: lX, y: lY, h: 55 + (idx * 10), color: bando === 'usa' ? '#1d4ed8' : '#c2410c' });
                    }
                    if (item.mejora === 'velocidad_cinta') velH += 1.8;
                    if (item.mejora === 'velocidad_personaje') jug.v += 1.5;
                    jug.y += 45; actualizarHUD();
                }
            }
        }
    });
    requestAnimationFrame(render);
}
