/**
 * Virtual Café — Mixed reality MVP
 * Beach 3D scene with a cutout showing your camera (real food & drinks).
 * Works on iPhone in Safari over HTTPS (no VR headset).
 */

import * as THREE from 'three';

const video = document.getElementById('camera-video');
const canvas = document.getElementById('scene-canvas');
const hint = document.getElementById('hint');
const startBtn = document.getElementById('start-btn');
const cameraCutout = document.getElementById('camera-cutout');

let scene, camera, renderer;

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
  camera.position.set(0, 1.2, 4);
  camera.lookAt(0, 0, -2);

  // Sky dome (hemisphere - light blue)
  const skyGeo = new THREE.SphereGeometry(80, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    side: THREE.BackSide
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.position.y = -0.5;
  scene.add(sky);

  // Sun (bright disc in sky)
  const sunGeo = new THREE.SphereGeometry(8, 24, 24);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFEE88 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.set(25, 35, -45);
  scene.add(sun);

  // Ocean (blue water plane)
  const oceanGeo = new THREE.PlaneGeometry(120, 60);
  const oceanMat = new THREE.MeshLambertMaterial({ color: 0x1e90ff });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.3, -15);
  scene.add(ocean);

  // Sand / beach (warm tan)
  const sandGeo = new THREE.PlaneGeometry(100, 50);
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xE8D5B7 });
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, -0.5, 5);
  scene.add(sand);

  // Shore line (lighter strip)
  const shoreGeo = new THREE.PlaneGeometry(80, 8);
  const shoreMat = new THREE.MeshLambertMaterial({ color: 0xF5E6C8 });
  const shore = new THREE.Mesh(shoreGeo, shoreMat);
  shore.rotation.x = -Math.PI / 2;
  shore.position.set(0, -0.45, -2);
  scene.add(shore);

  // Rocks (simple dark spheres)
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x5c5c5c });
  [-4, 2, 3.5].forEach((x, i) => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.4 + i * 0.15, 12, 12), rockMat);
    r.position.set(x, 0, 1 - i * 0.5);
    scene.add(r);
  });

  // Simple palm trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2.5, 12);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(-3, 0.8, -1);
  scene.add(trunk);

  // Palm leaves (simple cone)
  const leavesGeo = new THREE.ConeGeometry(1.2, 1.8, 8);
  const leavesMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
  const leaves = new THREE.Mesh(leavesGeo, leavesMat);
  leaves.position.set(-3, 2.2, -1);
  scene.add(leaves);

  // Second palm (smaller, further)
  const trunk2 = new THREE.Mesh(trunkGeo.clone(), trunkMat);
  trunk2.position.set(4, 0.6, -5);
  trunk2.scale.setScalar(0.7);
  scene.add(trunk2);
  const leaves2 = new THREE.Mesh(leavesGeo.clone(), leavesMat);
  leaves2.position.set(4, 1.8, -5);
  leaves2.scale.setScalar(0.7);
  scene.add(leaves2);

  // Lighting (bright outdoor)
  scene.add(new THREE.AmbientLight(0xaaccff, 0.5));
  const sunLight = new THREE.DirectionalLight(0xffeedd, 1);
  sunLight.position.set(20, 40, -30);
  scene.add(sunLight);
  const fill = new THREE.DirectionalLight(0xccddff, 0.4);
  fill.position.set(-10, 10, 10);
  scene.add(fill);
}

function animate() {
  requestAnimationFrame(animate);
  if (scene && camera && renderer) {
    renderer.render(scene, camera);
  }
}

async function startCamera() {
  if (startBtn) {
    startBtn.textContent = 'Opening camera…';
    startBtn.disabled = true;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play().catch(() => {});
    if (cameraCutout) cameraCutout.classList.add('visible');
    if (startBtn) startBtn.classList.add('hidden');
    if (hint) hint.classList.add('hidden');
    return true;
  } catch (e) {
    console.warn('Camera not available:', e);
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Tap to enable camera';
    }
    const msg = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'
      ? 'Camera was blocked. Tap the button again and choose "Allow", or go to Settings → Safari → Camera and allow for this site.'
      : 'Camera not available. Use HTTPS on your phone (e.g. deploy to Vercel/Netlify) or allow camera in browser settings.';
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
    startBtn.addEventListener('click', () => startCamera());
  } else {
    startCamera();
  }
}

init();
