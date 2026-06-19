<script setup>
defineProps({
  bars: { type: Array, default: () => [] },
});

function klass(uptime) {
  if (uptime === null || uptime === undefined) return "nodata";
  if (uptime >= 99) return "up";
  if (uptime >= 90) return "degraded";
  return "down";
}

function label(b) {
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
  height: 30px;
  align-items: stretch;
}
.bar {
  flex: 1;
  border-radius: 2px;
  min-width: 3px;
  background: var(--nodata);
}
.bar.up {
  background: var(--up);
}
.bar.degraded {
  background: var(--degraded);
}
.bar.down {
  background: var(--down);
}
</style>
