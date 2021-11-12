import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */

const placeButton = document.getElementById("tap-to-place") || document.createElement("div")

// Debug
const gui = new dat.GUI()
let manager = new ZapparThree.LoadingManager();
const gltfLoader = new GLTFLoader(manager)

// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
});
ZapparThree.glContextSet(renderer.getContext())

// Scene
const scene = new THREE.Scene()

// Camera
let camera = new ZapparThree.Camera({
    zNear: 0.1,
    zFar: 500,
});
scene.background = camera.backgroundTexture;

// Request camera permissions and start the camera
ZapparThree.permissionRequestUI().then(granted => {
    if (granted) camera.start();
    else ZapparThree.permissionDeniedUI();
});

const instantTracker = new ZapparThree.InstantWorldTracker();
const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
  camera,
  instantTracker
)

gltfLoader.load(
    'models/astronaut.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.5,0.5,0.5)
        instantTrackerGroup.add(gltf.scene)
    }
)

scene.add(instantTrackerGroup)

placeButton.style.display = "block"

let hasPlaced = false;
placeButton.addEventListener("click", () => {
    hasPlaced = true
    placeButton.remove();
});

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    if (!hasPlaced) {
        instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -4);
    }

    const elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)

    camera.updateFrame(renderer);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()