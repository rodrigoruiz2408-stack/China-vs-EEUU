let bandoActivo = 'usa', divisa = '\$', dinero = 100, dineroBoveda = 0, multiplicadorEconomia = 1;
const listaUsa = ["Oficina de Software", "Centro de Servidores LED", "Mega-Fábrica Microchips", "Satélite de Espionaje", "Matriz Cuántica IA"];
const listaChina = ["Taller de Ensamblaje", "Fábrica Automatizada", "Giga-Fábrica de Litio", "Puerto de Carga Robot", "Red Global de Tierras Raras"];
let edificiosComprados = [], meshEdificios = [], billetesFlotantes = [];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f1d);
scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const luzSol = new THREE.DirectionalLight(0xffffff, 1.2);
luzSol.position.set(15, 30, 20);
luzSol.castShadow = true;
scene.add(luzSol);
scene.add(new THREE.AmbientLight(0x3a4b7c, 0.6));

const suelo = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 60), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }));
suelo.position.y = -0.25; suelo.receiveShadow = true; scene.add(suelo);

const gridHelper = new THREE.GridHelper(60, 30, 0x3b82f6, 0x22314d);
gridHelper.position.y = 0.01; scene.add(gridHelper);

const jugador = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 }));
jugador.position.set(0, 1.1, 8); jugador.castShadow = true; scene.add(jugador);

function crearBotonTycoon(x, z, colorHex) {
    const grupo = new THREE.Group(); grupo.position.set(x, 0, z);
    const centro = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 32), new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.6 }));
    centro.position.y = 0.05; centro.castShadow = true; grupo.add(centro);
    const luz = new THREE.PointLight(colorHex, 1.5, 5); luz.position.set(0, 1, 0); grupo.add(luz);
    scene.add(grupo); return { obj: grupo, centro: centro, x: x, z: z, r: 2 };
}

let botonCompra = crearBotonTycoon(-6, 2, 0x22c55e);
let botonCobro = crearBotonTycoon(6, 2, 0xeab308);

const inputsTeclado = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', e => { if (e.key in inputsTeclado) inputsTeclado[e.key] = true; });
window.addEventListener('keyup', e => { if (e.key in inputsTeclado) inputsTeclado[e.key] = false; });

function obtenerCosteSiguiente() { return Math.round(50 * Math.pow(2.3, edificiosComprados.length)); }

function seleccionarBando(nuevoBando) {
    if (bandoActivo !== nuevoBando) {
        bandoActivo = nuevoBando; divisa = bandoActivo === 'usa' ? '\$' : '¥';
        jugador.material.color.setHex(bandoActivo === 'usa' ? 0x3b82f6 : 0xeab308);
        scene.background.setHex(bandoActivo === 'usa' ? 0x0a0f1d : 0x241105);
        scene.fog.color.setHex(bandoActivo === 'usa' ? 0x0a0f1d : 0x241105);
        gridHelper.material.color.setHex(bandoActivo === 'usa' ? 0x3b82f6 : 0xeab308);
        document.getElementById('ui-borde').style.borderLeftColor = bandoActivo === 'usa' ? '#3b82f6' : '#eab308';
        meshEdificios.forEach(m => scene.remove(m.obj));
        billetesFlotantes.forEach(b => scene.remove(b.obj));
        meshEdificios = []; billetesFlotantes = []; edificiosComprados = [];
        dinero = 100; dineroBoveda = 0; multiplicadorEconomia = 1; actualizarInterfaz();
    }
}

function actualizarInterfaz() {
    let listaActual = bandoActivo === 'usa' ? listaUsa : listaChina;
    let cost = obtenerCosteSiguiente();
    let msgSiguiente = edificiosComprados.length < listaActual.length ? `Siguiente: ${listaActual[edificiosComprados.length]} (${divisa}${cost})` : "¡Imperio Máximo! 🏆";
    document.getElementById('money-display').innerText = `${divisa}${dinero}`;
    document.getElementById('vault-display').innerText = `📦 En la Bóveda: ${divisa}${dineroBoveda}`;
    document.getElementById('next-display').innerText = msgSiguiente;
}

setInterval(() => {
    if (edificiosComprados.length > 0) {
        let rendimientoTotal = 0;
        edificiosComprados.forEach((ed, idx) => {
            rendimientoTotal += (idx + 1) * 8;
            crearEfectoBillete(ed.pos3D);
        });
        dineroBoveda += Math.round(rendimientoTotal * multiplicadorEconomia);
        actualizarInterfaz();
    }
}, 1500);

setInterval(() => {
    let probabilidad = Math.random(), panelAlerta = document.getElementById('alerta');
    if (probabilidad < 0.55) {
        multiplicadorEconomia = 0.4;
        panelAlerta.innerText = bandoActivo === 'usa' ? "🚨 ¡China impone Aranceles! Ganancias -60%" : "🚨 ¡Bloqueo de EE.UU.! Ganancias -60%";
        panelAlerta.style.display = 'block';
    } else { multiplicadorEconomia = 1; panelAlerta.style.display = 'none'; }
}, 12000);

function construirSiguienteEdificio3D() {
    let listaActual = bandoActivo === 'usa' ? listaUsa : listaChina, coste = obtenerCosteSiguiente();
    if (dinero >= coste && edificiosComprados.length < listaActual.length) {
        dinero -= coste;
        let indice = edificiosComprados.length, posX = -16 + (indice * 8), posZ = -8 - (Math.abs(2 - indice) * 2), posMeta3D = new THREE.Vector3(posX, 0, posZ);
        const modeloGrupo = new THREE.Group(); modeloGrupo.position.copy(posMeta3D);
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, 5), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        baseMesh.position.y = 0.3; baseMesh.castShadow = true; modeloGrupo.add(baseMesh);
        let altoEdificio = 5 + Math.random() * 5;
        const estructuraMesh = new THREE.Mesh(new THREE.BoxGeometry(4, altoEdificio, 4), new THREE.MeshStandardMaterial({ color: bandoActivo === 'usa' ? 0x1e3a8a : 0x9a3412, roughness: 0.3 }));
        estructuraMesh.position.y = altoEdificio / 2 + 0.6; estructuraMesh.castShadow = true; modeloGrupo.add(estructuraMesh);
        scene.add(modeloGrupo);
        meshEdificios.push({ obj: modeloGrupo });
        edificiosComprados.push({ name: listaActual[indice], pos3D: posMeta3D });
        jugador.position.z += 2; actualizarInterfaz();
    }
}

function crearEfectoBillete(origenVector) {
    const meshBillete = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
    meshBillete.position.copy(origenVector); meshBillete.position.y = 3; scene.add(meshBillete);
    billetesFlotantes.push({ obj: meshBillete, destino: new THREE.Vector3(botonCobro.x, 0.5, botonCobro.z), progreso: 0, velocidad: 0.025 });
}

const reloj = new THREE.Clock();
function bucleGraficoPro() {
    requestAnimationFrame(bucleGraficoPro); const delta = reloj.getDelta();
    let speed = 11 * delta, movX = 0, movZ = 0;
    if (inputsTeclado.w || inputsTeclado.ArrowUp) movZ -= speed;
    if (inputsTeclado.s || inputsTeclado.ArrowDown) movZ += speed;
    if (inputsTeclado.a || inputsTeclado.ArrowLeft) movX -= speed;
    if (inputsTeclado.d || inputsTeclado.ArrowRight) movX += speed;
    jugador.position.x += movX; jugador.position.z += movZ;
    if (movX !== 0 || movZ !== 0) jugador.rotation.y = Math.atan2(movX, movZ);
    jugador.position.x = Math.max(-28, Math.min(28, jugador.position.x));
    jugador.position.z = Math.max(-28, Math.min(28, jugador.position.z));
    camera.position.x += (jugador.position.x - camera.position.x) * 0.08;
    camera.position.y += ((jugador.position.y + 14) - camera.position.y) * 0.08;
    camera.position.z += ((jugador.position.z + 14) - camera.position.z) * 0.08;
    camera.lookAt(jugador.position);
    for (let i = billetesFlotantes.length - 1; i >= 0; i--) {
        let b = billetesFlotantes[i]; b.progreso += b.velocidad; b.obj.position.lerpVectors(b.obj.position, b.destino, b.progreso);
        if (b.obj.position.distanceTo(b.destino) < 0.5) { scene.remove(b.obj); billetesFlotantes.splice(i, 1); }
    }
    botonCompra.centro.rotation.y += 0.02; botonCobro.centro.rotation.y += 0.02;
    let distCompra = jugador.position.distanceTo(new THREE.Vector3(botonCompra.x, jugador.position.y, botonCompra.z));
    if (distCompra < 2.2) { botonCompra.obj.scale.set(1, 0.4, 1); construirSiguienteEdificio3D(); } else { botonCompra.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); }
    let distCobro = jugador.position.distanceTo(new THREE.Vector3(botonCobro.x, jugador.position.y, botonCobro.z));
    if (distCobro < 2.2) {
        botonCobro.obj.scale.set(1, 0.4, 1);
        if (dineroBoveda > 0) { dinero += dineroBoveda; dineroBoveda = 0; jugador.position.z += 2; actualizarInterfaz(); }
    } else { botonCobro.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); }
    renderer.render(scene, camera);
}
actualizarInterfaz(); bucleGraficoPro();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
