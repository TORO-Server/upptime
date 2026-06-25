<script setup lang="ts">
// 稼働状況レポート。summary.json の状態から、その時点の稼働状況を
// 敬体で自動生成する（管理人ペルソナや脚色は用いない）。
import type { SiteSummary } from "~/types";

const props = defineProps<{ sites: SiteSummary[]; generatedAt: string | null }>();

const report = computed(() => {
  const sites = props.sites ?? [];
  const baseMs = props.generatedAt
    ? new Date(props.generatedAt).getTime()
    : Date.now();
  const total = sites.length;
  const down = sites.filter((s) => s.status === "down");
  const deg = sites.filter((s) => s.status === "degraded");
  const players = sites.reduce((a, s) => a + (s.players?.online ?? 0), 0);
  const withRt = sites.filter((s) => typeof s.responseTime === "number");
  const slowest = withRt
    .slice()
    .sort((a, b) => (b.responseTime as number) - (a.responseTime as number))[0];

  const lines: string[] = [];
  if (down.length) {
    lines.push(t.report.down(down.map((d) => d.name).join("、")));
  } else if (deg.length) {
    lines.push(t.report.degraded(deg.map((d) => d.name).join("、")));
  } else {
    lines.push(t.report.allUp(total));
  }
  if (slowest && typeof slowest.responseTime === "number" && slowest.responseTime > 500) {
    lines.push(t.report.slow(slowest.name, slowest.responseTime));
  }
  if (players > 0) {
    lines.push(t.report.players(players));
  }
  return { date: fmtDateJp(baseMs), lines };
});
</script>

<template>
  <div class="report">
    <div class="report__date">■ {{ report.date }} 現在の稼働状況</div>
    <ul class="report__lines">
      <li v-for="(l, i) in report.lines" :key="i">{{ l }}</li>
    </ul>
    <p class="report__note">{{ t.report.note }}</p>
  </div>
</template>

<style scoped>
.report {
  color: var(--ink);
  font-size: 0.9rem;
}
.report__date {
  font-weight: bold;
  color: var(--rule);
  margin-bottom: 6px;
}
.report__lines {
  margin: 0 0 6px;
  padding-left: 1.4em;
  line-height: 1.8;
}
.report__note {
  margin: 0;
  font-size: 0.78rem;
  color: var(--ink-soft);
}
</style>
