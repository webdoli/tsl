import * as THREE from 'three/webgpu'
import { Fn, rotateUV, vec2, vec3, sub, atan, abs, mul, time, sin, cos, fract, positionLocal, length, step } from 'three/tsl'
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
    /* 색 강도 강하게 하기 */
    // p.assign( mul(p, 5));
    // p.assign( p.mul(5) );

    /* 움직이는 패턴모션 생성 */
    // p.mulAssign(5);
    // p.assign( fract(p).sub(.5) );
    // p.assign( length(p) ); // length > 흰/검 음영으로 변경
    // p.assign( sin( p.mul(10).add(time) )); // sin + add(time) 조합 : 0~1사이 모션
    // p.assign( abs(p) ); 
    // p.assign( step(0.5, p)); // step > 더 선명해짐

    /* 소용돌이 만들기 */
    p.assign( rotateUV( p.xy, time, vec2() ));
    p.assign( length(p.mul(5)).sub(atan(p.zy, p.zx)).mul(5) );
    // p.assign( sin(p) );
    p.sinAssign();
    p.mulAssign(5);
    p.assign( 
      vec3( 
        p.x.add(sin(time).mul(5)), 
        p.y.add(cos(time).mul(5)), 
        0 
      )
    );
    
    return p
});

const material = new THREE.NodeMaterial();
material.fragmentNode = main();
// material.fragmentNode = fract( positionLocal.zx.mul(4.99) ).step(.1); // fract() > 타일링 효과, .step을 적용 > 줄 두께 변화
// material.fragmentNode = step( 0.5, length( positionLocal ).mul(15).fract() );
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