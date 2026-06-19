<script setup lang="ts">
import { ref, computed } from "vue";
import Sparkline from "./Sparkline.vue";
import UptimeBars from "./UptimeBars.vue";
import type { SiteSummary } from "../types.ts";

const props = defineProps<{ site: SiteSummary; flash?: boolean }>();

const STATUS_LABEL: Record<string, string> = {
  up: "ONLINE",
  degraded: "SLOW",
  down: "OFFLINE",
};

// Icons referenced in config may 404 — fall back to a monogram tile.
const iconFailed = ref(false);
const initials = computed(() =>
  props.site.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "##"
);

function fmtUptime(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${v}%`;
}
function fmtRt(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${v} ms`;
}
</script>

<template>
  <div :id="`site-${site.slug}`" class="card" :class="[site.status, { flash }]">
    <div class="card-head">
      <img
        v-if="site.icon && !iconFailed"
        class="icon"
        :src="site.icon"
        alt=""
        loading="lazy"
        @error="iconFailed = true"
      />
      <span v-else class="icon icon--mono">{{ initials }}</span>

      <div class="title">
        <div class="name">{{ site.name }}</div>
        <div class="target">{{ site.target }}</div>
      </div>
      <span class="pill" :class="site.status">
        <span class="dot" />
        {{ STATUS_LABEL[site.status] || site.status }}
      </span>
    </div>

    <div class="meta">
      <span v-if="site.type === 'minecraft' && site.players">
        👥 {{ site.players.online }}<span class="muted">/{{ site.players.max }}</span>
      </span>
      <span v-if="site.version" class="muted">{{ site.version }}</span>
      <span class="rt">{{ fmtRt(site.responseTime) }}</span>
    </div>

    <Sparkline :values="site.sparkline" />
    <UptimeBars :bars="site.bars" />

    <div class="stats">
      <div class="stat">
        <span class="stat-label">24H</span>
        <span class="stat-val">{{ fmtUptime(site.uptime["24h"]) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">7D</span>
        <span class="stat-val">{{ fmtUptime(site.uptime["7d"]) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">30D</span>
        <span class="stat-val">{{ fmtUptime(site.uptime["30d"]) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">AVG</span>
        <span class="stat-val">{{ fmtRt(site.avgResponseTime["30d"]) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #0a0c1c;
  border: 3px outset #3a4470;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-margin-top: 16px;
}
.card.down {
  border-color: #6b1a22;
}
.card.flash {
  animation: card-flash 1.2s ease-out 2;
}
@keyframes card-flash {
  0%,
  100% {
    box-shadow: 0 0 0 transparent;
  }
  50% {
    box-shadow: 0 0 18px 2px #00ffe1;
  }
}
.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: 1px solid #2a3360;
  object-fit: cover;
  image-rendering: pixelated;
}
.icon--mono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #11173a;
  color: #6cf;
  font-family: "Courier New", monospace;
  font-weight: bold;
  font-size: 0.8rem;
}
.title {
  min-width: 0;
  flex: 1;
}
.name {
  font-weight: bold;
  color: #eaf0ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.target {
  font-family: "Courier New", monospace;
  font-size: 0.74rem;
  color: #7c87b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 9px;
  font-family: "Courier New", monospace;
  font-size: 0.72rem;
  font-weight: bold;
  border: 1px solid currentColor;
  flex-shrink: 0;
}
.pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.pill.up {
  color: #2fff66;
}
.pill.degraded {
  color: #ffd400;
}
.pill.down {
  color: #ff3344;
}
.pill.down .dot {
  animation: blink 0.8s steps(2, start) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.82rem;
  color: #cbd5f5;
  flex-wrap: wrap;
}
.meta .muted {
  color: #7c87b8;
}
.meta .rt {
  margin-left: auto;
  font-family: "Courier New", monospace;
  font-weight: bold;
  color: #41ffc8;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  border-top: 1px solid #2a3360;
  padding-top: 10px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-label {
  font-family: "Courier New", monospace;
  font-size: 0.66rem;
  color: #7c87b8;
}
.stat-val {
  font-family: "Courier New", monospace;
  font-weight: bold;
  color: #eaf0ff;
}
</style>
