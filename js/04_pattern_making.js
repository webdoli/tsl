import * as THREE from 'three/webgpu'
import { Fn, fract, positionLocal, length, step } from 'three/tsl'
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
controls.enableDamping = true;

const main = Fn(() => {
    const p = positionLocal.toVar();
    return p
});

const material = new THREE.NodeMaterial();
// material.fragmentNode = fract( positionLocal.zx.mul(4.99) ).step(.1); // fract() > 타일링 효과, .step을 적용 > 줄 두께 변화
material.fragmentNode = step( 0.5, length( positionLocal ).mul(15).fract() );
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material)
scene.add(mesh);

// renderer.debug.getShaderAsync(scene, camera, mesh).then((e) => {
//     console.log(e.vertexShader)
//     console.log(e.fragmentShader)
// })

function animate() {
  controls.update()
  renderer.render(scene, camera)
}