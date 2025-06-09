const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

// Lighting
const light = new THREE.PointLight(0xffffff, 2, 500);
light.position.set(0, 0, 0);
scene.add(light);

// Background stars
const starGeo = new THREE.BufferGeometry();
const starCount = 10000;
const positions = [];
for (let i = 0; i < starCount; i++) {
  positions.push((Math.random() - 0.5) * 2000);
  positions.push((Math.random() - 0.5) * 2000);
  positions.push((Math.random() - 0.5) * 2000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff });
scene.add(new THREE.Points(starGeo, starMat));

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffcc00 })
);
scene.add(sun);

// Planet data
const planetsData = [
  { name: "Mercury", color: 0xaaaaaa, distance: 15, size: 1.5 },
  { name: "Venus", color: 0xff9900, distance: 22, size: 2 },
  { name: "Earth", color: 0x3399ff, distance: 30, size: 2.5 },
  { name: "Mars", color: 0xff3300, distance: 38, size: 2 },
  { name: "Jupiter", color: 0xffcc99, distance: 48, size: 4 },
  { name: "Saturn", color: 0xffffcc, distance: 60, size: 3.5 },
  { name: "Uranus", color: 0x99ffff, distance: 72, size: 3 },
  { name: "Neptune", color: 0x6666ff, distance: 85, size: 3 }
];

const planets = [];
const speeds = {};
planetsData.forEach(data => {
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: data.color });
  const planet = new THREE.Mesh(geo, mat);
  planet.userData = { name: data.name, angle: 0 };
  scene.add(planet);
  planets.push({ mesh: planet, distance: data.distance });
  speeds[data.name] = 0.01;

  // Speed Control
  const control = document.createElement("label");
  control.innerHTML = `${data.name}: <input type="range" min="0" max="0.1" step="0.001" value="0.01" data-name="${data.name}">`;
  document.getElementById('controls').appendChild(control);
});

// Event Listeners
let paused = false;
document.getElementById("toggleAnimation").onclick = () => {
  paused = !paused;
  document.getElementById("toggleAnimation").innerText = paused ? "Resume" : "Pause";
};

document.getElementById("controls").addEventListener("input", e => {
  if (e.target.tagName === "INPUT") {
    speeds[e.target.dataset.name] = parseFloat(e.target.value);
  }
});

// Dark/Light Mode
let isDark = true;
document.body.classList.add("dark-mode");

document.getElementById("toggleMode").addEventListener("click", () => {
  isDark = !isDark;
  document.body.classList.toggle("dark-mode", isDark);
  document.body.classList.toggle("light-mode", !isDark);
});

// Tooltip for planet names
const tooltip = document.getElementById("tooltip");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  if (!paused) {
    planets.forEach((p, i) => {
      p.mesh.userData.angle += speeds[planetsData[i].name];
      p.mesh.position.set(
        Math.cos(p.mesh.userData.angle) * p.distance,
        0,
        Math.sin(p.mesh.userData.angle) * p.distance
      );
    });
  }

  // Tooltip logic
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (intersects.length) {
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 20}px`;
    tooltip.innerText = intersects[0].object.userData.name;
  } else {
    tooltip.style.display = 'none';
  }

  renderer.render(scene, camera);
}
animate();