import * as THREE from 'three/webgpu'
import { If, Fn, vec2, vec3, positionLocal, rotateUV, time, length,
    sub, mul, abs, step, smoothstep, max, mix, dot, cos, sin, clamp
} from 'three/tsl'
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

const Circle = Fn(([ position, radius, thickness ]) => {
    const distance = length( position ).sub( radius );
    // return abs(distance); //원근감 형성된 쉐이더로 만듦 
    // return step( thickness, abs(distance) ).oneMinus(); //원금감 삭제 > step
    return smoothstep( thickness, 0, abs(distance) ); // step처럼 딱 경계선을 생성하지 않고 안티에어라이징 형성
    // return smoothstep( 0, thickness, abs(distance) ); // invert 시킴
});

const Line = Fn(([position, direction, distance, thickness]) => {
    const projection = dot( position, direction );
    // const line = projection;
    // const line = position.sub( projection.mul(direction) ); // 여러 라인이 교차하며 색상 나타냄
    // const line = length( position.sub(projection.mul(direction))); // 대각선으로 갈라진 직선
    // const line = step( 
    //     thickness, 
    //     abs(length(position.sub(projection.mul(direction))))
    // ).oneMinus();

    // const line = smoothstep( 
    //     thickness,
    //     0.0,
    //     length(position.sub(projection.mul(direction)))
    // );

    const clampProjection = clamp( projection, 0.0, distance ); // 길이 제한 > 자르기에 사용
    const line = smoothstep(
        thickness,
        0.0,
        length( position.sub(clampProjection.mul(direction)) )
    );

    return line;
})

const main = Fn(() => {
    const p = positionLocal.toVar();
    p.mulAssign(2);
    const radius = .5;
    const thickness = .01;

    /* 이오리 등 문양 원 그리기 */
    // const circle = Circle( p, radius, thickness );
    // const circle2 = Circle( p.sub(vec2(0.1, 0.1)), radius, thickness );

    /* 돌아가는 원 */
    const circleOffset = vec2( -.66, .66 );
    const circle = Circle( p.sub(circleOffset), radius, thickness );

    // const angle = Math.PI / 4;
    const angle = time;
    const direction = vec2( cos(angle), sin(angle) );
    const radiusLine = Line( p.sub(circleOffset), direction, radius, thickness );
    const finalColor = mix( circle, vec3(1, 0, 0), radiusLine );

    // return max( circle, radiusLine ); // max > 결과를 추가로 표시해주는 기능
    
    return finalColor

    // return max( circle, circle2 ) // max > 가장 높은 수치부터 여러개 circle들어감

});

const material = new THREE.NodeMaterial(); // 퐁, 베이직과 같은 재질이 아님 
material.fragmentNode = main();


const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
scene.add(mesh);

renderer.debug.getShaderAsync(scene, camera, mesh).then((e) => {
    // console.log(e.vertexShader)
    // console.log(e.fragmentShader)
})

function animate() {
    controls.update()
    renderer.render(scene, camera)
}