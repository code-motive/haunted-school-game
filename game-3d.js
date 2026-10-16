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
const floorGeometry = new THREE.PlaneGeometry(60, 350);
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
playerGroup.position.set(0, 0, 140);
scene.add(playerGroup);

// Flashlight tracks player heading
playerGroup.add(flashlight);
flashlight.position.set(0, 1.6, 0);
flashlight.target.position.set(0, 1.6, -10);
playerGroup.add(flashlight.target);

// 5. Five Levels with Broken Definition Word Sequences in Gujarati
const gameLevels = [
  {
    level: 1,
    title: "સ્તર 1: માંગ (Demand)",
    words: ["ચોક્કસ", "કિંમતે", "અને", "સમયે", "ખરીદવાની", "ઇચ્છા"],
    positions: [
      new THREE.Vector3(0, 1, 100),
      new THREE.Vector3(-3, 1, 85),
      new THREE.Vector3(3, 1, 70),
      new THREE.Vector3(-3, 1, 55),
      new THREE.Vector3(3, 1, 40),
      new THREE.Vector3(0, 1, 25)
    ],
    color: 0xffcc00
  },
  {
    level: 2,
    title: "સ્તર 2: પુરવઠો (Supply)",
    words: ["વેપારી", "દ્વારા", "બજારમાં", "વેચાણ", "માટેનો", "જથ્થો"],
    positions: [
      new THREE.Vector3(0, 1, 10),
      new THREE.Vector3(-3, 1, -5),
      new THREE.Vector3(3, 1, -20),
      new THREE.Vector3(-3, 1, -35),
      new THREE.Vector3(3, 1, -50),
      new THREE.Vector3(0, 1, -65)
    ],
    color: 0x00ffcc
  },
  {
    level: 3,
    title: "સ્તર 3: ફુગાવો (Inflation)",
    words: ["ભાવ", "સપાટીમાં", "થતો", "સતત", "મોટો", "વધારો"],
    positions: [
      new THREE.Vector3(0, 1, -85),
      new THREE.Vector3(-3, 1, -100),
      new THREE.Vector3(3, 1, -115),
      new THREE.Vector3(-3, 1, -130),
      new THREE.Vector3(3, 1, -145),
      new THREE.Vector3(0, 1, -160)
    ],
    color: 0xff4444
  },
  {
    level: 4,
    title: "સ્તર 4: કૌટિલ્ય અર્થશાસ્ત્ર (Kautilya's Economics)",
    words: ["રાજકીય", "શાસન", "કરવેરા", "નીતિ", "શાસ્ત્ર"],
    positions: [
      new THREE.Vector3(0, 1, -180),
      new THREE.Vector3(-3, 1, -195),
      new THREE.Vector3(3, 1, -210),
      new THREE.Vector3(-3, 1, -225),
      new THREE.Vector3(0, 1, -240)
    ],
    color: 0xaa44ff
  },
  {
    level: 5,
    title: "સ્તર 5: જી.ડી.પી. (GDP)",
    words: ["દેશની", "સીમામાં", "ઉત્પન્ન", "કુલ", "મૂલ્ય"],
    positions: [
      new THREE.Vector3(0, 1, -260),
      new THREE.Vector3(-3, 1, -275),
      new THREE.Vector3(3, 1, -290),
      new THREE.Vector3(-3, 1, -305),
      new THREE.Vector3(0, 1, -320)
    ],
    color: 0x44ff44
  }
];

let currentLevelIndex = 0;
let currentWordIndex = 0;
let collectedSentence = [];

// Canvas helper to generate Textures from Gujarati text strings so they appear on 3D blocks
function createTextTexture(text, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = "#111119";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Text wrapping / rendering
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Build 3D word blocks for the current level
let activeWordMeshes = [];

function loadLevelWords() {
  // Clear previous level meshes if any
  activeWordMeshes.forEach(m => scene.remove(m));
  activeWordMeshes = [];

  const lvl = gameLevels[currentLevelIndex];
  currentWordIndex = 0;
  collectedSentence = [];

  lvl.words.forEach((word, idx) => {
    const boxGeo = new THREE.BoxGeometry(2.5, 1.2, 0.4);
    const texture = createTextTexture(word, `#${lvl.color.toString(16)}`);
    const boxMat = new THREE.MeshBasicMaterial({ map: texture });
    
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.position.copy(lvl.positions[idx]);
    
    // Store metadata on mesh
    mesh.userData = { wordIndex: idx, wordText: word };
    scene.add(mesh);
    activeWordMeshes.push(mesh);
  });

  updateHUD();
}

function updateHUD() {
  const lvl = gameLevels[currentLevelIndex];
  const targetWord = lvl.words[currentWordIndex];
  
  document.getElementById("score").innerText = `સ્તર ${currentLevelIndex + 1} / 5 | સંગ્રહિત: ${collectedSentence.join(" ")}`;
  document.getElementById("question-text").innerHTML = `
    <b>${lvl.title}</b><br>
    <span style="font-size:22px; color:#ffcc00;">આગળનો સાચો શબ્દ શોધો: <b>[ ${targetWord} ]</b></span><br>
    <span style="font-size:16px; color:#aaa;">પૂર્ણ વાક્ય: ${collectedSentence.join(" ")}</span>
  `;
}

// Initialize Level 1
loadLevelWords();

// 6. TV Remote Interaction Handler (Triggered by Enter / OK button)
function handleTVInteraction() {
  if (currentLevelIndex >= gameLevels.length) return;

  const lvl = gameLevels[currentLevelIndex];
  const targetMesh = activeWordMeshes[currentWordIndex];
  
  if (!targetMesh || !targetMesh.visible) return;

  const dist = playerGroup.position.distanceTo(targetMesh.position);

  // Proximity check to collect word block
  if (dist < 5.0) {
    // Correct sequential word collected!
    collectedSentence.push(targetMesh.userData.wordText);
    targetMesh.visible = false; // Hide collected word box
    currentWordIndex++;

    if (currentWordIndex < lvl.words.length) {
      // Prompt next word in sequence
      updateHUD();
    } else {
      // Level Completed! Advance to next economic definition level
      currentLevelIndex++;
      if (currentLevelIndex < gameLevels.length) {
        document.getElementById("question-text").innerHTML = `🎉 <b>સ્તર પૂરું થયું!</b> આગલા સ્તર પર જઈ રહ્યા છીએ...`;
        setTimeout(loadLevelWords, 2000);
      } else {
        document.getElementById("score").innerText = `વિજેતા! (All Levels Completed!)`;
        document.getElementById("question-text").innerHTML = `🏆 અભિનંદન! તમે બધા જ અર્થશાસ્ત્રીય શબ્દો સાચા ક્રમમાં ગોઠવી દીધા!`;
      }
    }
  } else {
    document.getElementById("question-text").innerHTML += `<br><span style="color:#ff4444; font-size:16px;">[આ શબ્દની વધુ નજીક જઈને OK દબાવો!]</span>`;
  }
}

// 7. Continuous Movement & D-Pad Animation Loop
const moveSpeed = 0.22;
const turnSpeed = 0.05;

function animate() {
  requestAnimationFrame(animate);

  if (typeof remoteState !== 'undefined') {
    if (remoteState.forward) {
      playerGroup.translateZ(-moveSpeed);
    }
    if (remoteState.backward) {
      playerGroup.translateZ(moveSpeed);
    }
    if (remoteState.turnLeft) {
      playerGroup.rotation.y += turnSpeed;
    }
    if (remoteState.turnRight) {
      playerGroup.rotation.y -= turnSpeed;
    }
  }

  // Gently rotate uncollected word blocks
  activeWordMeshes.forEach(mesh => {
    if (mesh.visible) {
      mesh.rotation.y += 0.015;
    }
  });

  // Smooth Third-Person Camera Tracking
  const relativeCameraOffset = new THREE.Vector3(0, 4.0, 8.5);
  const cameraPosition = relativeCameraOffset.applyMatrix4(playerGroup.matrixWorld);
  camera.position.lerp(cameraPosition, 0.15);
  camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.4, 0)));

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
