import * as THREE from 'three/webgpu'
import { abs, If, Fn, vec2, color, texture, convertColorSpace, positionLocal, rotateUV, time } from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10
)
camera.position.z = 1

const renderer = new THREE.WebGPURenderer(); // webGLRenderer가 아닌 WebGPURenderer사용함

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setAnimationLoop(animate); // 애니메이션 루프가 효율적으로 변함

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const main = Fn(() => {
    const p = positionLocal;
    
    return p
});

const material = new THREE.NodeMaterial(); // 퐁, 베이직과 같은 재질이 아님 
material.fragmentNode = color('crimson');

material.fragmentNode = main();


const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material)
scene.add(mesh);

renderer.debug.getShaderAsync(scene, camera, mesh).then((e) => {
    console.log(e.vertexShader)
    // console.log(e.fragmentShader)
  })

function animate() {
  controls.update()

  renderer.render(scene, camera)
}