import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap, reducedMotion } from '../../lib/scroll'
import { sampleCloud } from './cloudShape'

// Keep colours exactly as written (e.g. #8c4fff). The custom shaders output raw values,
// so three's automatic sRGB <-> linear conversion would make the purple look darker.
THREE.ColorManagement.enabled = false

/* ---------------- shaders ---------------- */

const CLOUD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  attribute vec3 aStart;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

  void main() {
    // each particle flies in slightly later than the previous seed
    float p = clamp(uProgress * 1.5 - aSeed * 0.5, 0.0, 1.0);
    p = easeOutCubic(p);

    vec3 pos = mix(aStart, position, p);
    float t = uTime * 0.6 + aSeed * 40.0;
    pos += vec3(sin(t), cos(t * 1.3), sin(t * 0.7)) * 0.06 * p;

    vec4 world = modelMatrix * vec4(pos, 1.0);

    // push particles away from the cursor
    vec2 d = world.xy - uMouse;
    float push = smoothstep(1.7, 0.0, length(d)) * 0.55 * p;
    world.xy += normalize(d + vec2(0.0001)) * push;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixelRatio * (26.0 / -mv.z), 0.0, 48.0);

    vColor = aColor;
    vAlpha = (0.2 + 0.8 * p) * (0.78 + 0.22 * sin(t * 2.0));
  }
`

const SOFT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
  }
`

const NODE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixelRatio * (30.0 / -mv.z), 0.0, 48.0);
    vColor = uColor;
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.6 + aSeed * 30.0);
  }
`

/* ---------------- builders ---------------- */

const rand = (a, b) => a + Math.random() * (b - a)

function buildCloud(count) {
  const target = new Float32Array(count * 3)
  const start = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)
  const color = new Float32Array(count * 3)

  const violet = new THREE.Color('#8c4fff')
  const lavender = new THREE.Color('#dcc8ff')
  const smile = new THREE.Color('#ff9900')
  const tmp = new THREE.Color()

  const outlineCount = Math.floor(count * 0.42)
  for (let i = 0; i < count; i++) {
    const outline = i < outlineCount
    const [x, y] = sampleCloud(outline)
    target.set([x, y, rand(-0.45, 0.45) * (outline ? 0.6 : 1)], i * 3)

    // start: scattered on a big shell around the scene
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(rand(-1, 1))
    const r = rand(6, 11)
    start.set(
      [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph) - 2],
      i * 3,
    )

    seed[i] = Math.random()
    size[i] = outline ? rand(1.6, 3.2) : rand(1.0, 2.4)

    const roll = Math.random()
    if (roll < 0.05) tmp.copy(smile)
    else tmp.copy(violet).lerp(lavender, Math.random() * (outline ? 0.8 : 0.5))
    color.set([tmp.r, tmp.g, tmp.b], i * 3)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(target, 3))
  geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
  return geo
}

function buildNetwork(nodeCount) {
  const pts = []
  for (let i = 0; i < nodeCount; i++) {
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(rand(-1, 1))
    const r = rand(3.8, 6.8)
    pts.push(
      new THREE.Vector3(
        r * Math.sin(ph) * Math.cos(th) * 1.25,
        r * Math.sin(ph) * Math.sin(th) * 0.8,
        r * Math.cos(ph) * 0.7,
      ),
    )
  }

  // connect every node to its 2 nearest neighbours
  const edgeSet = new Set()
  const edges = []
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    near.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        edges.push([i, j])
      }
    })
  })

  const linePos = new Float32Array(edges.length * 6)
  edges.forEach(([a, b], k) => {
    linePos.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], k * 6)
  })
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))

  const nodePos = new Float32Array(nodeCount * 3)
  const nodeSize = new Float32Array(nodeCount)
  const nodeSeed = new Float32Array(nodeCount)
  pts.forEach((p, i) => {
    nodePos.set([p.x, p.y, p.z], i * 3)
    nodeSize[i] = rand(1.6, 3.4)
    nodeSeed[i] = Math.random()
  })
  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))
  nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(nodeSize, 1))
  nodeGeo.setAttribute('aSeed', new THREE.BufferAttribute(nodeSeed, 1))

  return { pts, edges, lineGeo, nodeGeo }
}

/* ---------------- component ---------------- */

export default function CloudScene({ ready }) {
  const holder = useRef(null)
  const api = useRef(null)
  const readyRef = useRef(ready)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    readyRef.current = ready
    if (ready && api.current) api.current.start()
  }, [ready])

  useEffect(() => {
    const el = holder.current
    if (!el) return
    const calm = reducedMotion()
    const small = window.innerWidth < 768

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
    } catch {
      setFailed(true)
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75)
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace // no extra conversion, see note at the top
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.setAttribute('aria-hidden', 'true')
    el.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 9
    const halfH = Math.tan(THREE.MathUtils.degToRad(25)) * camera.position.z

    // --- the particle cloud ---
    const cloudGeo = buildCloud(small ? 1100 : 2300)
    const cloudMat = new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: calm ? 1 : 0 },
        uPixelRatio: { value: dpr },
        uMouse: { value: new THREE.Vector2(999, 999) },
      },
    })
    const cloud = new THREE.Points(cloudGeo, cloudMat)
    cloud.frustumCulled = false
    scene.add(cloud)

    // --- the network of nodes + travelling pulses ---
    const net = new THREE.Group()
    const { pts, edges, lineGeo, nodeGeo } = buildNetwork(small ? 46 : 84)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x8c4fff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    net.add(new THREE.LineSegments(lineGeo, lineMat))

    const nodeMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: dpr },
        uColor: { value: new THREE.Color('#b58cff') },
      },
    })
    net.add(new THREE.Points(nodeGeo, nodeMat))

    const pulseCount = small ? 12 : 26
    const pulses = Array.from({ length: pulseCount }, () => ({
      e: Math.floor(Math.random() * edges.length),
      t: Math.random(),
      s: rand(0.18, 0.45),
      flip: Math.random() < 0.5,
    }))
    const pulsePos = new Float32Array(pulseCount * 3)
    const pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3))
    pulseGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(pulseCount).fill(4.2), 1))
    pulseGeo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(pulseCount).fill(0), 1))
    const pulseMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: SOFT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: nodeMat.uniforms.uTime, // shared clock
        uPixelRatio: { value: dpr },
        uColor: { value: new THREE.Color('#ffb84d') },
      },
    })
    const pulseObj = new THREE.Points(pulseGeo, pulseMat)
    pulseObj.frustumCulled = false
    net.add(pulseObj)
    scene.add(net)

    // --- layout (cloud sits on the right on wide screens, on top on phones) ---
    function layout(w, h) {
      const aspect = w / h
      const portrait = aspect < 1.05
      const s = portrait
        ? Math.max(0.5, Math.min(0.72, aspect * 1.35))
        : Math.max(0.58, Math.min(1, aspect / 1.9))
      cloud.scale.setScalar(s)
      net.scale.setScalar(s)
      if (portrait) {
        cloud.position.set(0, 1.9, 0)
        net.position.set(0, 1.9, -1.5)
      } else {
        cloud.position.set(3.0 * s, 0.2, 0)
        net.position.set(3.0 * s, 0.2, -1.5)
      }
    }

    function resize() {
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      layout(w, h)
      if (calm) renderer.render(scene, camera)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // --- pointer ---
    const mouseTarget = new THREE.Vector2(0, 0)
    const mouseNdc = new THREE.Vector2(0, 0)
    let pointerActive = false
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      mouseNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
      pointerActive = true
    }
    const onLeave = () => {
      pointerActive = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    // --- loop ---
    const clock = new THREE.Clock()
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const cur = new THREE.Vector2()

    function frame() {
      const t = clock.getElapsedTime()
      cloudMat.uniforms.uTime.value = t
      nodeMat.uniforms.uTime.value = t

      // smooth parallax
      cur.lerp(mouseNdc, 0.05)
      net.rotation.y = t * 0.05 + cur.x * 0.35
      net.rotation.x = -cur.y * 0.2
      cloud.rotation.y = cur.x * 0.18
      cloud.rotation.x = -cur.y * 0.1

      // cursor position in world space (z = 0 plane)
      const aspect = camera.aspect
      const um = cloudMat.uniforms.uMouse.value
      if (!pointerActive) {
        um.set(999, 999) // cursor left the page: no push at all
      } else {
        mouseTarget.set(mouseNdc.x * halfH * aspect, mouseNdc.y * halfH)
        if (um.x > 900) um.copy(mouseTarget)
        else um.lerp(mouseTarget, 0.2)
      }

      // pulses travelling along edges
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i]
        p.t += (p.s * 0.016) / 0.5
        if (p.t >= 1) {
          p.t = 0
          p.e = Math.floor(Math.random() * edges.length)
          p.flip = Math.random() < 0.5
        }
        const [ia, ib] = edges[p.e]
        a.copy(pts[p.flip ? ib : ia])
        b.copy(pts[p.flip ? ia : ib])
        a.lerp(b, p.t)
        pulsePos[i * 3] = a.x
        pulsePos[i * 3 + 1] = a.y
        pulsePos[i * 3 + 2] = a.z
      }
      pulseGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    let running = false
    const run = () => {
      if (calm || running) return
      running = true
      renderer.setAnimationLoop(frame)
    }
    const stop = () => {
      if (!running) return
      running = false
      renderer.setAnimationLoop(null)
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : stop()), {
      threshold: 0,
    })
    io.observe(el)

    let tween = null
    api.current = {
      start() {
        if (calm) return
        tween?.kill()
        tween = gsap.to(cloudMat.uniforms.uProgress, {
          value: 1,
          duration: 3.6,
          ease: 'power2.out',
        })
      },
    }
    if (readyRef.current) api.current.start()

    return () => {
      tween?.kill()
      api.current = null
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cloudGeo.dispose()
      cloudMat.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      nodeGeo.dispose()
      nodeMat.dispose()
      pulseGeo.dispose()
      pulseMat.dispose()
      renderer.dispose()
      if (canvas.parentNode === el) el.removeChild(canvas)
    }
  }, [])

  if (failed) {
    // No WebGL available: show a soft glowing cloud-ish blob instead
    return (
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute right-[8%] top-[22%] h-72 w-72 rounded-full bg-aws/30 blur-[90px] md:h-[28rem] md:w-[28rem]" />
        <div className="absolute right-[18%] top-[34%] h-48 w-48 rounded-full bg-smile/15 blur-[80px]" />
      </div>
    )
  }

  return <div ref={holder} className="absolute inset-0" />
}
