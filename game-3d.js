// 1. Scene, Camera, and Renderer Setup
const container = document.getElementById("game-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a10); // Spooky dark atmosphere
scene.fog = new THREE.FogExp2(0x0a0a10, 0.035);  // Corridor fog

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 2. Atmospheric Lighting
const ambientLight = new THREE.AmbientLight(0x333344, 1.2);
scene.add(ambientLight);

const flashlight = new THREE.SpotLight(0xffffff, 2.5, 35, Math.PI / 5, 0.4);
flashlight.castShadow = true;
scene.add(flashlight);

// 3. School Environment (Floor & Corridor Walls)
const floorGeometry = new THREE.PlaneGeometry(60, 300);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.9 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 4. Player Character ("MD" Hero)
const playerGroup = new THREE.Group();
const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.0, 16);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00a8ff, roughness: 0.3 });
const playerMesh = new THREE.Mesh(bodyGeo, bodyMat);
playerMesh.position.y = 1.0;
playerMesh.castShadow = true;
playerGroup.add(playerMesh);

// Starting position at the end of the hall
playerGroup.position.set(0, 0, 120);
scene.add(playerGroup);

// Flashlight tracks player heading
playerGroup.add(flashlight);
flashlight.position.set(0, 1.6, 0);
flashlight.target.position.set(0, 1.6, -10);
playerGroup.add(flashlight.target);

// 5. Five Distinct Levels with Gujarati Economic Definitions
const gameLevels = [
  {
    level: 1,
    title: "સ્તર 1: માંગ (Demand)",
    definition: "ચોક્કસ કિંમતે અને સમયે ગ્રાહક દ્વારા વસ્તુ ખરીદવાની ઇચ્છા, શક્તિ અને તૈયારી.",
    pos: new THREE.Vector3(0, 1, 80),
    color: 0xffcc00
  },
  {
    level: 2,
    title: "સ્તર 2: પુરવઠો (Supply)",
    definition: "ઉત્પાદક કે વે્રેતા દ્વારા બજારમાં ચોક્કસ કિંમતે વેચાણ માટે ઉપલબ્ધ કુલ જથ્થો.",
    pos: new THREE.Vector3(-4, 1, 40),
    color: 0x00ffcc
  },
  {
    level: 3,
    title: "સ્તર 3: ફુગાવો (Inflation)",
    definition: "દેશમાં ચીજવસ્તુઓની સામાન્ય કિંમત સપાટીમાં થતો સતત અને ઊંચો વધારો.",
    pos: new THREE.Vector3(4, 1, 0),
    color: 0xff4444
  },
  {
    level: 4,
    title: "સ્તર 4: કૌટિલ્ય અર્થશાસ્ત્ર (Kautilya's Economics)",
    definition: "રાજકીય અર્થવ્યવસ્થા, કરવેરા નીતિ અને કુશળ રાજ્ય સંચાલનનું પ્રાચીન ભારતીય શાસ્ત્ર.",
    pos: new THREE.Vector3(-4, 1, -40),
    color: 0xaa44ff
  },
  {
    level: 5,
    title: "સ્તર 5: જી.ડી.પી. - GDP (Gross Domestic Product)",
    definition: "એક વર્ષ દરમિયાન દેશની ભૌગોલિક સીમામાં ઉત્પન્ન થયેલ તમામ અંતિમ વસ્તુઓ અને સેવાનું કુલ મૂલ્ય.",
    pos: new THREE.Vector3(0, 1, -80),
    color: 0x44ff44
  }
];

let currentLevelIndex = 0;

// Create 3D target boxes for all levels
const levelMeshes = [];
gameLevels.forEach((lvl, index) => {
  const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const boxMat = new THREE.MeshStandardMaterial({ 
    color: index === 0 ? lvl.color : 0x555555, 
    emissive: index === 0 ? 0x443300 : 0x111111 
  });
  const mesh = new THREE.Mesh(boxGeo, boxMat);
  mesh.position.copy(lvl.pos);
  scene.add(mesh);
  levelMeshes.push(mesh);
});

// Initialize HUD display
function updateHUD() {
  const current = gameLevels[currentLevelIndex];
  document.getElementById("score").innerText = `પ્રગતિ (Progress): સ્તર ${currentLevelIndex + 1} / 5`;
  document.getElementById("question-text").innerHTML = `<b>${current.title}</b><br><span style="font-size:20px; color:#ffcc00;">${current.definition}</span>`;
}
updateHUD();

// 6. TV Remote Interaction Handler (Triggered by Enter / OK button)
function handleTVInteraction() {
  if (currentLevelIndex >= gameLevels.length) return;

  const targetPos = gameLevels[currentLevelIndex].pos;
  const dist = playerGroup.position.distanceTo(targetPos);

  // Interaction distance threshold
  if (dist < 5.0) {
    // Hide current level box
    levelMeshes[currentLevelIndex].visible = false;
    currentLevelIndex++;

    if (currentLevelIndex < gameLevels.length) {
      updateHUD();
      // Highlight next level box
      levelMeshes[currentLevelIndex].material.color.setHex(gameLevels[currentLevelIndex].color);
      levelMeshes[currentLevelIndex].material.emissive.setHex(0x333300);
    } else {
      document.getElementById("score").innerText = `અભિનંદન! (Completed!)`;
      document.getElementById("question-text").innerHTML = `🎉 તમામ ૫ સ્તરો સફળતાપૂર્વક પૂર્ણ થયા! તમે અર્થશાસ્ત્રના નિષ્ણાત બન્યા!`;
    }
  } else {
    document.getElementById("question-text").innerHTML += `<br><span style="color:#ff4444; font-size:16px;">[આ બોક્સની વધુ નજીક જઈને OK બટન દબાવો!]</span>`;
  }
}

// 7. Continuous Movement & D-Pad Fix Animation Loop
const moveSpeed = 0.22;
const turnSpeed = 0.05; // Tuned for smooth remote turning

function animate() {
  requestAnimationFrame(animate);

  // Directly check remoteState flags updated continuously from tv-controls.js
  if (typeof remoteState !== 'undefined') {
    if (remoteState.forward) {
      playerGroup.translateZ(-moveSpeed);
    }
    if (remoteState.backward) {
      playerGroup.translateZ(moveSpeed);
    }
    if (remoteState.turnLeft) {
      playerGroup.rotation.y += turnSpeed; // D-Pad Left turns character left
    }
    if (remoteState.turnRight) {
      playerGroup.rotation.y -= turnSpeed; // D-Pad Right turns character right
    }
  }

  // Rotate active level boxes for eerie visual effect
  levelMeshes.forEach((mesh, idx) => {
    if (mesh.visible) {
      mesh.rotation.y += 0.02;
    }
  });

  // Smooth Third-Person Camera Tracking
  const relativeCameraOffset = new THREE.Vector3(0, 4.0, 8.5);
  const cameraPosition = relativeCameraOffset.applyMatrix4(playerGroup.matrixWorld);
  camera.position.lerp(cameraPosition, 0.15);
  camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.4, 0)));

  renderer.render(scene, camera);
}

// Responsive resizing for Samsung TV screens
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
