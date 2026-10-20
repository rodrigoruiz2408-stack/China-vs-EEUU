const cv = document.getElementById('lienzoJuego'), cx = cv.getContext('2d');
function res() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
window.addEventListener('resize', res); res();

let jug = { x: 0, y: 100, r: 14, color: '#3b82f6', v: 8 }, velH = 3.2, zm = 1.0;
let zV = { x: 250, y: -230, w: 70, h: 70 }, tc = {};
let tMap = 0.6, cExp = 150, nExp = 0;

let pFab = { x: -220, y: -160, radio: 24, color: '#22c55e', cat: 'maquinas', texto: 'MÁQUINA' };
let pPer = { x: 0, y: 40, radio: 24, color: '#a855f7', cat: 'personal', texto: 'PERSONAL' };
let pDef = { x: -200, y: 140, radio: 24, color: '#3b82f6', cat: 'defensa', texto: 'DEFENSA' };
let pExp = { x: 200, y: 140, radio: 24, color: '#f97316', cat: 'expansion', texto: 'AMPLIAR' };
let pClk = { x: -220, y: -60, radio: 25, color: '#06b6d4', texto: 'CLICK 🛠️' };

window.addEventListener('wheel', e => { zm = Math.max(0.5, Math.min(1.8, zm + e.deltaY * -0.001)); }, { passive: true });
window.addEventListener('keydown', e => tc[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => tc[e.key.toLowerCase()] = false);

window.addEventListener('mousedown', e => {
    if (e.target.tagName !== 'BUTTON' && bando !== '') {
        let clkX = (e.clientX - cv.width / 2) / zm, clkY = (e.clientY - cv.height / 2) / zm;
        if (Math.sqrt((clkX - pClk.x)**2 + (clkY - pClk.y)**2) < pClk.radio) {
            let b = bando === 'usa' ? comprasUSA : comprasChina;
            productosEnCinta.push({ x: -220, y: -225, txt: b.maquinas[0].prod, valor: b.maquinas[0].v * 5, tx: zV.x });
        } else { jug.x = clkX; jug.y = clkY; }
    }
});

function iniciarConBando(sel) {
    bando = sel; divisa = bando === 'usa' ? '$' : '¥';
    jug.color = bando === 'usa' ? '#3b82f6' : '#eab308';
    document.getElementById('borde-bando-ui').style.borderLeftColor = jug.color;
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('ui-juego').style.display = 'flex';
    dineroBilletera = 100; productosEnCinta = []; fabricasFisicas = []; trabajadoresFisicos = []; tMap = 0.6; cExp = 150; nExp = 0;
    mejorasCompradas = { maquinas: 1, personal: 0, defensa: 0 };
    
    let b = bando === 'usa' ? comprasUSA : comprasChina;
    fabricasFisicas.push({ nombre: b.maquinas[0].n, x: -220, y: -230, h: 45, color: '#475569' });

    setInterval(() => {
        let bAct = bando === 'usa' ? comprasUSA : comprasChina;
        for (let i = 1; i < mejorasCompradas.maquinas; i++) {
            if (productosEnCinta.length < 25) {
                productosEnCinta.push({ x: -220 + (i * 90), y: -225, txt: bAct.maquinas[i].prod, valor: bAct.maquinas[i].v * 5, tx: zV.x });
            }
        }
    }, 1600);

    setInterval(() => {
        let az = Math.random(), div = document.getElementById('alerta-arancel');
        if (az < 0.55 && mejorasCompradas.defensa === 0) {
            multiplicadorArancel = 0.3; div.style.display = 'block';
            div.innerText = bando === 'usa' ? "🚨 ¡Aranceles de China! Valor -70%" : "🚨 ¡Sanciones de EE.UU.! Valor -70%";
        } else { multiplicadorArancel = 1; div.style.display = 'none'; }
    }, 11000);
    requestAnimationFrame(render);
}

function pPad(p, act, cost) {
    cx.beginPath(); cx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
    cx.fillStyle = p.color; cx.globalAlpha = act ? 0.95 : 0.3; cx.fill(); cx.globalAlpha = 1;
    cx.lineWidth = 2; cx.strokeStyle = '#fff'; cx.stroke();
    cx.fillStyle = '#fff'; cx.font = 'bold 8px sans-serif'; cx.textAlign = 'center';
    cx.fillText(p.texto, p.x, p.y - 2); cx.font = '6px sans-serif'; cx.fillText(cost, p.x, p.y + 7);
}

function render() {
    let bA = bando === 'usa' ? comprasUSA : comprasChina;
    cx.fillStyle = bando === 'usa' ? '#080c14' : '#1a0a02'; cx.fillRect(0, 0, cv.width, cv.height);
    cx.save(); cx.translate(cv.width / 2, cv.height / 2); cx.scale(zm, zm);

    cx.fillStyle = '#1e293b'; let dW = 420 * tMap, dH = 340 * tMap; cx.fillRect(-dW, -dH, dW * 2, dH * 2);
    cx.strokeStyle = bando === 'usa' ? 'rgba(56,189,248,0.05)' : 'rgba(234,179,8,0.04)'; cx.lineWidth = 1;
    for(let lx = -dW; lx <= dW; lx += 40) { cx.beginPath(); cx.moveTo(lx, -dH); cx.lineTo(lx, dH); cx.stroke(); }

    cx.fillStyle = '#334155'; cx.fillRect(-240, -230, 490, 10);
    cx.fillStyle = '#0f172a'; cx.fillRect(-240, -227, 490, 4);
    cx.fillStyle = '#16a34a'; cx.fillRect(zV.x, zV.y, zV.w, zV.h);
    cx.fillStyle = '#fff'; cx.font = 'bold 8px sans-serif'; cx.textAlign = 'center'; cx.fillText("EXPORTAR", zV.x + 35, zV.y + 40);

    let cM = mejorasCompradas.maquinas < bA.maquinas.length ? divisa + bA.maquinas[mejorasCompradas.maquinas].c : 'MAX';
    let cP = mejorasCompradas.personal < bA.personal.length ? divisa + bA.personal[mejorasCompradas.personal].c : 'MAX';
    let cD = mejorasCompradas.defensa < bA.defensa.length ? divisa + bA.defensa[mejorasCompradas.defensa].c : 'MAX';
    let cE = nExp < 3 ? divisa + cExp : 'MAX';

    pPad(pFab, cM !== 'MAX' && dineroBilletera >= bA.maquinas[mejorasCompradas.maquinas].c, cM);
    pPad(pPer, cP !== 'MAX' && dineroBilletera >= bA.personal[mejorasCompradas.personal].c, cP);
    pPad(pDef, cD !== 'MAX' && dineroBilletera >= bA.defensa[mejorasCompradas.defensa].c, cD);
    pPad(pExp, cE !== 'MAX' && dineroBilletera >= cExp, cE);
    pPad(pClk, true, "CLICK 🛠️");

    fabricasFisicas.forEach(f => {
        cx.fillStyle = 'rgba(0,0,0,0.3)'; cx.fillRect(f.x - 18, f.y - f.h + 6, 36, f.h);
        cx.fillStyle = f.color; cx.fillRect(f.x - 20, f.y - f.h, 40, f.h);
        cx.fillStyle = '#fff'; cx.fillRect(f.x - 20, f.y - f.h, 40, 5);
        cx.fillStyle = '#94a3b8'; cx.font = 'bold 7px sans-serif'; cx.fillText(f.nombre.substring(0,14), f.x, f.y + 12);
    });

    trabajadoresFisicos.forEach(t => {
        cx.fillStyle = '#fed7aa'; cx.beginPath(); cx.arc(t.x, t.y - 12, 5, 0, Math.PI*2); cx.fill();
        cx.fillStyle = '#ef4444'; cx.fillRect(t.x - 6, t.y - 7, 12, 12);
        cx.fillStyle = '#000'; cx.fillRect(t.x - 4, t.y + 5, 3, 4); cx.fillRect(t.x + 1, t.y + 5, 3, 4);
    });

    for (let i = productosEnCinta.length - 1; i >= 0; i--) {
        let pr = productosEnCinta[i]; pr.x += velH;
        cx.fillStyle = bando === 'usa' ? '#3b82f6' : '#eab308'; cx.fillRect(pr.x - 12, pr.y - 6, 24, 12);
        cx.fillStyle = '#fff'; cx.font = '6px sans-serif'; cx.fillText(pr.txt.substring(0,5), pr.x, pr.y + 3);
        if (pr.x >= pr.tx) { dineroBilletera += Math.round(pr.valor * multiplicadorArancel); productosEnCinta.splice(i, 1); actualizarHUD(); }
    }

    let px = jug.x, py = jug.y, r = jug.r;
    cx.fillStyle = '#0f172a'; let osc = Math.sin(Date.now() / 90) * 4;
    cx.fillRect(px - 5, py + r - 3, 3, 6 + osc); cx.fillRect(px + 2, py + r - 3, 3, 6 - osc);
    cx.fillStyle = jug.color; cx.fillRect(px - r, py - r + 4, r * 2, r * 2 - 4);
    cx.beginPath(); cx.arc(px, py - r + 4, 6, 0, Math.PI * 2); cx.fillStyle = '#fed7aa'; cx.fill();
    cx.fillStyle = '#000'; cx.fillRect(px - 2, py - r + 3, 1, 2); cx.fillRect(px + 2, py - r + 3, 1, 2);
    cx.restore();

    if (tc['w'] || tc['arrowup']) jug.y -= jug.v; if (tc['s'] || tc['arrowdown']) jug.y += jug.v;
    if (tc['a'] || tc['arrowleft']) jug.x -= jug.v; if (tc['d'] || tc['arrowright']) jug.x += jug.v;

    let lX = dW * 0.9, lY = dH * 0.9;
    jug.x = Math.max(-lX, Math.min(lX, jug.x)); jug.y = Math.max(-lY, Math.min(lY, jug.y));

    [pFab, pPer, pDef, pExp].forEach(p => {
        if (Math.sqrt((jug.x - p.x)**2 + (jug.y - p.y)**2) < jug.r + p.radio) {
            if (p.cat === 'expansion' && dineroBilletera >= cExp && nExp < 3) {
                dineroBilletera -= cExp; tMap += 0.25; nExp++; cExp = Math.round(cExp * 3); jug.y += 40; actualizarHUD();
            } else if (p.cat !== 'expansion') {
                let cat = p.cat, idx = mejorasCompradas[cat], it = bA[cat][idx];
                if (it && dineroBilletera >= it.c) {
                    dineroBilletera -= it.c; mejorasCompradas[cat]++;
                    if (cat === 'maquinas') fabricasFisicas.push({ nombre: it.n, x: -220 + (idx * 90), y: -230, h: 50 + (idx * 10), color: bando === 'usa' ? '#1e40af' : '#b45309' });
                    if (cat === 'personal') { trabajadoresFisicos.push({ x: it.x, y: it.y }); velH += 2.0; }
                    jug.y += 40; actualizarHUD();
                }
            }
        }
    });
    requestAnimationFrame(render);
}

