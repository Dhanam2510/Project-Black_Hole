import * as THREE from 'three';

// Procedural Canvas Texture Generators (100% offline, highly detailed, deterministic)

export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep Ocean Blue gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0a2342');
  oceanGrad.addColorStop(0.5, '#0f4c81');
  oceanGrad.addColorStop(1, '#0a2342');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Stylized continents (Africa, Europe, Americas, Asia, Australia, Antarctica)
  ctx.fillStyle = '#2d6a4f';

  // Americas
  ctx.beginPath();
  ctx.ellipse(280, 180, 90, 110, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(320, 340, 70, 110, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Europe & Africa
  ctx.fillStyle = '#386641';
  ctx.beginPath();
  ctx.ellipse(540, 160, 60, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a3704c'; // Sahara / Savannah
  ctx.beginPath();
  ctx.ellipse(550, 270, 80, 100, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Asia
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.ellipse(720, 180, 130, 90, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.fillStyle = '#bc6c25';
  ctx.beginPath();
  ctx.ellipse(820, 360, 65, 45, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Antarctica & Ice caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 30);
  ctx.fillRect(0, 480, 1024, 32);

  // Clouds layer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 40; i++) {
    const cx = (i * 27) % 1024;
    const cy = 60 + ((i * 47) % 380);
    ctx.beginPath();
    ctx.arc(cx, cy, 25 + (i % 30), 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createCloudsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const rad = 20 + Math.random() * 50;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Lunar grey regolith base
  ctx.fillStyle = '#8c8d8f';
  ctx.fillRect(0, 0, 512, 256);

  // Lunar Maria (dark basalt plains)
  ctx.fillStyle = '#55575a';
  for (let i = 0; i < 12; i++) {
    const x = (i * 55 + 30) % 512;
    const y = 50 + ((i * 40) % 150);
    ctx.beginPath();
    ctx.ellipse(x, y, 35 + (i % 20), 25 + (i % 15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters with white rims and shadows
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 3 + Math.random() * 12;

    ctx.fillStyle = '#404245'; // Crater interior
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d1d5db'; // Highlight rim
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, r, 0, Math.PI);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createMarsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Martian iron-oxide rust red
  ctx.fillStyle = '#b44a28';
  ctx.fillRect(0, 0, 512, 256);

  // Dark volcanic basalt regions (Syrtis Major, etc.)
  ctx.fillStyle = '#692d19';
  for (let i = 0; i < 15; i++) {
    const x = (i * 65 + 20) % 512;
    const y = 60 + ((i * 35) % 140);
    ctx.beginPath();
    ctx.ellipse(x, y, 40 + (i % 25), 25 + (i % 20), 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Valles Marineris canyon feature
  ctx.strokeStyle = '#3e180d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(180, 130);
  ctx.bezierCurveTo(240, 145, 300, 135, 350, 140);
  ctx.stroke();

  // Polar ice caps (dry ice / water ice)
  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 240, 512, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Blazing plasma yellow-orange base
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#ff9900');
  grad.addColorStop(0.3, '#ffcc00');
  grad.addColorStop(0.7, '#ff6600');
  grad.addColorStop(1, '#ff3300');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Solar granules and convective cells
  ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sunspots (cool magnetic flux spots)
  ctx.fillStyle = '#7a1c00';
  for (let i = 0; i < 8; i++) {
    const x = 120 + Math.random() * 280;
    const y = 80 + Math.random() * 90;
    ctx.beginPath();
    ctx.arc(x, y, 4 + Math.random() * 7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createSolarPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep Blue Silicon
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  // Solar cell grid
  ctx.fillStyle = '#1e3a8a';
  const cellSize = 30;
  for (let x = 4; x < 250; x += cellSize + 2) {
    for (let y = 4; y < 250; y += cellSize + 2) {
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  // Metallic silver busbars
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  for (let y = 18; y < 250; y += cellSize + 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
