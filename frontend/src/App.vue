<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import SiteCard from "./components/SiteCard.vue";
import ServerRoom from "./components/ServerRoom.vue";
import Marquee from "./components/Marquee.vue";
import HitCounter from "./components/HitCounter.vue";
import RetroBadges from "./components/RetroBadges.vue";
import UnderConstruction from "./components/UnderConstruction.vue";
import type { Summary, Status } from "./types.ts";

const data = ref<Summary | null>(null);
const error = ref(false);
const loading = ref(true);
const selectedSlug = ref<string | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;
let flashTimer: ReturnType<typeof setTimeout> | null = null;

async function load(): Promise<void> {
  try {
    const url = `${import.meta.env.BASE_URL}data/summary.json?_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data.value = (await res.json()) as Summary;
    error.value = false;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void load();
  timer = setInterval(() => void load(), 60000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (flashTimer) clearTimeout(flashTimer);
});

const roomSites = computed(() =>
  (data.value?.sites ?? []).map((s) => ({
    slug: s.slug,
    name: s.name,
    status: s.status,
  }))
);

const counts = computed(() => {
  const sites = data.value?.sites ?? [];
  return {
    total: sites.length,
    up: sites.filter((s) => s.status === "up").length,
    degraded: sites.filter((s) => s.status === "degraded").length,
    down: sites.filter((s) => s.status === "down").length,
  };
});

const overall = computed<{ key: Status; text: string }>(() => {
  const sites = data.value?.sites ?? [];
  if (sites.length === 0) return { key: "up", text: "—" };
  const down = sites.filter((s) => s.status === "down").length;
  const degraded = sites.filter((s) => s.status === "degraded").length;
  if (down === sites.length) return { key: "down", text: "全システム停止中" };
  if (down > 0) return { key: "down", text: "一部のシステムで障害が発生しています" };
  if (degraded > 0)
    return { key: "degraded", text: "一部でパフォーマンスが低下しています" };
  return { key: "up", text: "すべてのシステムは正常に稼働中" };
});

const updatedAt = computed(() => {
  if (!data.value?.generatedAt) return "";
  const d = new Date(data.value.generatedAt);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});

function onSelect(slug: string): void {
  selectedSlug.value = slug;
  const el = document.getElementById(`site-${slug}`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => (selectedSlug.value = null), 2600);
}
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="rainbow glow">{{ data?.name || "TORO STATUS" }}</h1>
      <p class="tagline blink">★ ＴＯＲＯ サーバー 監視 ステーション ★</p>
      <p v-if="data?.intro?.message" class="intro">{{ data.intro.message }}</p>
    </header>

    <Marquee
      text="★彡 WELCOME TO TORO STATUS // この電子掲示板はTOROサーバーの稼働状況を24時間監視しています // SIGNED, SEALED, DELIVERED // 全てのノードをリアルタイム描画中 彡★"
    />

    <!-- three.js datacenter, framed like a 90s desktop window -->
    <section class="win">
      <div class="win__bar">
        <span class="win__title">▣ TORO_DATACENTER.EXE</span>
        <span class="win__btns"><i>_</i><i>▢</i><i>✕</i></span>
      </div>
      <div class="win__body">
        <ServerRoom :sites="roomSites" @select="onSelect" />
        <div class="sysline">
          SYSTEM:<b :class="overall.key">{{ overall.key.toUpperCase() }}</b>
          | NODES:<b>{{ counts.total }}</b>
          | UP:<b class="up">{{ counts.up }}</b>
          | WARN:<b class="degraded">{{ counts.degraded }}</b>
          | DOWN:<b class="down">{{ counts.down }}</b>
        </div>
      </div>
    </section>

    <div v-if="loading" class="state">▓▒░ NOW LOADING ░▒▓</div>
    <div v-else-if="error" class="state error">
      ⚠ ステータスデータの取得に失敗しました。しばらくしてから再度お試しください。
    </div>

    <template v-else>
      <div class="banner" :class="overall.key">
        <span class="banner-dot" />{{ overall.text }}
      </div>

      <main class="grid">
        <SiteCard
          v-for="s in data?.sites"
          :key="s.slug"
          :site="s"
          :flash="s.slug === selectedSlug"
        />
      </main>
    </template>

    <UnderConstruction />

    <footer class="footer">
      <HitCounter />
      <RetroBadges />
      <hr class="rule" />
      <p class="foot-line">
        <span v-if="updatedAt">最終更新: {{ updatedAt }}</span>
        <span class="sep">·</span>
        <span>TypeScript + Vue.js + three.js + GitHub Actions</span>
      </p>
      <p class="foot-line muted">
        Best viewed at 800x600 in Netscape Navigator 4.0 ·
        <a v-if="data?.github" :href="data.github" target="_blank" rel="noopener"
          >[ GitHub ]</a
        >
        · © 2026 TORO SERVER
      </p>
    </footer>
  </div>
</template>

<style scoped>
.page {
  max-width: 940px;
  margin: 0 auto;
  padding: 24px 14px 60px;
}
.header {
  text-align: center;
  margin-bottom: 14px;
}
.header h1 {
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.4rem);
  font-weight: 900;
  letter-spacing: 0.04em;
}
.tagline {
  margin: 6px 0 2px;
  font-family: "Courier New", monospace;
  color: #00ffe1;
  font-weight: bold;
}
.intro {
  margin: 4px 0 0;
  color: #aeb8e8;
  font-size: 0.9rem;
}

/* desktop-window chrome around the 3D canvas */
.win {
  border: 3px outset #c0c0c0;
  background: #c0c0c0;
  margin: 14px 0;
  box-shadow: 0 0 24px rgba(0, 255, 225, 0.18);
}
.win__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 5px;
  background: linear-gradient(90deg, #00006b, #1d6fe0);
  color: #fff;
  font-family: "Courier New", monospace;
  font-weight: bold;
  font-size: 0.82rem;
}
.win__btns {
  display: inline-flex;
  gap: 3px;
}
.win__btns i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 14px;
  background: #c0c0c0;
  color: #000;
  border: 1px outset #fff;
  font-style: normal;
  font-size: 0.66rem;
}
.win__body {
  border: 2px inset #fff;
  background: #02030a;
}
.sysline {
  font-family: "Courier New", monospace;
  font-size: 0.74rem;
  color: #9fe6ff;
  padding: 5px 8px;
  border-top: 1px solid #173a33;
  background: #050810;
  text-align: center;
}
.sysline b {
  margin: 0 2px 0 3px;
}
.sysline .up,
b.up {
  color: #2fff66;
}
.sysline .degraded,
b.degraded {
  color: #ffd400;
}
.sysline .down,
b.down {
  color: #ff3344;
}

.state {
  text-align: center;
  padding: 50px 20px;
  font-family: "Courier New", monospace;
  color: #41ffc8;
}
.state.error {
  color: #ff3344;
}

.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  font-weight: bold;
  margin: 14px 0;
  border: 3px ridge;
  font-family: "Courier New", monospace;
}
.banner-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
}
.banner.up {
  color: #2fff66;
  background: #07210f;
  border-color: #2fff66;
}
.banner.degraded {
  color: #ffd400;
  background: #2a2406;
  border-color: #ffd400;
}
.banner.down {
  color: #ff3344;
  background: #2a0a0e;
  border-color: #ff3344;
  animation: banner-alarm 1s steps(2, start) infinite;
}
@keyframes banner-alarm {
  50% {
    background: #4a0a12;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 14px;
}
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.footer {
  margin-top: 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.rule {
  width: 100%;
  border: 0;
  border-top: 2px groove #3a4470;
}
.foot-line {
  margin: 0;
  font-family: "Courier New", monospace;
  font-size: 0.78rem;
  color: #aeb8e8;
}
.foot-line.muted {
  color: #6b76a8;
}
.foot-line .sep {
  margin: 0 7px;
  opacity: 0.5;
}

/* shared retro text effects */
.rainbow {
  background: linear-gradient(
    90deg,
    #ff0040,
    #ff8c00,
    #ffe600,
    #00ff66,
    #00e1ff,
    #6a5cff,
    #ff00d4,
    #ff0040
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: rainbow-shift 6s linear infinite;
}
@keyframes rainbow-shift {
  to {
    background-position: 200% center;
  }
}
.glow {
  filter: drop-shadow(0 0 10px rgba(0, 225, 255, 0.45));
}
.blink {
  animation: text-blink 1.4s steps(2, start) infinite;
}
@keyframes text-blink {
  50% {
    opacity: 0.25;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rainbow,
  .blink,
  .banner.down {
    animation: none;
  }
}
</style>
