const canvas = document.getElementById('lienzoJuego'), ctx = canvas.getContext('2d');
function res() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', res); res();

let jug = { x: 0, y: 140, r: 14, color: '#3b82f6', v: 9.5 }, velH = 3.5;
let pFab = { x: -140, y: 80, radio: 28, color: '#22c55e', texto: 'FÁBRICA', cat: 'maquinas' };
let pPer = { x: 0, y: 80, radio: 28, color: '#a855f7', texto: 'PERSONAL', cat: 'personal' };
let pDef = { x: 140, y: 80, radio: 28, color: '#3b82f6', texto: 'DEFENSA', cat: 'defensa' };
let zVent = { x: 240, y: -80, w: 60, h: 60 }, teclas = {};

window.addEventListener('keydown', e => teclas[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => teclas[e.key.toLowerCase()] = false);

function iniciarConBando(sel) {
    bando = sel; divisa = bando === 'usa' ? '$' : '¥';
    jug.color = bando === 'usa' ? '#3b82f6' : '#eab308';
    document.getElementById('borde-bando-ui').style.borderLeftColor = jug.color;
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('ui-juego').style.display = 'flex';
    dineroBilletera = 150; productosEnCinta = []; fabricasFisicas = [];
    mejorasCompradas = { maquinas: 0, personal: 0, defensa: 0 };
    actualizarHUD();
    setInterval(() => {
        let b = bando === 'usa' ? comprasUSA : comprasChina;
        for (let i = 0; i < mejorasCompradas.maquinas; i++) {
            productosEnCinta.push({ x: -200 + (i * 90), y: -100, txt: b.maquinas[i].prod, valor: b.maquinas[i].v * 5, tx: zVent.x });
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
    ctx.fillStyle = bando === 'usa' ? '#0c111d' : '#221003'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-canvas.width * 0.44, -canvas.height * 0.38, canvas.width * 0.88, canvas.height * 0.72);
    ctx.fillStyle = '#475569'; ctx.fillRect(-220, -105, 480, 12);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-220, -102, 480, 6);
    ctx.fillStyle = '#334155';
    let des = (Date.now() / 20) % 30;
    for(let gx = -220 + des; gx < 260; gx += 30) ctx.fillRect(gx, -102, 4, 6);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(zVent.x, zVent.y, zVent.w, zVent.h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText("EXPORTACIÓN", zVent.x + 30, zVent.y + 34);

    let base = bando === 'usa' ? comprasUSA : comprasChina;
    let cM = mejorasCompradas.maquinas < base.maquinas.length ? divisa + base.maquinas[mejorasCompradas.maquinas].c : 'MAX';
    let cP = mejorasCompradas.personal < base.personal.length ? divisa + base.personal[mejorasCompradas.personal].c : 'MAX';
    let cD = mejorasCompradas.defensa < base.defensa.length ? divisa + base.defensa[mejorasCompradas.defensa].c : 'MAX';

    pPad(pFab, cM !== 'MAX' && dineroBilletera >= base.maquinas[mejorasCompradas.maquinas].c, cM);
    pPad(pPer, cP !== 'MAX' && dineroBilletera >= base.personal[mejorasCompradas.personal].c, cP);
    pPad(pDef, cD !== 'MAX' && dineroBilletera >= base.defensa[mejorasCompradas.defensa].c, cD);

    fabricasFisicas.forEach(f => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(f.x - 16, f.y - f.h + 6, 36, f.h);
        ctx.fillStyle = f.color; ctx.fillRect(f.x - 20, f.y - f.h, 40, f.h);
        ctx.fillStyle = bando === 'usa' ? '#00f0ff' : '#ffcc00';
        ctx.fillRect(f.x - 12, f.y - f.h + 10, 6, 8); ctx.fillRect(f.x + 6, f.y - f.h + 10, 6, 8);
        ctx.fillStyle = '#fff'; ctx.fillRect(f.x - 20, f.y - f.h, 40, 5);
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 7px sans-serif'; ctx.fillText(f.nombre, f.x, f.y + 12);
    });

    for (let i = productosEnCinta.length - 1; i >= 0; i--) {
        let pr = productosEnCinta[i]; pr.x += velH;
        ctx.fillStyle = bando === 'usa' ? '#3b82f6' : '#eab308'; ctx.fillRect(pr.x - 12, pr.y - 6, 24, 12);
        ctx.fillStyle = '#fff'; ctx.font = '7px sans-serif'; ctx.fillText(pr.txt, pr.x, pr.y + 3);
        if (pr.x >= pr.tx) { dineroBilletera += Math.round(pr.valor * multiplicadorArancel); productosEnCinta.splice(i, 1); actualizarHUD(); }
    }

    let px = jug.x, py = jug.y, r = jug.radio;
    ctx.fillStyle = '#1e293b'; let osc = Math.sin(Date.now() / 100) * 4;
    ctx.fillRect(px - 5, py + r - 4, 3, 7 + osc); ctx.fillRect(px + 2, py + r - 4, 3, 7 - osc);
    ctx.fillStyle = jug.color; ctx.fillRect(px - r, py - r + 4, r * 2, r * 2 - 4);
    ctx.beginPath(); ctx.arc(px, py - r + 4, 6, 0, Math.PI*2); ctx.fillStyle = '#fed7aa'; ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(px - 2, py - r + 3, 1, 2); ctx.fillRect(px + 2, py - r + 3, 1, 2);
    ctx.restore();

    if (teclas['w'] || teclas['arrowup']) jug.y -= jug.v; if (teclas['s'] || teclas['arrowdown']) jug.y += jug.v;
    if (teclas['a'] || teclas['arrowleft']) jug.x -= jug.v; if (teclas['d'] || teclas['arrowright']) jug.x += jug.v;

    jug.x = Math.max(-canvas.width * 0.42, Math.min(canvas.width * 0.42, jug.x));
    jug.y = Math.max(-canvas.height * 0.36, Math.min(canvas.height * 0.36, jug.y));

    [pFab, pPer, pDef].forEach(p => {
        let d = Math.sqrt((jug.x - p.x)**2 + (jug.y - p.y)**2);
        if (d < jug.radio + p.radio) {
            let cat = p.cat, idx = mejorasCompradas[cat], item = base[cat][idx];
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
    });
    requestAnimationFrame(render);
}
