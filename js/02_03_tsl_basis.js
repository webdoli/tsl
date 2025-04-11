import * as THREE from 'three/webgpu'
import { Fn, mul, abs, If, positionLocal, rotateUV, vec2, time } from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  53,
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

  const p = positionLocal.toVar();
  p.assign( rotateUV( p.xyz, mul( time, 0.1) , vec2() ) );

  If( abs(p.x).lessThan(.03), () => {
    p.z = 1.0;
  });

  If( abs(p.y).lessThan(.03), () => {
    p.z = 1.0;
  });
  
  // If( abs(p.x).greaterThan(1.9), () => {
  //   p.z = 1.0;
  // });

  // If( abs(p.y).greaterThan(0.9), () => {
  //   p.z = 1.0;
  // });

  return p;
});
const material = new THREE.NodeMaterial();
material.fragmentNode = main();

scene.background = main();
// const mesh = new THREE.Mesh(new THREE.SphereGeometry(), material)
// scene.add(mesh);

// renderer.debug.getShaderAsync(scene, camera, mesh).then((e) => {
//     // console.log(e.vertexShader)
//     // console.log(e.fragmentShader)
//   })

function animate() {
  controls.update()
  renderer.render(scene, camera)
}