import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

let model1

/**
 * Base
 */

const placeButton = document.getElementById("tap-to-place") || document.createElement("div")

// Debug
const gui = new dat.GUI()
gui.close()

let manager = new ZapparThree.LoadingManager()
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
scene.background = camera.backgroundTexture

// Request camera permissions and start the camera
ZapparThree.permissionRequestUI().then(granted => {
    if (granted) camera.start()
    else ZapparThree.permissionDeniedUI()
});

const instantTracker = new ZapparThree.InstantWorldTracker()
const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
  camera,
  instantTracker
)

const geometry = new THREE.BoxGeometry( 1.7, 0.17, 1.7 );
const material = new THREE.MeshBasicMaterial( {color: 0xff9100, wireframe: true} );
const cube = new THREE.Mesh( geometry, material );
instantTrackerGroup.add( cube );

gltfLoader.load(
    'models/island.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.0001, 0.0001, 0.0001)
        model1 = gltf.scene
        const modelPosition = gui.addFolder('Model Position')
        modelPosition.add(model1.position, 'x', -5, 5).step(0.001).listen()
        modelPosition.add(model1.position, 'y', -5, 5).step(0.001).listen()
        modelPosition.add(model1.position, 'z', -5, 5).step(0.001).listen()
        const modelScale = gui.addFolder('Model Scale')
        modelScale.add(model1.scale, 'x', -0.5, 0.5).step(0.001).listen()
        modelScale.add(model1.scale, 'y', -0.5, 0.5).step(0.001).listen()
        modelScale.add(model1.scale, 'z', -0.5, 0.5).step(0.001).listen()
        gui.add(model1, 'wireframe')
        gui.add(obj, 'toggleWireframe')
        instantTrackerGroup.add(model1)
    }
)

let isWireframe = false

const obj = {
    toggleWireframe: function() {
        if (!isWireframe) {
            model1.traverse((node) => {
                if (!node.isMesh) return;
                node.material.wireframe = true;
            })
            isWireframe = true
        }
        else {
            model1.traverse((node) => {
                if (!node.isMesh) return;
                node.material.wireframe = false;
            });
            isWireframe = false
        }
    }
}
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 )
scene.add( directionalLight )

const light = new THREE.AmbientLight( 0xffffff, 0.8 )
scene.add( light )

scene.add(instantTrackerGroup)

placeButton.style.display = "block"

let hasPlaced = false
placeButton.addEventListener("click", () => {
    hasPlaced = true
    cube.visible = false
    gsap.to(model1.scale, {duration: 2, x: 0.08, y: 0.08, z: 0.08})
    gsap.to(model1.rotation, {duration: 2, y: 12.58})
    placeButton.remove()
})

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    if (!hasPlaced) {
        instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -4)
    }

    const elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)

    camera.updateFrame(renderer)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()