import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SensorData, SensorFaults } from '../types/septic';
import { playSingleClick } from '../utils/audio';
import { Eye, RotateCcw, Box, Radio, Tag, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface SepticTank3DProps {
  sensorData: SensorData;
  faults: SensorFaults;
  onOpenCoverRequest: () => void;
  isCoverOpen: boolean;
  explodedHousingMode: boolean;
  setExplodedHousingMode: (val: boolean) => void;
}

// --- PROCEDURAL ORGANIC SEPTIC SLUDGE TEXTURE GENERATOR ---
const createProceduralSludgeTextures = () => {
  const size = 512;

  // 1. Albedo / Color Map Canvas
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctxColor = colorCanvas.getContext('2d');

  // 2. Bump / Heightmap Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const ctxBump = bumpCanvas.getContext('2d');

  // 3. Roughness Map Canvas
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const ctxRough = roughCanvas.getContext('2d');

  if (!ctxColor || !ctxBump || !ctxRough) {
    return { mapTexture: null, bumpTexture: null, roughTexture: null };
  }

  const imgDataColor = ctxColor.createImageData(size, size);
  const imgDataBump = ctxBump.createImageData(size, size);
  const imgDataRough = ctxRough.createImageData(size, size);

  // Multi-frequency noise generator for organic semi-solid textures
  const noise = (x: number, y: number, freq: number, shift: number) => {
    const nx = x * freq + shift;
    const ny = y * freq - shift;
    return (
      Math.sin(nx * 0.05 + Math.cos(ny * 0.04) * 3) * 0.5 +
      Math.cos(ny * 0.06 + Math.sin(nx * 0.03) * 2) * 0.5
    );
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Multi-scale procedural noise layers
      const n1 = (noise(x, y, 1.2, 12.0) + 1) * 0.5; // Large organic sludge mounds & folds
      const n2 = (noise(x, y, 3.8, 48.0) + 1) * 0.5; // Medium viscous silt swirls
      const n3 = (noise(x, y, 9.0, 110.0) + 1) * 0.5; // Fine granular particulate grit
      const nGrain = (Math.random() - 0.5) * 0.14;

      const nTotal = Math.min(1, Math.max(0, n1 * 0.48 + n2 * 0.36 + n3 * 0.16 + nGrain));

      // Organic Color Palette for Septic Biosolids & Septage
      // Dark earthy base: R=22, G=14, B=8
      // Dense silt/sand: R=58, G=38, B=20
      // Anaerobic green-brown decay: R=38, G=44, B=22
      // Dark septage flow vein: R=12, G=8, B=4
      let r = 22 + nTotal * 44;
      let g = 14 + nTotal * 30;
      let b = 8 + nTotal * 16;

      // Anaerobic decomposing bio-floc specks
      if (n2 > 0.62 && n3 < 0.48) {
        r += 10;
        g += 16;
        b += 6;
      }

      // Dark septage vein crevices
      if (Math.abs(n1 - 0.5) < 0.055) {
        r *= 0.5;
        g *= 0.5;
        b *= 0.5;
      }

      imgDataColor.data[idx] = Math.min(255, Math.max(0, Math.floor(r)));
      imgDataColor.data[idx + 1] = Math.min(255, Math.max(0, Math.floor(g)));
      imgDataColor.data[idx + 2] = Math.min(255, Math.max(0, Math.floor(b)));
      imgDataColor.data[idx + 3] = 255;

      // Viscous Bump Map (0-255 height value)
      const bumpVal = Math.min(255, Math.max(0, Math.floor((n1 * 0.45 + n2 * 0.4 + n3 * 0.15) * 255)));
      imgDataBump.data[idx] = bumpVal;
      imgDataBump.data[idx + 1] = bumpVal;
      imgDataBump.data[idx + 2] = bumpVal;
      imgDataBump.data[idx + 3] = 255;

      // Roughness / Specular Sheen Map (0-255)
      // Wet slimy patches reflect light specularly (~0.35 roughness) while dense silt stays matte (~0.95 roughness)
      const roughVal = Math.min(255, Math.max(0, Math.floor((0.5 + n1 * 0.38 + nGrain * 0.12) * 255)));
      imgDataRough.data[idx] = roughVal;
      imgDataRough.data[idx + 1] = roughVal;
      imgDataRough.data[idx + 2] = roughVal;
      imgDataRough.data[idx + 3] = 255;
    }
  }

  ctxColor.putImageData(imgDataColor, 0, 0);
  ctxBump.putImageData(imgDataBump, 0, 0);
  ctxRough.putImageData(imgDataRough, 0, 0);

  const mapTexture = new THREE.CanvasTexture(colorCanvas);
  mapTexture.wrapS = THREE.RepeatWrapping;
  mapTexture.wrapT = THREE.RepeatWrapping;
  mapTexture.repeat.set(3, 1.5);

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(3, 1.5);

  const roughTexture = new THREE.CanvasTexture(roughCanvas);
  roughTexture.wrapS = THREE.RepeatWrapping;
  roughTexture.wrapT = THREE.RepeatWrapping;
  roughTexture.repeat.set(3, 1.5);

  return { mapTexture, bumpTexture, roughTexture };
};

export const SepticTank3D: React.FC<SepticTank3DProps> = ({
  sensorData,
  faults,
  onOpenCoverRequest,
  isCoverOpen,
  explodedHousingMode,
  setExplodedHousingMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 3D Mesh references for dynamic updating
  const sludgeMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const scumMeshRef = useRef<THREE.Mesh | null>(null);
  const acousticConeRef = useRef<THREE.Mesh | null>(null);
  const gasParticlesGroupRef = useRef<THREE.Group | null>(null);
  const bubbleParticlesRef = useRef<THREE.Mesh[]>([]);
  const coverMeshGroupRef = useRef<THREE.Group | null>(null);
  const cutawayWallRef = useRef<THREE.Mesh | null>(null);
  const redLedLightRef = useRef<THREE.PointLight | null>(null);
  const greenLedLightRef = useRef<THREE.PointLight | null>(null);
  const redLedMeshRef = useRef<THREE.Mesh | null>(null);
  const greenLedMeshRef = useRef<THREE.Mesh | null>(null);
  const labelsGroupRef = useRef<THREE.Group | null>(null);
  const wiringGroupRef = useRef<THREE.Group | null>(null);
  const explodedGroupRef = useRef<THREE.Group | null>(null);

  // Toggle states
  const [showCutaway, setShowCutaway] = useState(true);
  const [showBeam, setShowBeam] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showWiring, setShowWiring] = useState(true);
  const [showGasParticles, setShowGasParticles] = useState(true);

  // Helper to create razor-sharp, ultra-readable 2D billboard text callout sprites
  const createTextSprite = (
    text: string,
    accentColor = '#10b981',
    borderColor = '#10b981'
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    ctx.clearRect(0, 0, 480, 90);

    // Canvas drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Solid dark obsidian pill background for maximum contrast against light canvas
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 464, 74, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Left accent indicator pill
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(16, 18, 10, 54, 5);
    ctx.fill();

    // Crisp Bold Text Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 36, 45);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.renderOrder = 9999;
    sprite.scale.set(48, 9, 1);
    return sprite;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // --- SCENE SETUP (Bright Crisp Engineering Canvas) ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Light slate canvas
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.0015);
    sceneRef.current = scene;

    // --- CAMERA SETUP ---
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
    camera.position.set(210, 150, 240);
    cameraRef.current = camera;

    // --- RENDERER SETUP ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 80;
    controls.maxDistance = 600;
    controls.target.set(0, 75, 0);
    controlsRef.current = controls;

    // --- STUDIO LIGHTING (Crisp Engineering Studio) ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.95);
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.25);
    mainLight.position.set(180, 290, 200);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 50;
    mainLight.shadow.camera.far = 600;
    mainLight.shadow.camera.left = -160;
    mainLight.shadow.camera.right = 160;
    mainLight.shadow.camera.top = 160;
    mainLight.shadow.camera.bottom = -160;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    fillLight.position.set(-180, 150, -100);
    scene.add(fillLight);

    // Spatial Engineering Grid Floor
    const gridHelper = new THREE.GridHelper(600, 30, 0x94a3b8, 0xcbd5e1);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Soft Shadow Catcher Floor
    const floorGeo = new THREE.PlaneGeometry(800, 800);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- SEPTIC TANK STRUCTURE (W=140, D=140, H=180 cm) ---
    const TANK_W = 140;
    const TANK_D = 140;
    const TANK_H = 180;
    const WALL = 6;

    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    // Precast Concrete Texture Material (Dark Slate Concrete for structural pop)
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate concrete
      roughness: 0.65,
      metalness: 0.15,
    });

    // Base Slab
    const baseGeo = new THREE.BoxGeometry(TANK_W + WALL * 2, WALL, TANK_D + WALL * 2);
    const baseMesh = new THREE.Mesh(baseGeo, concreteMat);
    baseMesh.position.y = -WALL / 2;
    baseMesh.receiveShadow = true;
    tankGroup.add(baseMesh);

    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(TANK_W + WALL * 2, TANK_H, WALL);
    const backWall = new THREE.Mesh(backWallGeo, concreteMat);
    backWall.position.set(0, TANK_H / 2, -TANK_D / 2 - WALL / 2);
    backWall.receiveShadow = true;
    tankGroup.add(backWall);

    // Left Wall
    const sideWallGeo = new THREE.BoxGeometry(WALL, TANK_H, TANK_D + WALL * 2);
    const leftWall = new THREE.Mesh(sideWallGeo, concreteMat);
    leftWall.position.set(-TANK_W / 2 - WALL / 2, TANK_H / 2, 0);
    leftWall.receiveShadow = true;
    tankGroup.add(leftWall);

    // Right Wall
    const rightWall = leftWall.clone();
    rightWall.position.set(TANK_W / 2 + WALL / 2, TANK_H / 2, 0);
    tankGroup.add(rightWall);

    // Front Translucent Cutaway Wall
    const frontWallGeo = new THREE.BoxGeometry(TANK_W + WALL * 2, TANK_H, WALL);
    const cutawayMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      transparent: true,
      opacity: 0.2,
      roughness: 0.6,
    });
    const cutawayWall = new THREE.Mesh(frontWallGeo, cutawayMat);
    cutawayWall.position.set(0, TANK_H / 2, TANK_D / 2 + WALL / 2);
    cutawayWall.visible = false; // Open cutaway by default
    cutawayWallRef.current = cutawayWall;
    tankGroup.add(cutawayWall);

    // Top Roof Slab
    const roofGeo = new THREE.BoxGeometry(TANK_W + WALL * 2, WALL, TANK_D + WALL * 2);
    const roofMesh = new THREE.Mesh(roofGeo, concreteMat);
    roofMesh.position.y = TANK_H + WALL / 2;
    roofMesh.castShadow = true;
    tankGroup.add(roofMesh);

    // Access Riser Collar
    const riserGeo = new THREE.CylinderGeometry(24, 25, 20, 32);
    const riserMesh = new THREE.Mesh(riserGeo, concreteMat);
    riserMesh.position.set(0, TANK_H + 10 + WALL, 0);
    riserMesh.castShadow = true;
    tankGroup.add(riserMesh);

    // Baffle Pipes
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const baffleGeo = new THREE.CylinderGeometry(6, 6, 28, 16);
    const inBaffle = new THREE.Mesh(baffleGeo, pipeMat);
    inBaffle.position.set(-TANK_W / 2 + 12, 145, 0);
    tankGroup.add(inBaffle);

    const outBaffle = new THREE.Mesh(baffleGeo, pipeMat);
    outBaffle.position.set(TANK_W / 2 - 12, 142, 0);
    tankGroup.add(outBaffle);

    // --- REMOVABLE INSPECTION COVER ---
    const coverGroup = new THREE.Group();
    coverGroup.position.set(0, TANK_H + 20 + WALL, 0);

    const lidGeo = new THREE.CylinderGeometry(26, 26, 4, 32);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.7 });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.castShadow = true;
    coverGroup.add(lidMesh);

    // Handles
    const handleGeo = new THREE.TorusGeometry(3.5, 0.8, 12, 24, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
    const handleL = new THREE.Mesh(handleGeo, handleMat);
    handleL.rotation.x = -Math.PI / 2;
    handleL.position.set(-14, 2.5, 0);
    const handleR = handleL.clone();
    handleR.position.set(14, 2.5, 0);
    coverGroup.add(handleL);
    coverGroup.add(handleR);

    // Seal Ring
    const sealGeo = new THREE.TorusGeometry(25, 0.6, 12, 32);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.rotation.x = Math.PI / 2;
    sealMesh.position.y = -2;
    coverGroup.add(sealMesh);

    coverMeshGroupRef.current = coverGroup;
    tankGroup.add(coverGroup);

    // --- 1. REALISTIC SETTLED SLUDGE & BIOSOLIDS LAYER ---
    // Deformed surface topology to simulate real organic sediment accumulation
    const sludgeGeo = new THREE.BoxGeometry(TANK_W - 2, 48, TANK_D - 2, 32, 10, 32);
    const spos = sludgeGeo.attributes.position;
    for (let i = 0; i < spos.count; i++) {
      if (spos.getY(i) > 10) {
        const vx = spos.getX(i);
        const vz = spos.getZ(i);
        const wave = Math.sin(vx * 0.14) * Math.cos(vz * 0.14) * 3.4 + Math.sin(vx * 0.06) * 2.2 + Math.cos(vz * 0.08) * 1.5;
        spos.setY(i, spos.getY(i) + wave);
      }
    }
    sludgeGeo.computeVertexNormals();

    const { mapTexture, bumpTexture, roughTexture } = createProceduralSludgeTextures();

    const sludgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Tinted by procedural map
      map: mapTexture || undefined,
      bumpMap: bumpTexture || undefined,
      bumpScale: 2.4, // Viscous organic bump depth
      roughnessMap: roughTexture || undefined,
      roughness: 0.85,
      metalness: 0.05,
    });
    const sludgeMesh = new THREE.Mesh(sludgeGeo, sludgeMat);
    sludgeMesh.position.set(0, 24, 0);
    sludgeMesh.receiveShadow = true;
    sludgeMesh.castShadow = true;
    sludgeMeshRef.current = sludgeMesh;
    tankGroup.add(sludgeMesh);

    // --- 2. REALISTIC CLARIFIED EFFLUENT WASTEWATER ZONE ---
    const liquidGeo = new THREE.BoxGeometry(TANK_W - 2, 92, TANK_D - 2);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d9488, // Vivid translucent emerald wastewater
      transmission: 0.2,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      ior: 1.333,
      metalness: 0.05,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.set(0, 48 + 46, 0);
    liquidMeshRef.current = liquidMesh;
    tankGroup.add(liquidMesh);

    // Suspended organic floc particles floating in wastewater
    const bubbleParticles: THREE.Mesh[] = [];
    const pGeo = new THREE.SphereGeometry(0.8, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x1f3627, transparent: true, opacity: 0.45 });
    for (let i = 0; i < 50; i++) {
      const bubble = new THREE.Mesh(pGeo, pMat);
      bubble.position.set(
        (Math.random() - 0.5) * (TANK_W - 14),
        55 + Math.random() * 80,
        (Math.random() - 0.5) * (TANK_D - 14)
      );
      bubble.userData = {
        speedY: 0.03 + Math.random() * 0.05,
        angle: Math.random() * Math.PI * 2,
      };
      tankGroup.add(bubble);
      bubbleParticles.push(bubble);
    }
    bubbleParticlesRef.current = bubbleParticles;

    // --- 3. REALISTIC FLOATING SCUM / F.O.G. CRUST LAYER ---
    const scumGeo = new THREE.BoxGeometry(TANK_W - 2, 12, TANK_D - 2, 24, 3, 24);
    const scpos = scumGeo.attributes.position;
    for (let i = 0; i < scpos.count; i++) {
      const vx = scpos.getX(i);
      const vz = scpos.getZ(i);
      const lump = Math.cos(vx * 0.15) * Math.sin(vz * 0.18) * 2.0;
      scpos.setY(i, scpos.getY(i) + lump);
    }
    scumGeo.computeVertexNormals();

    const scumMat = new THREE.MeshStandardMaterial({
      color: 0x694e24, // Viscous yellowish-brown fats & grease lather
      roughness: 0.9,
      metalness: 0.1,
    });
    const scumMesh = new THREE.Mesh(scumGeo, scumMat);
    scumMesh.position.set(0, 48 + 92 + 6, 0);
    scumMesh.castShadow = true;
    scumMeshRef.current = scumMesh;
    tankGroup.add(scumMesh);

    // --- DYNAMIC BIOGAS PARTICLES IN HEADSPACE ---
    const gasGroup = new THREE.Group();
    const gasCount = 70;
    const gGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const gMat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.35 });
    for (let i = 0; i < gasCount; i++) {
      const g = new THREE.Mesh(gGeo, gMat);
      g.position.set(
        (Math.random() - 0.5) * (TANK_W - 20),
        155 + Math.random() * 20,
        (Math.random() - 0.5) * (TANK_D - 20)
      );
      g.userData = { speed: 0.05 + Math.random() * 0.08, floatAngle: Math.random() * Math.PI * 2 };
      gasGroup.add(g);
    }
    gasParticlesGroupRef.current = gasGroup;
    tankGroup.add(gasGroup);

    // --- SENSOR PROBE & SEALED HOUSING ---
    const probeGroup = new THREE.Group();

    // Stainless Shaft
    const shaftGeo = new THREE.CylinderGeometry(1.4, 1.4, 55, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(0, TANK_H - 12, 0);
    shaft.castShadow = true;
    probeGroup.add(shaft);

    // Conceptual Probe Rings
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(2.2, 0.5, 12, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, TANK_H - 25 - i * 10, 0);
      probeGroup.add(ring);
    }

    // Probe Head
    const headGeo = new THREE.CylinderGeometry(6, 6, 7, 24);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const sensorHead = new THREE.Mesh(headGeo, headMat);
    sensorHead.position.set(0, TANK_H - 26, 0);
    probeGroup.add(sensorHead);

    // Ultrasonic Dual Horns
    const hornGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.5, 16);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
    const horn1 = new THREE.Mesh(hornGeo, hornMat);
    horn1.position.set(-2.2, TANK_H - 29.5, 0);
    const horn2 = horn1.clone();
    horn2.position.set(2.2, TANK_H - 29.5, 0);
    probeGroup.add(horn1);
    probeGroup.add(horn2);

    // MQ-2 Screen
    const mq2Geo = new THREE.CylinderGeometry(1.8, 1.8, 2, 16);
    mq2Geo.rotateX(Math.PI / 2);
    const mq2Mat = new THREE.MeshStandardMaterial({ color: 0xd97706, wireframe: true });
    const mq2Mesh = new THREE.Mesh(mq2Geo, mq2Mat);
    mq2Mesh.position.set(0, TANK_H - 26, 6.2);
    probeGroup.add(mq2Mesh);

    // Acoustic Beam Projection Cone
    const coneGeo = new THREE.ConeGeometry(20, 32, 32, 1, true);
    coneGeo.rotateX(Math.PI);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.set(0, TANK_H - 30 - 16, 0);
    acousticConeRef.current = coneMesh;
    probeGroup.add(coneMesh);

    // External ESP32 Enclosure
    const espGroup = new THREE.Group();
    espGroup.position.set(30, TANK_H + 20, 0);

    const espBoxGeo = new THREE.BoxGeometry(16, 14, 10);
    const espBoxMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
    const espBox = new THREE.Mesh(espBoxGeo, espBoxMat);
    espBox.castShadow = true;
    espGroup.add(espBox);

    // Antenna
    const antGeo = new THREE.CylinderGeometry(0.4, 0.4, 14, 8);
    const ant = new THREE.Mesh(antGeo, shaftMat);
    ant.position.set(36, TANK_H + 32, 0);
    tankGroup.add(ant);

    // LEDs
    const ledGeo = new THREE.SphereGeometry(1.2, 16, 16);

    const gLedMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.1 });
    const gLed = new THREE.Mesh(ledGeo, gLedMat);
    gLed.position.set(-4, 2, 5.2);
    greenLedMeshRef.current = gLed;
    espGroup.add(gLed);

    const gLight = new THREE.PointLight(0x22c55e, 1.5, 25);
    gLight.position.set(-4, 2, 7);
    greenLedLightRef.current = gLight;
    espGroup.add(gLight);

    const rLedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1 });
    const rLed = new THREE.Mesh(ledGeo, rLedMat);
    rLed.position.set(4, 2, 5.2);
    redLedMeshRef.current = rLed;
    espGroup.add(rLed);

    const rLight = new THREE.PointLight(0xef4444, 0, 35);
    rLight.position.set(4, 2, 7);
    redLedLightRef.current = rLight;
    espGroup.add(rLight);

    tankGroup.add(espGroup);
    tankGroup.add(probeGroup);

    // Wiring Conduit
    const wiringGroup = new THREE.Group();
    const conduitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, TANK_H + 16, 0),
      new THREE.Vector3(14, TANK_H + 24, 2),
      new THREE.Vector3(22, TANK_H + 20, 0),
    ]);
    const conduitGeo = new THREE.TubeGeometry(conduitCurve, 20, 0.8, 8, false);
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const conduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
    wiringGroup.add(conduitMesh);
    wiringGroupRef.current = wiringGroup;
    tankGroup.add(wiringGroup);

    // --- EXPLODED HOUSING GROUP ---
    const explodedGroup = new THREE.Group();
    explodedGroup.position.set(-60, 100, 0);
    explodedGroup.visible = false;

    const exHousingMat = new THREE.MeshStandardMaterial({ color: 0x059669, transparent: true, opacity: 0.75 });
    const exOuter = new THREE.Mesh(new THREE.BoxGeometry(22, 18, 14), exHousingMat);
    exOuter.position.x = -35;
    explodedGroup.add(exOuter);

    const exSealMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const exSeal = new THREE.Mesh(new THREE.BoxGeometry(2, 16, 12), exSealMat);
    exSeal.position.x = -15;
    explodedGroup.add(exSeal);

    const exPcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const exPcb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 12, 10), exPcbMat);
    exPcb.position.x = 0;
    explodedGroup.add(exPcb);

    const exBatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const exBat = new THREE.Mesh(new THREE.BoxGeometry(3, 10, 8), exBatMat);
    exBat.position.x = 20;
    explodedGroup.add(exBat);

    const exWinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const exWin = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 2, 16), exWinMat);
    exWin.rotation.z = Math.PI / 2;
    exWin.position.x = 35;
    explodedGroup.add(exWin);

    // Callout labels for exploded housing
    const labelExOuter = createTextSprite('OUTER HOUSING (IP67)', '#10b981', '#10b981');
    labelExOuter.position.set(-35, 22, 0);
    explodedGroup.add(labelExOuter);

    const labelExSeal = createTextSprite('O-RING SEAL', '#ef4444', '#ef4444');
    labelExSeal.position.set(-15, 22, 0);
    explodedGroup.add(labelExSeal);

    const labelExPcb = createTextSprite('ESP32 BOARD', '#22c55e', '#22c55e');
    labelExPcb.position.set(0, 22, 0);
    explodedGroup.add(labelExPcb);

    const labelExBat = createTextSprite('LiFePO4 BATTERY', '#0284c7', '#0284c7');
    labelExBat.position.set(20, 22, 0);
    explodedGroup.add(labelExBat);

    const labelExWin = createTextSprite('PROTECTED SENSOR WINDOW', '#f59e0b', '#f59e0b');
    labelExWin.position.set(35, 22, 0);
    explodedGroup.add(labelExWin);

    explodedGroupRef.current = explodedGroup;
    scene.add(explodedGroup);

    // --- 3D LABELS GROUP (Crisp Dark Obsidian Billboard Sprites + Leader Pointer Lines) ---
    const labelsGroup = new THREE.Group();

    const createLeaderLine = (fromX: number, fromY: number, fromZ: number, toX: number, toY: number, toZ: number, colorHex: number) => {
      const points = [new THREE.Vector3(fromX, fromY, fromZ), new THREE.Vector3(toX, toY, toZ)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2, transparent: true, opacity: 0.85 });
      const line = new THREE.Line(lineGeo, lineMat);
      line.renderOrder = 9998;
      return line;
    };

    const lblEsp = createTextSprite('ESP32 NODE (IP67)', '#10b981', '#059669');
    lblEsp.position.set(78, TANK_H + 28, 0);
    labelsGroup.add(lblEsp);
    labelsGroup.add(createLeaderLine(30, TANK_H + 20, 0, 78, TANK_H + 28, 0, 0x10b981));

    const lblUltrasonic = createTextSprite('TRANSDUCER PROBE', '#38bdf8', '#0284c7');
    lblUltrasonic.position.set(-82, TANK_H - 18, 0);
    labelsGroup.add(lblUltrasonic);
    labelsGroup.add(createLeaderLine(0, TANK_H - 26, 0, -82, TANK_H - 18, 0, 0x38bdf8));

    const lblLayer = createTextSprite('CONCEPTUAL LAYER PROBE', '#f59e0b', '#d97706');
    lblLayer.position.set(-92, TANK_H - 52, 0);
    labelsGroup.add(lblLayer);
    labelsGroup.add(createLeaderLine(0, TANK_H - 68, 0, -92, TANK_H - 52, 0, 0xf59e0b));

    const lblScum = createTextSprite('SCUM / FOG CRUST', '#eab308', '#ca8a04');
    lblScum.position.set(92, 154, 0);
    labelsGroup.add(lblScum);
    labelsGroup.add(createLeaderLine(65, 150, 0, 92, 154, 0, 0xeab308));

    const lblLiquid = createTextSprite('CLARIFIED EFFLUENT', '#14b8a6', '#0d9488');
    lblLiquid.position.set(92, 95, 0);
    labelsGroup.add(lblLiquid);
    labelsGroup.add(createLeaderLine(65, 95, 0, 92, 95, 0, 0x14b8a6));

    const lblSludge = createTextSprite('SETTLED SLUDGE ZONE', '#f97316', '#ea580c');
    lblSludge.position.set(92, 28, 0);
    labelsGroup.add(lblSludge);
    labelsGroup.add(createLeaderLine(65, 24, 0, 92, 28, 0, 0xf97316));

    labelsGroupRef.current = labelsGroup;
    tankGroup.add(labelsGroup);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Fluid surface micro-waves
      if (scumMeshRef.current) {
        scumMeshRef.current.position.x = Math.sin(elapsedTime * 0.8) * 0.25;
        scumMeshRef.current.rotation.z = Math.sin(elapsedTime * 0.7) * 0.0015;
      }
      if (acousticConeRef.current && acousticConeRef.current.visible) {
        (acousticConeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(elapsedTime * 4.0) * 0.08;
      }

      // Suspended particles rising
      bubbleParticlesRef.current.forEach((b) => {
        b.position.y += (b.userData as { speedY: number }).speedY;
        b.position.x += Math.sin(elapsedTime * 2 + (b.userData as { angle: number }).angle) * 0.04;
        if (b.position.y > 140) {
          b.position.y = 52;
        }
      });

      // Gas particles floating
      if (gasParticlesGroupRef.current) {
        gasParticlesGroupRef.current.children.forEach((p) => {
          p.position.y += (p.userData as { speed: number }).speed;
          p.position.x += Math.sin(elapsedTime * 2 + (p.userData as { floatAngle: number }).floatAngle) * 0.05;
          if (p.position.y > 175) {
            p.position.y = 150;
          }
        });
      }

      // Inspection cover lifting animation when open
      if (coverMeshGroupRef.current) {
        const targetY = isCoverOpen ? TANK_H + 55 + WALL : TANK_H + 20 + WALL;
        const targetRotX = isCoverOpen ? -Math.PI / 4 : 0;
        coverMeshGroupRef.current.position.y += (targetY - coverMeshGroupRef.current.position.y) * 0.1;
        coverMeshGroupRef.current.rotation.x += (targetRotX - coverMeshGroupRef.current.rotation.x) * 0.1;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
    };
  }, []);

  // --- REACT STATE SYNC TO THREE.JS MESHES ---
  useEffect(() => {
    const totalHeight = sensorData.totalTankHeight || 180;
    const sludge = Math.max(2, sensorData.sludgeDepth);
    const scum = Math.max(2, sensorData.scumThickness);
    const liquid = Math.max(5, totalHeight - sludge - scum - 20);

    // 1. Sludge Mesh update
    if (sludgeMeshRef.current) {
      sludgeMeshRef.current.scale.y = sludge / 48;
      sludgeMeshRef.current.position.y = sludge / 2;
    }

    // 2. Liquid Mesh update
    if (liquidMeshRef.current) {
      liquidMeshRef.current.scale.y = liquid / 92;
      liquidMeshRef.current.position.y = sludge + liquid / 2;
    }

    // 3. Scum Mesh update
    if (scumMeshRef.current) {
      scumMeshRef.current.scale.y = scum / 12;
      scumMeshRef.current.position.y = sludge + liquid + scum / 2;
    }

    // 4. Acoustic Cone distance update
    if (acousticConeRef.current) {
      const scumTop = sludge + liquid + scum;
      const transducerPos = 180 - 31;
      const coneHeight = Math.max(10, transducerPos - scumTop);
      acousticConeRef.current.scale.y = coneHeight / 32;
      acousticConeRef.current.position.y = transducerPos - coneHeight / 2;
    }

    // 5. Gas Particles density
    if (gasParticlesGroupRef.current) {
      const isGasHazard = sensorData.gasLevel >= 150;
      gasParticlesGroupRef.current.visible = showGasParticles && sensorData.gasLevel > 40;
      gasParticlesGroupRef.current.children.forEach((p) => {
        const mesh = p as THREE.Mesh;
        const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshBasicMaterial;
        if (mat) {
          mat.color.setHex(isGasHazard ? 0xef4444 : 0xd97706);
          mat.opacity = Math.min(0.8, sensorData.gasLevel / 400);
        }
      });
    }

    // 6. LED Indicator Sync
    const isHazard = sensorData.gasLevel >= 150 || faults.gasFailed || faults.ultrasonicFailed || faults.esp32Offline;
    if (redLedLightRef.current && greenLedLightRef.current && redLedMeshRef.current && greenLedMeshRef.current) {
      if (isHazard) {
        redLedLightRef.current.intensity = 3.0;
        greenLedLightRef.current.intensity = 0;
        (redLedMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xff0000);
        (greenLedMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0x15803d);
      } else {
        redLedLightRef.current.intensity = 0;
        greenLedLightRef.current.intensity = 2.0;
        (redLedMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0x991b1b);
        (greenLedMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e);
      }
    }
  }, [sensorData, faults, showGasParticles]);

  // Sync Toggles
  useEffect(() => {
    if (cutawayWallRef.current) cutawayWallRef.current.visible = !showCutaway;
  }, [showCutaway]);

  useEffect(() => {
    if (acousticConeRef.current) acousticConeRef.current.visible = showBeam;
  }, [showBeam]);

  useEffect(() => {
    if (labelsGroupRef.current) labelsGroupRef.current.visible = showLabels;
  }, [showLabels]);

  useEffect(() => {
    if (wiringGroupRef.current) wiringGroupRef.current.visible = showWiring;
  }, [showWiring]);

  useEffect(() => {
    if (explodedGroupRef.current) explodedGroupRef.current.visible = explodedHousingMode;
  }, [explodedHousingMode]);

  // Camera presets
  const setCameraPreset = (preset: 'iso' | 'front' | 'top' | 'probe') => {
    playSingleClick();
    if (!cameraRef.current || !controlsRef.current) return;
    if (preset === 'iso') {
      cameraRef.current.position.set(210, 150, 240);
      controlsRef.current.target.set(0, 75, 0);
    } else if (preset === 'front') {
      cameraRef.current.position.set(0, 90, 310);
      controlsRef.current.target.set(0, 90, 0);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 340, 30);
      controlsRef.current.target.set(0, 75, 0);
    } else if (preset === 'probe') {
      cameraRef.current.position.set(40, 210, 80);
      controlsRef.current.target.set(10, 180, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[550px] bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col group">
      {/* Viewport Top Control Bar */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Status Pill */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 rounded-lg flex items-center gap-2.5 shadow-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${sensorData.gasLevel >= 150 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          <div>
            <div className="text-[11px] font-mono font-bold tracking-tight text-slate-900 leading-none">
              PHYSICAL DIGITAL TWIN
            </div>
            <div className="text-[9px] text-slate-500 font-mono">180 cm CUTAWAY TANK MODEL</div>
          </div>
        </div>

        {/* Camera Views & Reset */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 p-1 rounded-lg shadow-xs text-xs font-medium">
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition font-mono"
            title="Isometric Perspective"
          >
            Iso
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition font-mono"
            title="Front Cross-Section"
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition font-mono"
            title="Inspection Top View"
          >
            Top
          </button>
          <button
            onClick={() => setCameraPreset('probe')}
            className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition font-mono"
            title="Zoom Sensor Node"
          >
            Node
          </button>
          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={() => setCameraPreset('iso')}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing grid-blueprint relative" />

      {/* Viewport Overlay Controls Bottom */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2 z-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowCutaway(!showCutaway)}
            className={`px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 transition ${
              showCutaway ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-slate-500" /> Cutaway: <span className="font-bold text-emerald-700">{showCutaway ? 'OPEN' : 'SHELL'}</span>
          </button>

          <button
            onClick={() => setShowBeam(!showBeam)}
            className={`px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 transition ${
              showBeam ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-teal-600" /> Ultrasonic Cone: <span className="font-bold text-emerald-700">{showBeam ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 transition ${
              showLabels ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-slate-500" /> 3D Labels: <span className="font-bold text-emerald-700">{showLabels ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setExplodedHousingMode(!explodedHousingMode)}
            className={`px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 transition ${
              explodedHousingMode ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" /> Exploded Enclosure
          </button>
        </div>

        {/* Inspection Cover Interlock Trigger Button */}
        <button
          onClick={onOpenCoverRequest}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition ${
            sensorData.gasLevel >= 150
              ? 'bg-red-600 text-white hover:bg-red-500 border border-red-500 animate-pulse'
              : isCoverOpen
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {sensorData.gasLevel >= 150 ? (
            <>
              <AlertTriangle className="w-4 h-4" /> Cover Locked (Gas Hazard)
            </>
          ) : isCoverOpen ? (
            <>
              <ShieldCheck className="w-4 h-4" /> Close Inspection Cover
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Open Inspection Cover
            </>
          )}
        </button>
      </div>
    </div>
  );
};
