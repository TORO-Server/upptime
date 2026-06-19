<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  createServerRoom,
  type ServerRoom,
  type RoomSite,
} from "../three/serverRoom.ts";

const props = defineProps<{ sites: RoomSite[] }>();
const emit = defineEmits<{ select: [slug: string] }>();

const canvas = ref<HTMLCanvasElement | null>(null);
let room: ServerRoom | null = null;
let ro: ResizeObserver | null = null;

onMounted(() => {
  if (!canvas.value) return;
  room = createServerRoom(canvas.value, {
    onSelect: (slug) => emit("select", slug),
  });
  room.setSites(props.sites);
  ro = new ResizeObserver(() => room?.resize());
  ro.observe(canvas.value);
});

watch(
  () => props.sites,
  (s) => room?.setSites(s),
  { deep: true }
);

onBeforeUnmount(() => {
  ro?.disconnect();
  room?.dispose();
  room = null;
});
</script>

<template>
  <div class="room">
    <canvas ref="canvas" class="room__canvas"></canvas>
    <div class="room__scan" aria-hidden="true"></div>
    <div class="room__hint">▣ DRAG=回転 · WHEEL=ズーム · CLICK=ジャンプ</div>
  </div>
</template>

<style scoped>
.room {
  position: relative;
  width: 100%;
  height: clamp(300px, 46vh, 480px);
  background: radial-gradient(ellipse at center, #0a0d1c 0%, #02030a 80%);
  overflow: hidden;
}
.room__canvas {
  width: 100%;
  height: 100%;
  display: block;
}
/* CRT scanlines over the WebGL canvas. */
.room__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0px,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.18) 3px,
    rgba(0, 0, 0, 0) 4px
  );
  mix-blend-mode: multiply;
}
.room__hint {
  position: absolute;
  left: 8px;
  bottom: 6px;
  font-family: "Courier New", monospace;
  font-size: 0.7rem;
  color: #41ffc8;
  text-shadow: 0 0 6px #0ff;
  pointer-events: none;
  letter-spacing: 0.02em;
}
</style>
