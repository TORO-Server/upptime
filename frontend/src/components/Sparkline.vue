<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ values: (number | null)[] }>(),
  { values: () => [] }
);

const W = 240;
const H = 44;
const P = 3;

const segments = computed<string[] | null>(() => {
  const vals = props.values;
  const nums = vals.filter((v): v is number => typeof v === "number");
  if (nums.length < 2) return null;

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const n = vals.length;

  const segs: string[][] = [];
  let cur: string[] = [];
  vals.forEach((v, i) => {
    if (typeof v !== "number") {
      if (cur.length) {
        segs.push(cur);
        cur = [];
      }
      return;
    }
    const x = P + (i / (n - 1)) * (W - 2 * P);
    const y = P + (1 - (v - min) / range) * (H - 2 * P);
    cur.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  });
  if (cur.length) segs.push(cur);
  return segs.map((s) => s.join(" "));
});
</script>

<template>
  <svg
    v-if="segments"
    class="spark"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <polyline
      v-for="(seg, i) in segments"
      :key="i"
      :points="seg"
      fill="none"
      vector-effect="non-scaling-stroke"
    />
  </svg>
  <div v-else class="spark-empty">▓▒░ データ収集中 ░▒▓</div>
</template>

<style scoped>
.spark {
  width: 100%;
  height: 44px;
  display: block;
  background: #f2f5ff;
  border: 1px solid var(--rule-soft);
}
.spark polyline {
  stroke: #0033cc;
  stroke-width: 1.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.spark-empty {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  background: #f2f5ff;
  border: 1px solid var(--rule-soft);
}
</style>
