<script setup lang="ts">
import type { DayBar } from "~/types";

withDefaults(defineProps<{ bars: DayBar[] }>(), { bars: () => [] });

function klass(uptime: number | null): string {
  if (uptime === null || uptime === undefined) return "nodata";
  if (uptime >= 99) return "up";
  if (uptime >= 90) return "degraded";
  return "down";
}

function label(b: DayBar): string {
  return `${b.date}: ${b.uptime === null ? t.uptime.noData : b.uptime + "%"}`;
}
</script>

<template>
  <div class="bars" role="img" :aria-label="t.uptime.ariaLabel">
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
  background: #f2f5ff;
  border: 1px solid var(--rule-soft);
}
.bar {
  flex: 1;
  min-width: 3px;
  background: #d3d8e6;
}
.bar.up {
  background: #18a83e;
}
.bar.degraded {
  background: #e0a000;
}
.bar.down {
  background: #d61f30;
}
</style>
