const container = document.getElementById("game-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a10);
scene.fog = new THREE.FogExp2(0x0a0a10, 0.05);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x222233, 1.2);
scene.add(ambientLight);

const flashlight = new THREE.SpotLight(0xffffff, 2, 25, Math.PI / 6, 0.5);
flashlight.castShadow = true;
scene.add(flashlight);

const floorGeometry = new THREE.PlaneGeometry(50, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const playerGroup = new THREE.Group();
const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00a8ff });
const playerMesh = new THREE.Mesh(bodyGeo, bodyMat);
playerMesh.position.y = 0.9;
playerMesh.castShadow = true;
playerGroup.add(playerMesh);
playerGroup.position.set(0, 0, 40);
scene.add(playerGroup);

playerGroup.add(flashlight);
flashlight.position.set(0, 1.5, 0);
flashlight.target.position.set(0, 1.5, -5);
playerGroup.add(flashlight.target);

const wordGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const wordMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0x443300 });
const wordItem = new THREE.Mesh(wordGeometry, wordMaterial);
wordItem.position.set(0, 1, 10);
scene.add(wordItem);

let collectedCount = 0;

function handleTVInteraction() {
  const dist = playerGroup.position.distanceTo(wordItem.position);
  if (dist < 3.0) {
    collectedCount++;
    document.getElementById("score").innerText = `સંગ્રહિત શબ્દો (Collected Words): ${collectedCount}`;
    document.getElementById("question-text").innerText = "સાચો જવાબ! આગળ વધો (Correct! Move ahead to next room)";
    
    wordItem.position.set((Math.random() - 0.5) * 10, 1, playerGroup.position.z - 15);
  }
}

const moveSpeed = 0.15;
const turnSpeed = 0.04;

function animate() {
  requestAnimationFrame(animate);

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

  wordItem.rotation.y += 0.02;

  const relativeCameraOffset = new THREE.Vector3(0, 3.5, 7);
  const cameraPosition = relativeCameraOffset.applyMatrix4(playerGroup.matrixWorld);
  camera.position.lerp(cameraPosition, 0.1);
  camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0)));

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
