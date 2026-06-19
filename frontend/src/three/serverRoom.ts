// TORO_DATACENTER.EXE — a data-driven 3D server room rendered with three.js.
//
// Each monitored service becomes a 1U blade in the central rack. Its status LED
// glows green (up), amber (degraded) or strobes red (down). Activity LEDs
// flicker like real network gear. An UnrealBloom pass makes the LEDs bleed
// light for that "cyberspace datacenter" look. The camera slowly orbits and is
// drag-interactive; clicking a blade selects that service.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import type { Status } from "../types.ts";

export interface RoomSite {
  slug: string;
  name: string;
  status: Status;
}

export interface ServerRoom {
  setSites(sites: RoomSite[]): void;
  resize(): void;
  dispose(): void;
}

const STATUS_COLOR: Record<Status, number> = {
  up: 0x35ff7b,
  degraded: 0xffb020,
  down: 0xff2b3a,
};

const STEP = 0.7; // vertical pitch between blades
const BLADE_W = 4.4;
const BLADE_H = 0.6;
const BLADE_D = 2.6;

interface Blade {
  slug: string;
  status: Status;
  led: THREE.MeshStandardMaterial;
  activity: THREE.MeshStandardMaterial[];
  panel: THREE.Mesh; // raycast target
  phase: number;
}

// ---------------------------------------------------------------------------
// Procedural front-panel texture: dark brushed metal, vents, screws, label.
// ---------------------------------------------------------------------------

function panelTexture(name: string, status: Status): THREE.CanvasTexture {
  const w = 512;
  const h = 72;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  // Brushed-metal gradient body.
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#2a313f");
  g.addColorStop(0.5, "#1a1f2a");
  g.addColorStop(1, "#10141c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Faint horizontal brushed lines.
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let y = 2; y < h; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Corner screws.
  for (const [sx, sy] of [
    [14, 14],
    [14, h - 14],
    [w - 14, 14],
    [w - 14, h - 14],
  ] as const) {
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#0c0f15";
    ctx.fill();
    ctx.strokeStyle = "#444c5c";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx - 3, sy);
    ctx.lineTo(sx + 3, sy);
    ctx.strokeStyle = "#5a6577";
    ctx.stroke();
  }

  // Ventilation grille on the right third.
  ctx.fillStyle = "#05070b";
  for (let vy = 16; vy < h - 12; vy += 7) {
    ctx.fillRect(w - 150, vy, 120, 3);
  }

  // Status accent bar (left edge).
  const col = "#" + STATUS_COLOR[status].toString(16).padStart(6, "0");
  ctx.fillStyle = col;
  ctx.fillRect(0, 0, 5, h);

  // Service label.
  ctx.fillStyle = "#d6ffe6";
  ctx.font = "bold 26px 'Courier New', monospace";
  ctx.textBaseline = "middle";
  ctx.shadowColor = col;
  ctx.shadowBlur = 8;
  ctx.fillText(name.slice(0, 26).toUpperCase(), 30, h / 2);
  ctx.shadowBlur = 0;

  // "1U" tag.
  ctx.fillStyle = "#5b6678";
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText("1U", w - 168, h / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------------------
// Scene construction
// ---------------------------------------------------------------------------

export function createServerRoom(
  canvas: HTMLCanvasElement,
  opts: { onSelect?: (slug: string) => void } = {}
): ServerRoom {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060e);
  scene.fog = new THREE.FogExp2(0x05060e, 0.03);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
  camera.position.set(7.5, 2.5, 11);

  // Lighting — moody with cyan/magenta rim, LEDs do the rest via bloom.
  scene.add(new THREE.AmbientLight(0x2a3550, 0.7));
  const cyan = new THREE.PointLight(0x33e6ff, 60, 60);
  cyan.position.set(-9, 5, 7);
  scene.add(cyan);
  const magenta = new THREE.PointLight(0xff3ad0, 45, 60);
  magenta.position.set(9, 1, 9);
  scene.add(magenta);
  const fill = new THREE.DirectionalLight(0x8899bb, 0.5);
  fill.position.set(0, 8, 6);
  scene.add(fill);

  // Tron grid floor.
  const grid = new THREE.GridHelper(60, 60, 0x00ffe1, 0x2c0a52);
  const gm = grid.material as THREE.Material | THREE.Material[];
  (Array.isArray(gm) ? gm : [gm]).forEach((m) => {
    m.transparent = true;
    m.opacity = 0.35;
  });
  scene.add(grid);

  const blades: Blade[] = [];
  const rackGroup = new THREE.Group();
  scene.add(rackGroup);

  const rackMetal = new THREE.MeshStandardMaterial({
    color: 0x0d1118,
    metalness: 0.85,
    roughness: 0.45,
  });

  function buildDecorRack(x: number, units: number): THREE.Group {
    const grp = new THREE.Group();
    const height = units * STEP;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(BLADE_W + 0.5, height + 0.5, BLADE_D + 0.3),
      rackMetal
    );
    grp.add(frame);
    for (let i = 0; i < units; i++) {
      const y = height / 2 - i * STEP - STEP / 2;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x000000,
          emissive: new THREE.Color(Math.random() > 0.2 ? 0x35ff7b : 0xffb020),
          emissiveIntensity: 0.6 + Math.random(),
        })
      );
      dot.position.set(-BLADE_W / 2 + 0.3, y, BLADE_D / 2 + 0.05);
      grp.add(dot);
    }
    grp.position.set(x, 0, -1.5);
    grp.rotation.y = x > 0 ? -0.5 : 0.5;
    grp.scale.setScalar(0.82);
    return grp;
  }
  scene.add(buildDecorRack(-7.5, 11));
  scene.add(buildDecorRack(7.5, 11));

  // ---- main rack, rebuilt when the slug set changes ----
  let rackFrame: THREE.Mesh | null = null;

  function clearRack(): void {
    for (const b of blades) {
      b.panel.geometry.dispose();
      (b.panel.material as THREE.Material).dispose();
    }
    blades.length = 0;
    rackGroup.clear();
    if (rackFrame) {
      rackFrame.geometry.dispose();
    }
  }

  function buildRack(sites: RoomSite[]): void {
    clearRack();
    const n = Math.max(sites.length, 1);
    const height = n * STEP;

    rackFrame = new THREE.Mesh(
      new THREE.BoxGeometry(BLADE_W + 0.6, height + 0.7, BLADE_D + 0.4),
      rackMetal
    );
    rackFrame.position.z = -0.25;
    rackGroup.add(rackFrame);

    sites.forEach((site, i) => {
      const y = height / 2 - i * STEP - STEP / 2;
      const blade = new THREE.Group();

      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(BLADE_W, BLADE_H, BLADE_D),
        new THREE.MeshStandardMaterial({
          map: panelTexture(site.name, site.status),
          metalness: 0.55,
          roughness: 0.6,
        })
      );
      panel.userData["slug"] = site.slug;
      blade.add(panel);

      // Status LED.
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: new THREE.Color(STATUS_COLOR[site.status]),
        emissiveIntensity: 1.2,
      });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), ledMat);
      led.position.set(BLADE_W / 2 - 0.35, 0, BLADE_D / 2 + 0.02);
      blade.add(led);

      // Activity LEDs.
      const activity: THREE.MeshStandardMaterial[] = [];
      for (let a = 0; a < 3; a++) {
        const aMat = new THREE.MeshStandardMaterial({
          color: 0x000000,
          emissive: new THREE.Color(a === 0 ? 0x35ff7b : 0xffd24a),
          emissiveIntensity: 0.2,
        });
        const aLed = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.04), aMat);
        aLed.position.set(BLADE_W / 2 - 0.7 - a * 0.18, 0, BLADE_D / 2 + 0.02);
        blade.add(aLed);
        activity.push(aMat);
      }

      blade.position.y = y;
      rackGroup.add(blade);

      blades.push({
        slug: site.slug,
        status: site.status,
        led: ledMat,
        activity,
        panel,
        phase: Math.random() * Math.PI * 2,
      });
    });
  }

  function setSites(sites: RoomSite[]): void {
    const sameSet =
      blades.length === sites.length &&
      sites.every((s, i) => blades[i]?.slug === s.slug);

    if (sameSet) {
      // Cheap update: recolour LEDs / repaint accent in place.
      sites.forEach((s, i) => {
        const b = blades[i]!;
        if (b.status !== s.status) {
          b.status = s.status;
          b.led.emissive.setHex(STATUS_COLOR[s.status]);
          const old = b.panel.material as THREE.MeshStandardMaterial;
          old.map?.dispose();
          old.map = panelTexture(s.name, s.status);
          old.needsUpdate = true;
        }
      });
    } else {
      buildRack(sites);
    }
  }

  // Controls.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 20;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.8;
  controls.target.set(0, 0, 0);

  // Post-processing (bloom). Falls back to direct render if unavailable.
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.9, 0.5, 0.12);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  } catch {
    composer = null;
  }

  // Raycasting for hover/click.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: Blade | null = null;
  let pointerInside = false;

  function updatePointer(e: PointerEvent): void {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointerInside = true;
  }
  function onLeave(): void {
    pointerInside = false;
    hovered = null;
    canvas.style.cursor = "grab";
  }
  function onClick(): void {
    if (hovered && opts.onSelect) opts.onSelect(hovered.slug);
  }
  canvas.addEventListener("pointermove", updatePointer);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("click", onClick);
  canvas.style.cursor = "grab";

  // ---- render loop ----
  const clock = new THREE.Clock();
  let raf = 0;

  function frame(): void {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      for (const b of blades) {
        if (b.status === "down") {
          b.led.emissiveIntensity = Math.sin(t * 9) > 0 ? 2.2 : 0.06; // strobe
        } else if (b.status === "degraded") {
          b.led.emissiveIntensity = 1.0 + Math.sin(t * 3 + b.phase) * 0.8;
        } else {
          b.led.emissiveIntensity = 1.1 + Math.sin(t * 1.6 + b.phase) * 0.35;
        }
        // Network activity flicker.
        for (const a of b.activity) {
          a.emissiveIntensity = Math.random() > 0.7 ? 1.4 : 0.12;
        }
      }
    }

    // Hover highlight.
    if (pointerInside) {
      raycaster.setFromCamera(pointer, camera);
      const targets = blades.map((b) => b.panel);
      const hit = raycaster.intersectObjects(targets, false)[0];
      const next = hit
        ? blades.find((b) => b.panel === hit.object) ?? null
        : null;
      if (next !== hovered) {
        if (hovered)
          (hovered.panel.material as THREE.MeshStandardMaterial).emissive.setHex(
            0x000000
          );
        hovered = next;
        if (hovered) {
          (hovered.panel.material as THREE.MeshStandardMaterial).emissive.setHex(
            0x1b3a5a
          );
        }
        canvas.style.cursor = hovered ? "pointer" : "grab";
      }
    }

    controls.update();
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function resize(): void {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    bloom?.setSize(w, h);
  }

  resize();
  frame();

  function dispose(): void {
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", updatePointer);
    canvas.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("click", onClick);
    controls.dispose();
    clearRack();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
    });
    composer?.dispose();
    renderer.dispose();
  }

  return { setSites, resize, dispose };
}
