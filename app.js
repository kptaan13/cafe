/**
 * Virtual Café — Mixed reality MVP (phone as viewer)
 * Move your phone to look around the scene. A "table" window in the scene
 * shows your real camera feed (food & drinks). No VR headset.
 */
import * as THREE from 'three';
const video = document.getElementById('camera-video');
const canvas = document.getElementById('scene-canvas');
const hint = document.getElementById('hint');
const startBtn = document.getElementById('start-btn');
let scene, camera, renderer;
let tablePlane = null;
let orientationEnabled = false;
let orientationListenerAdded = false;
let initialAlpha = null;
let initialBeta = null;
let currentAlpha = 0;
let currentBeta = 0;
let dragYaw = 0, dragPitch = 0;
let isDragging = false;
let lastPointerX = 0, lastPointerY = 0;

const TEXTURE_PATHS = {
  sand: 'assets/sand.jpg',
  water: 'assets/water.jpg',
  shore: 'assets/shore.jpg',
  rock: 'assets/rock.jpg',
  bark: 'assets/bark.jpg',
  leaves: 'assets/leaves.jpg',
  sky: 'assets/sky.jpg'
};

const PANORAMA_PATHS = [ 'assets/panorama.jpg', 'assets/panorama.png', 'assets/360.jpg', 'assets/360.png' ];

const ONLINE_PANORAMAS = [
  { name: 'Comfy Café', url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/comfy_cafe.jpg', jpg: true },
  { name: 'Bush Restaurant', url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/bush_restaurant.jpg', jpg: true },
  { name: 'Venice sunset', url: 'https://cdn.apewebapps.com/threejs/162/examples/textures/equirectangular/venice_sunset_1k.hdr', jpg: false },
  { name: 'Blouberg sunrise', url: 'https://cdn.apewebapps.com/threejs/162/examples/textures/equirectangular/blouberg_sunrise_2_1k.hdr', jpg: false },
  { name: 'Royal esplanade', url: 'https://cdn.apewebapps.com/threejs/162/examples/textures/equirectangular/royal_esplanade_1k.hdr', jpg: false },
  { name: 'Quarry', url: 'https://cdn.apewebapps.com/threejs/162/examples/textures/equirectangular/quarry_01_1k.hdr', jpg: false },
  { name: 'Pedestrian bridge', url: 'https://cdn.apewebapps.com/threejs/162/examples/textures/equirectangular/pedestrian_overpass_1k.hdr', jpg: false },
  { name: 'Golf night', url: 'https://cdn.apewebapps.com/threejs/162/examples/textures/equirectangular/moonless_golf_1k.hdr', jpg: false }
];
function loadPanorama() {
  const base = typeof window !== 'undefined' && window.location ? window.location.origin + '/' : '';
  return new Promise((resolve) => {
    const tryLocal = (i) => {
      if (i >= PANORAMA_PATHS.length) {
        tryOnline(0);
        return;
      }
      const url = base + PANORAMA_PATHS[i];
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => resolve({ tex, hdr: false }), undefined, () => tryLocal(i + 1));
    };
    const tryOnline = (i) => {
      if (i >= ONLINE_PANORAMAS.length) {
        resolve(null);
        return;
      }
      const { url, jpg } = ONLINE_PANORAMAS[i];
      if (jpg) {
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => resolve({ tex, hdr: false }), undefined, () => tryOnline(i + 1));
      }
 else {
        import('three/examples/jsm/loaders/RGBELoader.js').then(({ RGBELoader }) => {
          const loader = new RGBELoader();
          loader.load(url, (tex) => resolve({ tex, hdr: true }), undefined, () => tryOnline(i + 1));
        }).catch(() => tryOnline(i + 1));
      }
    };
    tryLocal(0);
  });
}
const SEATED_EYE_Y = 0.5;
const SEATED_EYE_Z = 0.12;
const TABLE_SURFACE_Y = -0.18;
const TABLE_Z = 0.45;
const SEATED_LOOK_DOWN_RAD = -0.32;
let tableGroup = null;
let cutoutMesh = null;
function buildPanoramaScene(panoramaTexture, isHdr = false) {
  tableGroup = null;
  cutoutMesh = null;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, SEATED_EYE_Y, SEATED_EYE_Z);
  camera.rotation.order = 'YXZ';
  camera.lookAt(0, TABLE_SURFACE_Y, TABLE_Z);
  if (isHdr && renderer) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  const material = new THREE.MeshBasicMaterial({
    map: panoramaTexture,    side: THREE.BackSide,    toneMapped: isHdr  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  addTable(true);
}
function loadTexture(url, repeatX = 1, repeatY = 1) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(      url,      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        resolve(tex);
      },      undefined,      () => resolve(null)    );
  });
}
function applyTextures(mats) {
  const base = typeof window !== 'undefined' && window.location ? window.location.origin + '/' : '';
  Promise.all([    loadTexture(base + TEXTURE_PATHS.sand, 15, 10).then(t => {
 if (t && mats.sand) mats.sand.map = t;
 }),    loadTexture(base + TEXTURE_PATHS.water, 20, 12).then(t => {
 if (t && mats.water) mats.water.map = t;
 }),    loadTexture(base + TEXTURE_PATHS.shore, 12, 2).then(t => {
 if (t && mats.shore) mats.shore.map = t;
 }),    loadTexture(base + TEXTURE_PATHS.rock).then(t => {
 if (t && mats.rock) mats.rock.map = t;
 }),    loadTexture(base + TEXTURE_PATHS.bark, 1, 4).then(t => {
 if (t && mats.bark) mats.bark.map = t;
 }),    loadTexture(base + TEXTURE_PATHS.leaves, 2, 2).then(t => {
 if (t && mats.leaves) mats.leaves.map = t;
 }),    loadTexture(base + TEXTURE_PATHS.sky, 1, 1).then(t => {
 if (t && mats.sky) {
 mats.sky.map = t;
 mats.sky.side = THREE.BackSide;
 }
 })  ]).catch(() => {
});
}
function resize() {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
}
function buildScene() {
  tableGroup = null;
  cutoutMesh = null;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.2, 3);
  camera.rotation.order = 'YXZ';

  const skyMat = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xE8D5B7 });
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x1e90ff });
  const shoreMat = new THREE.MeshLambertMaterial({ color: 0xF5E6C8 });
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x5c5c5c });
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const leavesMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });

  const skyGeo = new THREE.SphereGeometry(80, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.position.y = -0.5;
  scene.add(sky);
  const sunGeo = new THREE.SphereGeometry(8, 24, 24);
  const sun = new THREE.Mesh(sunGeo, new THREE.MeshBasicMaterial({
 color: 0xFFEE88 }));
  sun.position.set(25, 35, -45);
  scene.add(sun);
  const oceanGeo = new THREE.PlaneGeometry(120, 60);
  const ocean = new THREE.Mesh(oceanGeo, waterMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.3, -15);
  scene.add(ocean);
  const sandGeo = new THREE.PlaneGeometry(100, 50);
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, -0.5, 5);
  scene.add(sand);
  const shoreGeo = new THREE.PlaneGeometry(80, 8);
  const shore = new THREE.Mesh(shoreGeo, shoreMat);
  shore.rotation.x = -Math.PI / 2;
  shore.position.set(0, -0.45, -2);
  scene.add(shore);
  [-4, 2, 3.5].forEach((x, i) => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.4 + i * 0.15, 12, 12), rockMat);
    r.position.set(x, 0, 1 - i * 0.5);
    scene.add(r);
  });
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2.5, 12);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(-3, 0.8, -1);
  scene.add(trunk);
  const leavesGeo = new THREE.ConeGeometry(1.2, 1.8, 8);
  const leaves = new THREE.Mesh(leavesGeo, leavesMat);
  leaves.position.set(-3, 2.2, -1);
  scene.add(leaves);
  const trunk2 = new THREE.Mesh(trunkGeo.clone(), trunkMat);
  trunk2.position.set(4, 0.6, -5);
  trunk2.scale.setScalar(0.7);
  scene.add(trunk2);
  const leaves2 = new THREE.Mesh(leavesGeo.clone(), leavesMat);
  leaves2.position.set(4, 1.8, -5);
  leaves2.scale.setScalar(0.7);
  scene.add(leaves2);  // Third palm (mid-distance)  const trunk3 = new THREE.Mesh(trunkGeo.clone(), trunkMat);
  trunk3.position.set(-5, 0.7, -8);
  trunk3.scale.set(0.85, 0.9, 0.85);
  scene.add(trunk3);
  const leaves3 = new THREE.Mesh(leavesGeo.clone(), leavesMat);
  leaves3.position.set(-5, 2, -8);
  leaves3.scale.setScalar(0.85);
  scene.add(leaves3);

  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cloudPositions = [
    [ -15, 18, -50 ], [ -10, 20, -52 ], [ -5, 17, -51 ],
    [ 20, 22, -55 ], [ 25, 19, -54 ], [ 30, 21, -56 ],
    [ 0, 25, -60 ], [ 8, 23, -58 ]
  ];
  cloudPositions.forEach(([ x, y, z ], i) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(6 + (i % 3) * 2, 12, 8), cloudMat);
    c.position.set(x, y, z);
    c.scale.set(1, 0.6, 1.2);
    scene.add(c);
  });

  const foamGeo = new THREE.PlaneGeometry(90, 4);
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xb8d4e8 });
  const foam = new THREE.Mesh(foamGeo, foamMat);
  foam.rotation.x = -Math.PI / 2;
  foam.position.set(0, -0.35, -4);
  scene.add(foam);

  const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x2c1810 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(2.5, 1.1, 0.5);
  scene.add(pole);
  const canopyGeo = new THREE.ConeGeometry(0.9, 0.6, 8);
  const canopyMat = new THREE.MeshLambertMaterial({
 color: 0xe74c3c });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(2.5, 2.3, 0.5);
  canopy.rotation.x = Math.PI / 2;
  scene.add(canopy);  // Beach towel (strip on sand)  const towelGeo = new THREE.PlaneGeometry(1.8, 0.8);
  const towelMat = new THREE.MeshLambertMaterial({
 color: 0x3498db });
  const towel = new THREE.Mesh(towelGeo, towelMat);
  towel.rotation.x = -Math.PI / 2;
  towel.position.set(-2, -0.48, 0.8);
  towel.rotation.z = 0.15;
  scene.add(towel);

  const shellMat = new THREE.MeshLambertMaterial({ color: 0xf5deb3 });
  [ [ -1.5, 0.1, 1.2 ], [ -1.2, 0.08, 1.5 ], [ 1.8, 0.06, 0.9 ], [ 2.1, 0.09, 1.1 ] ].forEach(([ x, y, z ]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), shellMat);
    s.position.set(x, y, z);
    scene.add(s);
  });
  [ [ 3, 0.15, -1 ], [ -3.5, 0.2, 0.5 ], [ 0.5, 0.12, 1.8 ] ].forEach(([ x, y, z ], i) => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.25 + i * 0.08, 10, 8), rockMat);
    r.position.set(x, y, z);
    scene.add(r);
  });

  const gullMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const gullGeo = new THREE.ConeGeometry(0.15, 0.5, 4);
  [ [ -8, 12, -35 ], [ 5, 14, -40 ], [ 12, 10, -38 ] ].forEach(([ x, y, z ]) => {
    const g = new THREE.Mesh(gullGeo, gullMat);
    g.position.set(x, y, z);
    g.rotation.z = Math.PI / 2;
    g.scale.set(1, 2, 0.3);
    scene.add(g);
  });

  const boatMat = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.8), boatMat);
  hull.position.set(18, 0.2, -25);
  scene.add(hull);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.5, 6), boatMat);
  mast.position.set(18, 1.15, -25);
  scene.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), new THREE.MeshBasicMaterial({ color: 0xecf0f1 }));
  sail.position.set(18, 1.1, -25);
  sail.rotation.y = Math.PI / 4;
  scene.add(sail);  // Bush / grass clump  const bushGeo = new THREE.SphereGeometry(0.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const bushMat = new THREE.MeshLambertMaterial({
 color: 0x27ae60 });
  const bush = new THREE.Mesh(bushGeo, bushMat);
  bush.position.set(3.5, 0.25, 1.2);
  bush.scale.set(1.2, 0.5, 1);
  scene.add(bush);
  const bush2 = new THREE.Mesh(bushGeo.clone(), bushMat);
  bush2.position.set(-4, 0.2, 0.3);
  bush2.scale.set(0.8, 0.4, 0.8);
  scene.add(bush2);
  scene.add(new THREE.AmbientLight(0xaaccff, 0.5));
  const sunLight = new THREE.DirectionalLight(0xffeedd, 1);
  sunLight.position.set(20, 40, -30);
  scene.add(sunLight);
  const fill = new THREE.DirectionalLight(0xccddff, 0.4);
  fill.position.set(-10, 10, 10);
  scene.add(fill);

  applyTextures({
    sand: sandMat,
    water: waterMat,
    shore: shoreMat,
    rock: rockMat,
    bark: trunkMat,
    leaves: leavesMat,
    sky: skyMat
  });
  addTable(true);
}

function addTable(placeholderOnly) {
  if (tableGroup && scene.children.includes(tableGroup)) return;
  tableGroup = new THREE.Group();
  const cutoutW = 0.9, cutoutH = 0.6;
  const border = 0.08;
  const tableTopW = cutoutW + border * 2, tableTopD = cutoutH + border * 2;
  const tableY = TABLE_SURFACE_Y, tableZ = TABLE_Z;
  const woodMat = new THREE.MeshLambertMaterial({
 color: 0x5c4033 });
  const tableTopGeo = new THREE.PlaneGeometry(tableTopW, tableTopD);
  const tableTop = new THREE.Mesh(tableTopGeo, woodMat);
  tableTop.rotation.x = -Math.PI / 2;
  tableTop.position.set(0, tableY, tableZ);
  tableGroup.add(tableTop);
  const thickness = 0.02;
  const legMat = new THREE.MeshLambertMaterial({
 color: 0x3d2817 });
  const legGeo = new THREE.BoxGeometry(border * 1.2, thickness, border * 1.2);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(sx * (tableTopW / 2 - border * 0.5), tableY - thickness / 2, tableZ + sz * (tableTopD / 2 - border * 0.5));
    tableGroup.add(leg);
  });
  const cutoutGeo = new THREE.PlaneGeometry(cutoutW, cutoutH);
  let cutoutMat;
  if (placeholderOnly) {
    cutoutMat = new THREE.MeshBasicMaterial({
 color: 0x2a2a2a, side: THREE.DoubleSide });
  }
 else {
    const vt = new THREE.VideoTexture(video);
    vt.minFilter = THREE.LinearFilter;
    vt.magFilter = THREE.LinearFilter;
    cutoutMat = new THREE.MeshBasicMaterial({
 map: vt, side: THREE.DoubleSide });
  }
  cutoutMesh = new THREE.Mesh(cutoutGeo, cutoutMat);
  cutoutMesh.rotation.x = -Math.PI / 2;
  cutoutMesh.position.set(0, tableY + 0.006, tableZ - 0.002);
  tableGroup.add(cutoutMesh);
  const edgeMat = new THREE.MeshBasicMaterial({
 color: 0x2c1810 });
  const edgeH = 0.01, edgeInset = 0.004;
  [    {
 w: cutoutW + edgeInset * 2, d: edgeH, x: 0, z: tableZ + cutoutH / 2 + edgeInset },    {
 w: cutoutW + edgeInset * 2, d: edgeH, x: 0, z: tableZ - cutoutH / 2 - edgeInset },    {
 w: edgeH, d: cutoutH + edgeInset * 2, x: -cutoutW / 2 - edgeInset, z: tableZ },    {
 w: edgeH, d: cutoutH + edgeInset * 2, x: cutoutW / 2 + edgeInset, z: tableZ }
  ].forEach(({
 w, d, x, z }) => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(w, d), edgeMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, tableY + 0.008, z);
    tableGroup.add(edge);
  });
  scene.add(tableGroup);
  tablePlane = tableGroup;
}
function addTableWindow() {
  if (!video.srcObject) return;
  if (cutoutMesh) {
    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    cutoutMesh.material.map = tex;
    return;
  }
  if (!tableGroup || !scene.children.includes(tableGroup)) addTable(false);
  else if (cutoutMesh) {
    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    cutoutMesh.material.map = tex;
  }
}
function onDeviceOrientation(e) {
  if (e.alpha == null || e.beta == null) return;
  if (initialAlpha == null) {
    initialAlpha = e.alpha;
    initialBeta = e.beta;
  }
  currentAlpha = e.alpha - initialAlpha;
  currentBeta = e.beta - initialBeta;
}
function setupDragFallback() {
  const scale = 0.004;
  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    dragYaw -= (e.clientX - lastPointerX) * scale;
    dragPitch -= (e.clientY - lastPointerY) * scale;
    dragPitch = Math.max(-Math.PI / 2 + 0.2, Math.min(Math.PI / 2 - 0.2, dragPitch));
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  });
  canvas.addEventListener('pointerup', () => { isDragging = false; });
  canvas.addEventListener('pointerleave', () => { isDragging = false; });
}
function applyOrientation() {
  if (!camera) return;
  let yaw, pitch;
  if (orientationEnabled && initialAlpha != null) {
    yaw = THREE.MathUtils.degToRad(currentAlpha);
    pitch = THREE.MathUtils.degToRad(-currentBeta) + SEATED_LOOK_DOWN_RAD;
  } else {
    yaw = dragYaw;
    pitch = dragPitch + SEATED_LOOK_DOWN_RAD;
  }
  pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
  camera.rotation.z = 0;
}
function animate() {
  requestAnimationFrame(animate);
  applyOrientation();
  if (scene && camera && renderer) renderer.render(scene, camera);
}
async function requestOrientationPermission() {
  function addListener() {
    if (orientationListenerAdded) return;
    orientationListenerAdded = true;
    window.addEventListener('deviceorientation', onDeviceOrientation);
    orientationEnabled = true;
  }
  if (typeof DeviceOrientationEvent === 'undefined' || typeof DeviceOrientationEvent.requestPermission !== 'function') {
    addListener();
    return true;
  }
  try {
    const permission = await DeviceOrientationEvent.requestPermission();
    if (permission === 'granted') {
      addListener();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Device orientation permission:', err);
    addListener();
    return true;
  }
}
async function startExperience() {
  if (startBtn) {
    startBtn.textContent = 'Starting…';
    startBtn.disabled = true;
  }
  try {
    await requestOrientationPermission();
  }
 catch (e) {
    console.warn('Orientation:', e);
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
 facingMode: 'environment', width: {
 ideal: 1280 }, height: {
 ideal: 720 }
 },      audio: false    });
    video.srcObject = stream;
    await video.play().catch(() => {
});
    addTableWindow();
    if (startBtn) startBtn.classList.add('hidden');
    if (hint) {
      hint.textContent = 'Move your phone to look around. Look down at the table to see your real food & drinks.';
      hint.classList.remove('hidden');
    }
    return true;
  }
 catch (e) {
    console.warn('Camera not available:', e);
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Tap to enable camera & look around';
    }
    const msg = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'      ? 'Allow camera when asked. On iPhone you may also need to allow Motion & Orientation (Settings → Safari).'      : 'Camera needs HTTPS. Deploy to Vercel/Netlify or use HTTPS on your phone.';
    if (hint) hint.textContent = msg;
    return false;
  }
}
function init() {
  renderer = new THREE.WebGLRenderer({
 canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87CEEB);
  setupDragFallback();
  loadPanorama().then((result) => {
    if (result) buildPanoramaScene(result.tex, result.hdr);
    else buildScene();
    resize();
    window.addEventListener('resize', resize);
    animate();
    if (startBtn) startBtn.addEventListener('click', () => startExperience());
    else startExperience();
  });
}
init();