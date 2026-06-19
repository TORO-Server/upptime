<script setup>
import Sparkline from "./Sparkline.vue";
import UptimeBars from "./UptimeBars.vue";

const props = defineProps({
  site: { type: Object, required: true },
});

const STATUS_LABEL = {
  up: "正常",
  degraded: "低下",
  down: "停止",
};

function fmtUptime(v) {
  return v === null || v === undefined ? "—" : `${v}%`;
}
function fmtRt(v) {
  return v === null || v === undefined ? "—" : `${v} ms`;
}
</script>

<template>
  <div class="card">
    <div class="card-head">
      <img v-if="site.icon" class="icon" :src="site.icon" alt="" loading="lazy" />
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
        <span class="stat-label">24時間</span>
        <span class="stat-val">{{ fmtUptime(site.uptime["24h"]) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">7日</span>
        <span class="stat-val">{{ fmtUptime(site.uptime["7d"]) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">30日</span>
        <span class="stat-val">{{ fmtUptime(site.uptime["30d"]) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">平均応答</span>
        <span class="stat-val">{{ fmtRt(site.avgResponseTime["30d"]) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.title {
  min-width: 0;
  flex: 1;
}
.name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.target {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}
.pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.pill.up {
  color: var(--up);
  background: var(--up-bg);
}
.pill.degraded {
  color: var(--degraded);
  background: var(--degraded-bg);
}
.pill.down {
  color: var(--down);
  background: var(--down-bg);
}
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  flex-wrap: wrap;
}
.meta .muted {
  color: var(--text-muted);
}
.meta .rt {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  border-top: 1px solid var(--card-border);
  padding-top: 12px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}
.stat-val {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
