/**
 * Virtual Café — Mixed reality MVP
 * 3D scene with a cutout showing your camera (real food & drinks).
 * Works on iPhone in Safari over HTTPS (no VR headset).
 */

import * as THREE from 'three';

const video = document.getElementById('camera-video');
const canvas = document.getElementById('scene-canvas');
const hint = document.getElementById('hint');
const startBtn = document.getElementById('start-btn');

// Cutout: fraction of screen (center-bottom = "table view")
const CUTOUT = { x: 0.12, y: 0.32, w: 0.76, h: 0.52 };

let scene, camera, renderer;
let cutoutPixels = { x: 0, y: 0, w: 0, h: 0 };

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  cutoutPixels.x = Math.floor(CUTOUT.x * w);
  cutoutPixels.y = Math.floor(CUTOUT.y * h);
  cutoutPixels.w = Math.floor(CUTOUT.w * w);
  cutoutPixels.h = Math.floor(CUTOUT.h * h);

  if (renderer) {
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
  if (camera) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function buildScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.8, 2.2);
  camera.lookAt(0, 0.2, 0);

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 4),
    new THREE.MeshLambertMaterial({ color: 0x3d2914 })
  );
  backWall.position.set(0, 0, -2);
  scene.add(backWall);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 5),
    new THREE.MeshLambertMaterial({ color: 0x2a1810 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  scene.add(floor);

  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 4),
    new THREE.MeshLambertMaterial({ color: 0x352010 })
  );
  leftWall.position.set(-2.5, 0, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 4),
    new THREE.MeshLambertMaterial({ color: 0x352010 })
  );
  rightWall.position.set(2.5, 0, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  // Warm ambient + directional (window feel)
  scene.add(new THREE.AmbientLight(0x554433, 0.6));
  const dir = new THREE.DirectionalLight(0xffeedd, 0.9);
  dir.position.set(2, 3, 2);
  scene.add(dir);

  // Simple "frame" line around where the cutout will be (decorative)
  const frameW = 1.6, frameH = 1.0;
  const frameGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(frameW, frameH));
  const frameLine = new THREE.LineSegments(
    frameGeo,
    new THREE.LineBasicMaterial({ color: 0x8b6914, linewidth: 2 })
  );
  frameLine.position.set(0, 0.1, -0.5);
  scene.add(frameLine);
}

function renderWithCutout() {
  const w = renderer.domElement.width;
  const h = renderer.domElement.height;
  const { x, y, w: cw, h: ch } = cutoutPixels;

  renderer.setScissorTest(false);
  renderer.clear(true, true, true);

  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 0);

  // Top strip
  if (y > 0) {
    renderer.setScissor(0, h - y, w, y);
    renderer.clear();
    renderer.render(scene, camera);
  }
  // Bottom strip
  if (y + ch < h) {
    renderer.setScissor(0, 0, w, h - y - ch);
    renderer.clear();
    renderer.render(scene, camera);
  }
  // Left strip
  if (x > 0) {
    renderer.setScissor(0, h - y - ch, x, ch);
    renderer.clear();
    renderer.render(scene, camera);
  }
  // Right strip
  if (x + cw < w) {
    renderer.setScissor(x + cw, h - y - ch, w - x - cw, ch);
    renderer.clear();
    renderer.render(scene, camera);
  }

  renderer.setScissorTest(false);
}

function animate() {
  requestAnimationFrame(animate);
  if (scene && camera && renderer) renderWithCutout();
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
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  buildScene();
  resize();
  window.addEventListener('resize', resize);
  animate();

  // Request camera only after user tap (required on iOS to show Allow/Don't Allow)
  if (startBtn) {
    startBtn.addEventListener('click', () => startCamera());
  } else {
    startCamera();
  }
}

init();
