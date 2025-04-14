import * as THREE from 'three/webgpu'
import { 
    If, Fn, vec2, vec3, positionLocal, rotateUV, time, length,
    sub, mul, abs, step, smoothstep, max, mix, dot, cos, sin, clamp,
    negate, mod
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
controls.enableDamping = true;

const Circle = Fn(([ position, radius, thickness ]) => {
    const distance = length( position ).sub( radius );
    return smoothstep( thickness, 0, abs(distance) );
});

const Line = Fn(([position, direction, distance, thickness]) => {
    const projection = dot( position, direction );
    const clampProjection = clamp( projection, 0.0, distance );
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

    /* 돌아가는 원 */
    const circleOffset = vec2( -.66, .66 );
    const circle = Circle( p.sub(circleOffset), radius, thickness );

    const angle = time;
    const frequency = Math.PI * 2;
    const direction = vec2( cos(angle), sin(angle) );
    const radiusLine = Line( p.sub(circleOffset), direction, radius, thickness );
    const radiusEndPosition = direction.mul( radius );
    const finalColor = mix( circle, vec3(1, 0, 0), radiusLine );
    

    /* 사인파 */
    // const sineWave = p.y.sub(sin(p.x)); // 태극문양
    // const sineWave = abs( p.y.sub(sin(p.x)).oneMinus() );
    // const sineWave = smoothstep( thickness, 0, abs(p.y.sub(sin(p.x)))); // 선 생성
    // const sineWave = smoothstep( 
    //     thickness, 
    //     0, 
    //     abs( p.y.sub( sin(p.x.mul(frequency)).mul(0.5) ))
    // ); // sin파형 줄이기(주파수 조절)

    // const sineWave = smoothstep( 
    //     thickness, 
    //     0, 
    //     abs( 
    //         p.y
    //         .sub(circleOffset.y)
    //         .sub( sin(p.x.mul(frequency)).mul(0.5) )
    //     )
    // ); // y축으로 위치 이동

    // const sineWave = smoothstep( 
    //     thickness, 
    //     0, 
    //     abs( 
    //         p.y
    //         .sub(circleOffset.y)
    //         .sub( sin(p.x.mul(frequency).sub(time)).mul(0.5) )
    //     )
    // ); // 애니메이팅 추가(time 추가)

    const sineWave = smoothstep( 
        thickness, 
        0, 
        abs( 
            p.y
            .sub(circleOffset.y)
            .sub( 
                sin( 
                    p.x
                    .mul(frequency)
                    .sub(time)
                    .sub(Math.PI)
                )
                .mul(0.5)
            )
        )
    ); // 시곗바늘에서 사인파가 나오도록 위치 조절

    sineWave.assign( step(0, p.x).mul(sineWave) );

    /* cosWave */
    const cosineWave = smoothstep( 
        thickness, 
        0, 
        abs(
            p.x
            .sub(circleOffset.x)
            .sub(
                cos(p.y.mul(frequency).add(time)).mul(0.5)
            )
        )
    );
    cosineWave.assign( step(p.y, 0).mul(cosineWave) );
    const sineReferenceLine = Line( 
        p.sub(circleOffset).sub(radiusEndPosition), 
        vec2(1, 0),
        negate(radiusEndPosition.x).sub(circleOffset.x), 
        thickness
    );
    const cosineReferenceLine = Line( 
        p.sub(circleOffset).sub(radiusEndPosition), 
        vec2(0, -1),
        radiusEndPosition.y.add(circleOffset.y), 
        thickness
    );

    const dottedSineReferenceLine = sineReferenceLine.mul( 
        step( .5, mod( p.x.mul(10), 1) )
    );

    const dottedCosineReferenceLine = cosineReferenceLine.mul( 
        step( .5, mod( p.y.mul(10), 1) )
    );
    
    finalColor.assign(mix( finalColor, vec3(0, 1, 0), sineWave ));
    finalColor.assign(mix( finalColor, vec3(0, 1, 0), cosineWave ));
    finalColor.assign(mix( finalColor, vec3(1, 1, 0), dottedSineReferenceLine ));
    finalColor.assign(mix( finalColor, vec3(1, 1, 0), dottedCosineReferenceLine ));
    
    return finalColor

});

const material = new THREE.NodeMaterial(); // 퐁, 베이직과 같은 재질이 아님 
material.fragmentNode = main();

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
scene.add(mesh);

function animate() {
    controls.update()
    renderer.render(scene, camera)
}