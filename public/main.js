// Custom Cursor Logic
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const hoverables = document.querySelectorAll('.hoverable');
hoverables.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hover-link'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hover-link'));
});

function renderCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
  requestAnimationFrame(renderCursor);
}
renderCursor();

// ==========================================
// THREE.JS CINEMATIC SCENE - IRON MAN MECHANICAL HOUSE
// ==========================================

const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 8, 35);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;

const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.9; 
bloomPass.strength = 1.5;
bloomPass.radius = 0.5;

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Cinematic Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const rimLight = new THREE.SpotLight(0xffffff, 5);
rimLight.position.set(20, 25, -20);
rimLight.angle = Math.PI / 4;
rimLight.penumbra = 0.8;
rimLight.castShadow = true;
scene.add(rimLight);

const keyLight = new THREE.SpotLight(0xD4AF37, 2);
keyLight.position.set(-20, 15, 20);
keyLight.angle = Math.PI / 4;
keyLight.penumbra = 0.5;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x224488, 1);
fillLight.position.set(0, -5, 5);
scene.add(fillLight);

const architectureGroup = new THREE.Group();
scene.add(architectureGroup);

// Load Real Textures
const texLoader = new THREE.TextureLoader();
texLoader.setCrossOrigin('anonymous');

const texConcrete = texLoader.load('https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=512&q=80');
texConcrete.wrapS = THREE.RepeatWrapping; texConcrete.wrapT = THREE.RepeatWrapping; texConcrete.repeat.set(1, 1);

const texWood = texLoader.load('https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=512&q=80');
texWood.wrapS = THREE.RepeatWrapping; texWood.wrapT = THREE.RepeatWrapping; texWood.repeat.set(2, 2);

// Premium Materials
const matObsidian = new THREE.MeshStandardMaterial({
  map: texConcrete, color: 0x444444, roughness: 0.8, metalness: 0.2, side: THREE.DoubleSide
});
const matWood = new THREE.MeshStandardMaterial({
  map: texWood, color: 0xaa8866, roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide
});
const matPlaster = new THREE.MeshStandardMaterial({
  color: 0xdddddd, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide
});
const matGlass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, transmission: 0.95, opacity: 1, metalness: 0.1, roughness: 0.05, ior: 1.5, thickness: 0.5, transparent: true, side: THREE.DoubleSide
});

// CORE LOGIC: Iron Man Mechanical Panel Builder
const allParts = [];

function createMechanicalWall(w, h, d, x, y, z, rotY, rows, cols, mat, isGlass=false) {
  const panelW = w / cols;
  const panelH = h / rows;
  const panelD = d;
  
  for(let r=0; r<rows; r++) {
    for(let c=0; c<cols; c++) {
      // Create gaps between panels for the mechanical armor look (0.9 multiplier)
      const geo = new THREE.BoxGeometry(panelW * 0.9, panelH * 0.9, panelD);
      const mesh = new THREE.Mesh(geo, mat.clone());
      
      const localX = (c - cols/2 + 0.5) * panelW;
      const localY = (r - rows/2 + 0.5) * panelH;
      const localZ = 0;
      
      // Absolute position based on rotation
      const absX = x + localX * Math.cos(rotY) + localZ * Math.sin(rotY);
      const absZ = z - localX * Math.sin(rotY) + localZ * Math.cos(rotY);
      const absY = y + localY;
      
      mesh.position.set(absX, absY, absZ);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      architectureGroup.add(mesh);
      
      // Compute Explode Outward vectors (Unwearing the suit)
      // Normal vector
      const normX = Math.sin(rotY);
      const normZ = Math.cos(rotY);
      
      const pushOutDist = 15 + Math.random() * 20;
      const explodeX = absX + normX * pushOutDist + (Math.random() - 0.5) * 20;
      const explodeY = absY + (Math.random() - 0.5) * 20 + 15;
      const explodeZ = absZ + normZ * pushOutDist + (Math.random() - 0.5) * 20;
      
      allParts.push({
        mesh,
        targetX: absX, targetY: absY, targetZ: absZ, targetRotY: rotY,
        normX, normZ, // Surface normal for the flap animation
        explodeX, explodeY, explodeZ,
        explodeRotX: Math.random() * Math.PI * 4, explodeRotY: Math.random() * Math.PI * 4, explodeRotZ: Math.random() * Math.PI * 4
      });
    }
  }
}

// BUILD THE HOUSE OUT OF 500+ MECHANICAL PANELS!
// Ground Floor
createMechanicalWall(18, 4, 0.5, 0, 2, -6, 0, 8, 16, matObsidian); // Back Wall
createMechanicalWall(12, 4, 0.5, -8.75, 2, 0, Math.PI/2, 8, 12, matObsidian); // Left Wall
createMechanicalWall(12, 4, 0.5, 8.75, 2, 0, Math.PI/2, 8, 12, matObsidian); // Right Wall
createMechanicalWall(17, 4, 0.1, 0, 2, 5.9, 0, 4, 12, matGlass, true); // Glass Front

// Upper Floor Slab (Horizontal Panels)
createMechanicalWall(20, 14, 0.5, 0, 4.25, 0, -Math.PI/2, 10, 14, matWood);

// Upper Master Bedroom Cantilever
createMechanicalWall(10, 4, 0.5, -3, 6.5, -2, 0, 6, 10, matPlaster); // Back
createMechanicalWall(8, 4, 0.5, -8, 6.5, 2, Math.PI/2, 6, 8, matPlaster); // Left
createMechanicalWall(8, 4, 0.5, 2, 6.5, 2, Math.PI/2, 6, 8, matPlaster); // Right
createMechanicalWall(10, 4, 0.1, -3, 6.5, 6, 0, 3, 8, matGlass, true); // Front glass

// Roof Slab
createMechanicalWall(22, 16, 0.5, 0, 8.75, 0, -Math.PI/2, 12, 16, matObsidian);

// Center the group
architectureGroup.position.y = -4;

// Add a solid glowing core inside the house (The Arc Reactor!)
const coreGeo = new THREE.OctahedronGeometry(2, 0);
const coreMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true });
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
coreMesh.position.set(0, 4, 0);
architectureGroup.add(coreMesh);
const coreLight = new THREE.PointLight(0x00aaff, 5, 20);
coreMesh.add(coreLight);

// LUXURIOUS PENTHOUSE INTERIOR
const interiorGroup = new THREE.Group();
interiorGroup.position.set(-3, 4.5, 2); // Center of the penthouse floor
architectureGroup.add(interiorGroup);

// Luxurious Rug
const rugGeo = new THREE.PlaneGeometry(6, 4);
const rugMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0, transparent: true, opacity: 0 });
const rug = new THREE.Mesh(rugGeo, rugMat);
rug.rotation.x = -Math.PI / 2;
rug.position.y = 0.01; // Slightly above floor
interiorGroup.add(rug);

// Modern Couch (L-Shape)
const couchMat = new THREE.MeshStandardMaterial({ color: 0xeaeaea, roughness: 0.8, transparent: true, opacity: 0 });
const couchBase1 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 1.5), couchMat);
couchBase1.position.set(0, 0.25, -1);
interiorGroup.add(couchBase1);

const couchBack1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.5), couchMat);
couchBack1.position.set(0, 1, -1.5);
interiorGroup.add(couchBack1);

const couchBase2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 3), couchMat);
couchBase2.position.set(1.25, 0.25, 0.5);
interiorGroup.add(couchBase2);

// Glass Coffee Table
const tableMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, opacity: 0, transparent: true, roughness: 0.1 });
const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.1, 32), tableMat);
tableTop.position.set(-0.5, 0.6, 0.5);
interiorGroup.add(tableTop);

// Table base (gold)
const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 1, roughness: 0.2, transparent: true, opacity: 0 });
const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 0.5, 32), goldMat);
tableBase.position.set(-0.5, 0.25, 0.5);
interiorGroup.add(tableBase);

// Floor Lamp
const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 16), goldMat);
lampBase.position.set(-2.5, 1.5, -1);
interiorGroup.add(lampBase);

const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffddaa, transparent: true, opacity: 0 }));
lampBulb.position.set(-2.5, 3, -1);
interiorGroup.add(lampBulb);

const lampLight = new THREE.PointLight(0xffddaa, 0, 10);
lampLight.position.set(-2.5, 3, -1);
interiorGroup.add(lampLight);

// Abstract Artwork on the back wall
const artGeo = new THREE.PlaneGeometry(2.5, 1.2);
const artMat = new THREE.MeshStandardMaterial({ color: 0xaa2222, metalness: 0.5, roughness: 0.2, transparent: true, opacity: 0 });
const art = new THREE.Mesh(artGeo, artMat);
art.position.set(0, 1.8, -1.9); // Back wall is at z=-2 relative to penthouse center
interiorGroup.add(art);

// Cinematic Dust
const particleCount = 1000;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount; i++) {
  pPos[i*3] = (Math.random() - 0.5) * 40;
  pPos[i*3+1] = (Math.random() - 0.5) * 40;
  pPos[i*3+2] = (Math.random() - 0.5) * 40;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({
  color: 0x00aaff, size: 0.05, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Initial Hero Rotation - Center the house perfectly
architectureGroup.rotation.y = -Math.PI / 6;
architectureGroup.rotation.x = 0.1;
architectureGroup.position.x = 0;

// GSAP ScrollTrigger Choreography - IRON MAN UNWEAR
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#scroll-content",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5,
  }
});

// Section 1: Hero -> Properties (Mechanical Flaps Open!)
// Every single panel pushes outward slightly and rotates exactly 90 degrees like armor vents opening
tl.to(camera.position, { x: 0, y: 12, z: 40, duration: 1 }, 0)
  .to(architectureGroup.rotation, { x: 0, y: -Math.PI / 6, z: 0, duration: 1 }, 0);

allParts.forEach((part, i) => {
  // Push out along surface normal
  tl.to(part.mesh.position, {
    x: part.targetX + part.normX * 1.5,
    y: part.targetY,
    z: part.targetZ + part.normZ * 1.5,
    duration: 1, ease: "back.out(2)"
  }, 0 + (i % 20) * 0.01);
  
  // Rotate exactly 90 degrees on the X axis to "open the flap"
  tl.to(part.mesh.rotation, {
    x: part.targetRotY === 0 ? Math.PI/2 : 0, // Flap logic
    y: part.targetRotY,
    z: part.targetRotY !== 0 ? Math.PI/2 : 0, // Flap logic
    duration: 1, ease: "power2.inOut"
  }, 0 + (i % 20) * 0.01);
});

// Flash bloom as vents open
tl.to(bloomPass, { strength: 3.0, radius: 1.5, duration: 0.5 }, 0.5)
  .to(bloomPass, { strength: 1.5, radius: 0.5, duration: 0.5 }, 1.0);

// Section 2: Properties -> Blueprint (Unwear the suit!)
// All panels detach and shoot up into the sky
tl.to(camera.position, { x: 10, y: 4, z: 25, duration: 1.5 }, 1)
  .to(architectureGroup.rotation, { y: Math.PI / 4, duration: 1.5 }, 1);

allParts.forEach((part, i) => {
  tl.to(part.mesh.position, {
    x: part.explodeX, y: part.explodeY, z: part.explodeZ,
    duration: 1.5, ease: "power3.inOut"
  }, 1 + (i % 10) * 0.02);
  
  tl.to(part.mesh.rotation, {
    x: part.explodeRotX, y: part.explodeRotY, z: part.explodeRotZ,
    duration: 1.5, ease: "power3.inOut"
  }, 1 + (i % 10) * 0.02);
});

// Section 3: Blueprint -> Exploded (Fade away the suit)
// Panels scale down to 0, leaving only the glowing core
tl.to(camera.position, { x: 0, y: 4, z: 15, duration: 1 }, 2)
  .to(architectureGroup.rotation, { y: Math.PI, duration: 1 }, 2);

allParts.forEach((part, i) => {
  tl.to(part.mesh.scale, {
    x: 0, y: 0, z: 0,
    duration: 1, ease: "power2.in"
  }, 2 + (i % 20) * 0.01);
});

// Pulse the core
tl.to(coreLight, { intensity: 20, distance: 40, duration: 1 }, 2.5)
  .to(coreMesh.scale, { x: 2, y: 2, z: 2, duration: 1, ease: "back.out(2)" }, 2.5);

// Section 4: Exploded -> Day/Night (Reassemble!)
// Like the suit reforming, they snap back instantly
tl.to(camera.position, { x: -10, y: 15, z: 20, duration: 1.5 }, 3)
  .to(architectureGroup.rotation, { y: Math.PI * 2, duration: 1.5 }, 3)
  .to(coreMesh.scale, { x: 1, y: 1, z: 1, duration: 1 }, 3);

allParts.forEach((part, i) => {
  tl.to(part.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power4.out" }, 3);
  tl.to(part.mesh.position, { x: part.targetX, y: part.targetY, z: part.targetZ, duration: 1.5, ease: "back.out(1.5)" }, 3 + (i % 15) * 0.01);
  tl.to(part.mesh.rotation, { x: 0, y: part.targetRotY, z: 0, duration: 1.5, ease: "back.out(1.5)" }, 3 + (i % 15) * 0.01);
});

// Huge reassembly flash
tl.to(bloomPass, { strength: 4.0, radius: 2.0, duration: 0.5 }, 3.5)
  .to(bloomPass, { strength: 1.5, radius: 0.5, duration: 0.5 }, 4.0);

// Section 5: Entering the Picture Interior (Hyper-Dolly In)
// Move into the luxurious penthouse interior we built!
tl.to(camera.position, { x: -1, y: 6.5, z: 6, duration: 1, ease: "power4.inOut" }, 4)
  .to(camera.rotation, { x: -0.1, y: 0.3, z: 0, duration: 1, ease: "power4.inOut" }, 4);

// Fade in the interior and turn on the lamp light in Section 4/5
interiorGroup.traverse(child => {
  if (child.isMesh) {
    tl.to(child.material, { opacity: 1, duration: 0.5 }, 3.5); // Fade in during reassembly
  }
});
tl.to(lampLight, { intensity: 2, duration: 0.5 }, 3.5);

// 7. Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();
  
  coreMesh.rotation.y = time;
  coreMesh.rotation.x = time * 0.5;
  
  architectureGroup.position.y = -4 + Math.sin(time * 0.5) * 0.1;
  particles.rotation.y = time * 0.03;
  
  composer.render();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

window.onload = () => {
  const preloader = document.getElementById('cipher-preloader');
  const brandReveal = document.querySelector('.brand-reveal');
  
  if (!preloader) {
    animate();
    return;
  }

  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.random() * 10 + 15; // Random large jump
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      if (brandReveal) brandReveal.style.setProperty('--fill', '100%');
      
      setTimeout(() => {
        preloader.classList.add('loaded'); // Opens the cinematic doors
        animate(); // Start the 3D render loop
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 800); // Door transition is 0.8s now
      }, 150); // Minimal pause before opening doors
    } else {
      if (brandReveal) brandReveal.style.setProperty('--fill', `${progress}%`);
    }
  }, 40); // Fast interval
};
