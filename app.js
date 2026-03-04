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
let tablePlane = null; // 3D plane showing camera feed (added when camera is on)
let orientationEnabled = false;
let initialAlpha = null;
let initialBeta = null;
let currentAlpha = 0;
let currentBeta = 0;

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
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.2, 3);
  camera.rotation.order = 'YXZ';

  // Sky dome
  const skyGeo = new THREE.SphereGeometry(80, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.position.y = -0.5;
  scene.add(sky);

  const sunGeo = new THREE.SphereGeometry(8, 24, 24);
  const sun = new THREE.Mesh(sunGeo, new THREE.MeshBasicMaterial({ color: 0xFFEE88 }));
  sun.position.set(25, 35, -45);
  scene.add(sun);

  const oceanGeo = new THREE.PlaneGeometry(120, 60);
  const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshLambertMaterial({ color: 0x1e90ff }));
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.3, -15);
  scene.add(ocean);

  const sandGeo = new THREE.PlaneGeometry(100, 50);
  const sand = new THREE.Mesh(sandGeo, new THREE.MeshLambertMaterial({ color: 0xE8D5B7 }));
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, -0.5, 5);
  scene.add(sand);

  const shoreGeo = new THREE.PlaneGeometry(80, 8);
  const shore = new THREE.Mesh(shoreGeo, new THREE.MeshLambertMaterial({ color: 0xF5E6C8 }));
  shore.rotation.x = -Math.PI / 2;
  shore.position.set(0, -0.45, -2);
  scene.add(shore);

  const rockMat = new THREE.MeshLambertMaterial({ color: 0x5c5c5c });
  [-4, 2, 3.5].forEach((x, i) => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.4 + i * 0.15, 12, 12), rockMat);
    r.position.set(x, 0, 1 - i * 0.5);
    scene.add(r);
  });

  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2.5, 12);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(-3, 0.8, -1);
  scene.add(trunk);

  const leavesGeo = new THREE.ConeGeometry(1.2, 1.8, 8);
  const leavesMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
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
  scene.add(leaves2);

  // Third palm (mid-distance)
  const trunk3 = new THREE.Mesh(trunkGeo.clone(), trunkMat);
  trunk3.position.set(-5, 0.7, -8);
  trunk3.scale.set(0.85, 0.9, 0.85);
  scene.add(trunk3);
  const leaves3 = new THREE.Mesh(leavesGeo.clone(), leavesMat);
  leaves3.position.set(-5, 2, -8);
  leaves3.scale.setScalar(0.85);
  scene.add(leaves3);

  // Clouds (soft white spheres)
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

  // Wave foam along shore
  const foamGeo = new THREE.PlaneGeometry(90, 4);
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xb8d4e8 });
  const foam = new THREE.Mesh(foamGeo, foamMat);
  foam.rotation.x = -Math.PI / 2;
  foam.position.set(0, -0.35, -4);
  scene.add(foam);

  // Beach umbrella (pole + canopy)
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x2c1810 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(2.5, 1.1, 0.5);
  scene.add(pole);
  const canopyGeo = new THREE.ConeGeometry(0.9, 0.6, 8);
  const canopyMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(2.5, 2.3, 0.5);
  canopy.rotation.x = Math.PI / 2;
  scene.add(canopy);

  // Beach towel (strip on sand)
  const towelGeo = new THREE.PlaneGeometry(1.8, 0.8);
  const towelMat = new THREE.MeshLambertMaterial({ color: 0x3498db });
  const towel = new THREE.Mesh(towelGeo, towelMat);
  towel.rotation.x = -Math.PI / 2;
  towel.position.set(-2, -0.48, 0.8);
  towel.rotation.z = 0.15;
  scene.add(towel);

  // More rocks and small "shells" (tiny spheres)
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

  // Seagulls (simple elongated diamonds)
  const gullMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const gullGeo = new THREE.ConeGeometry(0.15, 0.5, 4);
  [ [ -8, 12, -35 ], [ 5, 14, -40 ], [ 12, 10, -38 ] ].forEach(([ x, y, z ]) => {
    const g = new THREE.Mesh(gullGeo, gullMat);
    g.position.set(x, y, z);
    g.rotation.z = Math.PI / 2;
    g.scale.set(1, 2, 0.3);
    scene.add(g);
  });

  // Distant boat silhouette (simple box + cone)
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
  scene.add(sail);

  // Bush / grass clump
  const bushGeo = new THREE.SphereGeometry(0.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const bushMat = new THREE.MeshLambertMaterial({ color: 0x27ae60 });
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
}

function addTableWindow() {
  if (tablePlane || !video.srcObject) return;
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  const geometry = new THREE.PlaneGeometry(2.2, 1.4);
  tablePlane = new THREE.Mesh(geometry, material);
  tablePlane.position.set(0, 0.25, 1.4);
  tablePlane.rotation.x = -Math.PI / 2;
  scene.add(tablePlane);
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

function applyOrientation() {
  if (!camera || !orientationEnabled) return;
  const yaw = THREE.MathUtils.degToRad(currentAlpha);
  const pitch = THREE.MathUtils.degToRad(-currentBeta);
  camera.rotation.y = yaw;
  camera.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
}

function animate() {
  requestAnimationFrame(animate);
  applyOrientation();
  if (scene && camera && renderer) renderer.render(scene, camera);
}

async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent === 'undefined' || typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', onDeviceOrientation);
    orientationEnabled = true;
    return true;
  }
  try {
    const permission = await DeviceOrientationEvent.requestPermission();
    if (permission === 'granted') {
      window.addEventListener('deviceorientation', onDeviceOrientation);
      orientationEnabled = true;
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Device orientation permission:', err);
    window.addEventListener('deviceorientation', onDeviceOrientation);
    orientationEnabled = true;
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
  } catch (e) {
    console.warn('Orientation:', e);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play().catch(() => {});

    addTableWindow();

    if (startBtn) startBtn.classList.add('hidden');
    if (hint) {
      hint.textContent = 'Move your phone to look around. Look down at the table to see your real food & drinks.';
      hint.classList.remove('hidden');
    }
    return true;
  } catch (e) {
    console.warn('Camera not available:', e);
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Tap to enable camera & look around';
    }
    const msg = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'
      ? 'Allow camera when asked. On iPhone you may also need to allow Motion & Orientation (Settings → Safari).'
      : 'Camera needs HTTPS. Deploy to Vercel/Netlify or use HTTPS on your phone.';
    if (hint) hint.textContent = msg;
    return false;
  }
}

function init() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87CEEB);

  buildScene();
  resize();
  window.addEventListener('resize', resize);
  animate();

  if (startBtn) {
    startBtn.addEventListener('click', () => startExperience());
  } else {
    startExperience();
  }
}

init();
