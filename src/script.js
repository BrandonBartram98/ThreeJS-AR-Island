import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import * as ZapparThree from "@zappar/zappar-threejs";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)

    camera.updateFrame(renderer);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()