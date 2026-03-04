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
