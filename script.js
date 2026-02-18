import * as THREE from "three";
import { createScoreState, updateScoreProgress, finalizeRunScore } from "./src/score.mjs";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ec9ff);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, -4);
scene.add(directionalLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 600),
  new THREE.MeshStandardMaterial({ color: 0x2f6a2f })
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, 0, 220);
scene.add(ground);

const lanePositions = [-2, 0, 2];
let currentLaneIndex = 1;

const runnerBaseSize = {
  width: 1,
  height: 2,
  depth: 1,
};

const playerTexture = new THREE.TextureLoader().load("/assets/horizon-terminal.png");
playerTexture.colorSpace = THREE.SRGBColorSpace;

const runner = new THREE.Mesh(
  new THREE.PlaneGeometry(
    runnerBaseSize.width,
    runnerBaseSize.height
  ),
  new THREE.MeshBasicMaterial({
    map: playerTexture,
    transparent: true,
    side: THREE.DoubleSide,
  })
);
runner.position.set(lanePositions[currentLaneIndex], runnerBaseSize.height / 2, 0);
scene.add(runner);

const gameOverOverlay = document.getElementById("game-over");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");

const state = {
  isGameOver: false,
  forwardSpeed: 14,
  laneLerpSpeed: 14,
  gravity: -35,
  jumpVelocity: 13,
  verticalVelocity: 0,
  groundedY: runnerBaseSize.height / 2,
  duckScaleY: 0.45,
  duckDuration: 0.45,
  duckTimer: 0,
  isDucking: false,
  obstacles: [],
  score: createScoreState({ pointsPerMeter: 1 }),
  spawnTimer: 0,
  nextSpawnIn: randRange(0.8, 1.6),
  spawnDistanceMin: 60,
  spawnDistanceMax: 100,
  cleanupDistance: 25,
};

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function onKeyDown(event) {
  if (state.isGameOver) {
    return;
  }

  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    currentLaneIndex = clamp(currentLaneIndex + 1, 0, lanePositions.length - 1);
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    currentLaneIndex = clamp(currentLaneIndex - 1, 0, lanePositions.length - 1);
  }

  if (event.code === "Space") {
    if (isGrounded() && !state.isDucking) {
      state.verticalVelocity = state.jumpVelocity;
    }
  }

  if (event.code === "KeyS" || event.code === "ArrowDown") {
    if (isGrounded() && !state.isDucking) {
      startDuck();
    }
  }
}

function isGrounded() {
  return runner.position.y <= state.groundedY + 0.001;
}

function startDuck() {
  state.isDucking = true;
  state.duckTimer = state.duckDuration;
  runner.scale.y = state.duckScaleY;
  const duckedHeight = runnerBaseSize.height * runner.scale.y;
  runner.position.y = duckedHeight / 2;
}

function endDuck() {
  state.isDucking = false;
  state.duckTimer = 0;
  runner.scale.y = 1;
  runner.position.y = state.groundedY;
}

function spawnObstacle() {
  const laneIndex = Math.floor(Math.random() * lanePositions.length);
  const width = 1.2;
  const height = randRange(1.2, 2.4);
  const depth = 1.2;
  const z = runner.position.z + randRange(state.spawnDistanceMin, state.spawnDistanceMax);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: 0xd64545 })
  );
  mesh.position.set(lanePositions[laneIndex], height / 2, z);
  scene.add(mesh);

  state.obstacles.push({
    mesh,
    laneIndex,
    width,
    height,
    depth,
    z,
  });
}

function updateObstacles(deltaTime) {
  state.spawnTimer += deltaTime;
  if (state.spawnTimer >= state.nextSpawnIn) {
    state.spawnTimer = 0;
    state.nextSpawnIn = randRange(0.8, 1.6);
    spawnObstacle();
  }

  for (let i = state.obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = state.obstacles[i];
    obstacle.z = obstacle.mesh.position.z;

    if (obstacle.z < runner.position.z - state.cleanupDistance) {
      scene.remove(obstacle.mesh);
      obstacle.mesh.geometry.dispose();
      obstacle.mesh.material.dispose();
      state.obstacles.splice(i, 1);
    }
  }
}

function getRunnerBounds() {
  const width = runnerBaseSize.width * runner.scale.x;
  const height = runnerBaseSize.height * runner.scale.y;
  const depth = runnerBaseSize.depth * runner.scale.z;

  return {
    minX: runner.position.x - width / 2,
    maxX: runner.position.x + width / 2,
    minY: runner.position.y - height / 2,
    maxY: runner.position.y + height / 2,
    minZ: runner.position.z - depth / 2,
    maxZ: runner.position.z + depth / 2,
  };
}

function getObstacleBounds(obstacle) {
  return {
    minX: obstacle.mesh.position.x - obstacle.width / 2,
    maxX: obstacle.mesh.position.x + obstacle.width / 2,
    minY: obstacle.mesh.position.y - obstacle.height / 2,
    maxY: obstacle.mesh.position.y + obstacle.height / 2,
    minZ: obstacle.mesh.position.z - obstacle.depth / 2,
    maxZ: obstacle.mesh.position.z + obstacle.depth / 2,
  };
}

function boundsIntersect(a, b) {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY &&
    a.minZ <= b.maxZ &&
    a.maxZ >= b.minZ
  );
}

function checkCollisions() {
  const runnerBounds = getRunnerBounds();
  for (const obstacle of state.obstacles) {
    const obstacleBounds = getObstacleBounds(obstacle);
    if (boundsIntersect(runnerBounds, obstacleBounds)) {
      triggerGameOver();
      return;
    }
  }
}

function triggerGameOver() {
  if (state.isGameOver) {
    return;
  }

  state.isGameOver = true;
  const finalScore = finalizeRunScore(state.score);
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `Final score: ${finalScore}`;
  }
  console.log("Game Over");
  gameOverOverlay.style.display = "flex";
}

function updateScoreUI() {
  if (scoreDisplay) {
    scoreDisplay.textContent = state.score.value;
  }
}

function updateRunner(deltaTime) {
  runner.position.z += state.forwardSpeed * deltaTime;

  const targetX = lanePositions[currentLaneIndex];
  runner.position.x = THREE.MathUtils.lerp(
    runner.position.x,
    targetX,
    clamp(state.laneLerpSpeed * deltaTime, 0, 1)
  );

  if (state.duckTimer > 0) {
    state.duckTimer -= deltaTime;
    if (state.duckTimer <= 0) {
      endDuck();
    }
  }

  state.verticalVelocity += state.gravity * deltaTime;
  runner.position.y += state.verticalVelocity * deltaTime;

  const currentHeight = runnerBaseSize.height * runner.scale.y;
  const groundYForCurrentSize = currentHeight / 2;
  if (runner.position.y < groundYForCurrentSize) {
    runner.position.y = groundYForCurrentSize;
    state.verticalVelocity = 0;
  }
}

function updateCamera(deltaTime) {
  const cameraOffset = new THREE.Vector3(0, 5, -10);
  const desiredPos = new THREE.Vector3().copy(runner.position).add(cameraOffset);
  camera.position.lerp(desiredPos, clamp(8 * deltaTime, 0, 1));
  camera.lookAt(runner.position.x, runner.position.y + 1.2, runner.position.z + 15);
}

window.addEventListener("keydown", onKeyDown);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta();

  if (!state.isGameOver) {
    updateScoreProgress(state.score, deltaTime, state.forwardSpeed);
    updateRunner(deltaTime);
    updateObstacles(deltaTime);
    checkCollisions();
    updateScoreUI();
  }

  updateCamera(deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
