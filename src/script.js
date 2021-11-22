import './style.css'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as dat from 'lil-gui'
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

let model1, boat

/**
 * Base
 */

const placeButton = document.getElementById("tap-to-place") || document.createElement("div")

// Debug
const gui = new dat.GUI()
gui.close()
const stats = new Stats();
document.body.appendChild( stats.dom );

let manager = new ZapparThree.LoadingManager()
const gltfLoader = new GLTFLoader(manager)

const raycaster = new THREE.Raycaster()


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

/**
 * Mouse
 */
 const mouse = new THREE.Vector2()
 window.addEventListener('mousemove', (event) =>
 {
     mouse.x = event.clientX / window.innerWidth * 2 - 1
     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
 })

let hotspot1Active = false
let hotspot2Active = false

window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        switch(currentIntersect.object)
        {
            case hotspot1:
                console.log('click on hotspot 1')
                if(!hotspot1Active) {
                    hotspot1.material.color.set('#ff0000')
                    hotspot1Active = true
                }
                else {
                    hotspot1.material.color.set('#ff78d9')
                    hotspot1Active = false
                }
                break

            case hotspot2:
                console.log('click on hotspot 2')
                if(!hotspot2Active) {
                    hotspot2.material.color.set('#ff0000')
                    hotspot2Active = true
                }
                else {
                    hotspot2.material.color.set('#ff78d9')
                    hotspot2Active = false
                }
                break
        }
    }
})

const instantTracker = new ZapparThree.InstantWorldTracker()
const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
  camera,
  instantTracker
)

const geometry = new THREE.BoxGeometry( 1.7, 0.17, 1.7 );
const material = new THREE.MeshBasicMaterial( {color: 0x0080ff, wireframe: true} );
const cube = new THREE.Mesh( geometry, material );
instantTrackerGroup.add( cube );

const geometry2 = new THREE.SphereGeometry( 10, 16, 8 );
const material2 = new THREE.MeshBasicMaterial( {color: 0xff78d9} );
const hotspot1 = new THREE.Mesh( geometry2, material2 );

instantTrackerGroup.add( hotspot1 );
hotspot1.scale.set(0, 0, 0)
hotspot1.position.set(-0.2, 0.3, 0)

const geometry3 = new THREE.SphereGeometry( 10, 16, 8 );
const material3 = new THREE.MeshBasicMaterial( {color: 0xff78d9} );
const hotspot2 = new THREE.Mesh( geometry3, material3 );

instantTrackerGroup.add( hotspot2 );
hotspot2.scale.set(0, 0, 0)
hotspot2.position.set(0.25, 0.25, 0)

gltfLoader.load(
    'models/island.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0, 0, 0)
        model1 = gltf.scene
        console.log(model1)
        boat = model1.children[14]
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

    gsap.to(hotspot1.scale, {duration: 0.5, delay: 2, x: 0.005, y: 0.005, z: 0.005})
    gsap.to(hotspot2.scale, {duration: 0.5, delay: 2.5, x: 0.005, y: 0.005, z: 0.005, onComplete: function(){
        model1.attach(hotspot1)
        model1.attach(hotspot2)
    }})

    const modelPosition = gui.addFolder('Model Position')
    modelPosition.add(model1.position, 'x', -5, 5).step(0.001).listen()
    modelPosition.add(model1.position, 'y', -5, 5).step(0.001).listen()
    modelPosition.add(model1.position, 'z', -5, 5).step(0.001).listen()
    const modelScale = gui.addFolder('Model Scale')
    modelScale.add(model1.scale, 'x', -0.2, 0.2).step(0.001).listen()
    modelScale.add(model1.scale, 'y', -0.2, 0.2).step(0.001).listen()
    modelScale.add(model1.scale, 'z', -0.2, 0.2).step(0.001).listen()
    gui.add(model1, 'wireframe')
    gui.add(obj, 'toggleWireframe')

    placeButton.remove()
})

// Animate
const clock = new THREE.Clock()
let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    if (!hasPlaced) {
        instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -4)
    }
    else {
        boat.position.x = Math.cos(elapsedTime * 0.2) * 8
        boat.position.z = Math.sin(elapsedTime * 0.2) * 8
        boat.rotation.y = -(elapsedTime * 0.2)
    }


    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = [hotspot1, hotspot2]
    const intersects = raycaster.intersectObjects(objectsToTest)

    if(intersects.length)
    {
        if(!currentIntersect)
        {
            console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            console.log('mouse leave')
        }

        currentIntersect = null
    }
    // Render
    renderer.render(scene, camera)

    camera.updateFrame(renderer)

    stats.update();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()