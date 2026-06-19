<script setup lang="ts">
// Classic 88x31 web buttons. Drawn with CSS rather than GIFs so nothing 404s.
interface Badge {
  top: string;
  bottom: string;
  fg: string;
  bg: string;
  href?: string;
}

const badges: Badge[] = [
  { top: "POWERED BY", bottom: "three.js", fg: "#ffffff", bg: "#111111", href: "https://threejs.org/" },
  { top: "MADE WITH", bottom: "Vue.js", fg: "#0b3", bg: "#0a0a14", href: "https://vuejs.org/" },
  { top: "100% TYPED", bottom: "TypeScript", fg: "#fff", bg: "#2d5fdf", href: "https://www.typescriptlang.org/" },
  { top: "VALID", bottom: "HTML 4.0", fg: "#ff0", bg: "#a00" },
  { top: "BEST VIEWED IN", bottom: "Netscape", fg: "#fff", bg: "#00006b" },
  { top: "BUILT ON", bottom: "GitHub Actions", fg: "#fff", bg: "#1f2328", href: "https://github.com/TORO-Server/upptime" },
  { top: "MADE WITH", bottom: "Notepad (嘘)", fg: "#000", bg: "#c0c0c0" },
  { top: "GET", bottom: "TORO SABA", fg: "#0ff", bg: "#101030" },
];
</script>

<template>
  <div class="badges">
    <component
      v-for="(b, i) in badges"
      :is="b.href ? 'a' : 'span'"
      :key="i"
      :href="b.href"
      :target="b.href ? '_blank' : undefined"
      :rel="b.href ? 'noopener' : undefined"
      class="badge"
      :style="{ color: b.fg, background: b.bg }"
    >
      <span class="badge__top">{{ b.top }}</span>
      <span class="badge__bottom">{{ b.bottom }}</span>
    </component>
  </div>
</template>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.badge {
  width: 88px;
  height: 31px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px outset #888;
  font-family: "Courier New", monospace;
  line-height: 1.05;
  text-decoration: none;
  overflow: hidden;
  image-rendering: pixelated;
}
.badge:hover {
  border-style: inset;
  filter: brightness(1.2);
}
.badge__top {
  font-size: 7px;
  letter-spacing: 0.04em;
  opacity: 0.85;
}
.badge__bottom {
  font-size: 11px;
  font-weight: bold;
}
</style>
