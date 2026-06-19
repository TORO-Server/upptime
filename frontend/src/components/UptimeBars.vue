<script setup lang="ts">
import type { DayBar } from "../types.ts";

withDefaults(defineProps<{ bars: DayBar[] }>(), { bars: () => [] });

function klass(uptime: number | null): string {
  if (uptime === null || uptime === undefined) return "nodata";
  if (uptime >= 99) return "up";
  if (uptime >= 90) return "degraded";
  return "down";
}

function label(b: DayBar): string {
  return `${b.date}: ${b.uptime === null ? "データなし" : b.uptime + "%"}`;
}
</script>

<template>
  <div class="bars" role="img" aria-label="30日間の稼働履歴">
    <span
      v-for="(b, i) in bars"
      :key="i"
      class="bar"
      :class="klass(b.uptime)"
      :title="label(b)"
    />
  </div>
</template>

<style scoped>
.bars {
  display: flex;
  gap: 2px;
  height: 28px;
  align-items: stretch;
  padding: 3px;
  background: #050810;
  border: 1px solid #173a33;
}
.bar {
  flex: 1;
  min-width: 3px;
  background: #2a2f3a;
}
.bar.up {
  background: #2fff66;
  box-shadow: 0 0 4px #2fff66;
}
.bar.degraded {
  background: #ffd400;
  box-shadow: 0 0 4px #ffd400;
}
.bar.down {
  background: #ff3344;
  box-shadow: 0 0 4px #ff3344;
}
</style>
