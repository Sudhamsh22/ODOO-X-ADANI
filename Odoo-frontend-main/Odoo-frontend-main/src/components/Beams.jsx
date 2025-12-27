import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { degToRad } from 'three/src/math/MathUtils.js'

const hexToRgb = (hex) => {
  const c = hex.replace('#', '')
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  ]
}

const noise = `
float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
float noise2(vec2 st){
  vec2 i=floor(st),f=fract(st);
  float a=random(i),b=random(i+vec2(1.,0.)),c=random(i+vec2(0.,1.)),d=random(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}
`

function createGeometry(count, width, height) {
  const geo = new THREE.BufferGeometry()
  const segments = 100
  const verts = []
  const uvs = []
  const indices = []
  let idx = 0

  const total = count * width
  const offsetX = -total / 2

  for (let i = 0; i < count; i++) {
    const x = offsetX + i * width
    for (let j = 0; j <= segments; j++) {
      const y = height * (j / segments - 0.5)
      verts.push(x, y, 0, x + width, y, 0)
      uvs.push(0, j / segments, 1, j / segments)
      if (j < segments) {
        indices.push(idx, idx + 1, idx + 2, idx + 2, idx + 1, idx + 3)
        idx += 2
      }
    }
    idx += 2
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export default function Beams({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0
}) {
  const material = useMemo(() =>
    new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(...hexToRgb(lightColor)) },
        speed: { value: speed },
        noiseIntensity: { value: noiseIntensity },
        scale: { value: scale }
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float speed;
        uniform float scale;
        ${noise}
        void main(){
          vUv=uv;
          vec3 p=position;
          p.z+=noise2(vec2(p.y*scale,time*speed))*2.;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float noiseIntensity;
        varying vec2 vUv;
        ${noise}
        void main(){
          float n=noise2(vUv*10.);
          gl_FragColor=vec4(color-n*noiseIntensity,1.);
        }
      `
    }), [])

  const geometry = useMemo(
    () => createGeometry(beamNumber, beamWidth, beamHeight),
    [beamNumber, beamWidth, beamHeight]
  )

  useFrame((_, d) => {
    material.uniforms.time.value += d * 0.5
  })

  return (
    <Canvas className="w-full h-full">
      <group rotation={[0, 0, degToRad(rotation)]}>
        <mesh geometry={geometry} material={material} />
        <directionalLight position={[0, 3, 10]} color={lightColor} />
      </group>
      <ambientLight intensity={1} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
    </Canvas>
  )
}