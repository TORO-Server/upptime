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
    lines.push(
      down.map((d) => d.name).join("、") +
        " で障害が発生しています。復旧に向けて対応を進めています。"
    );
  } else if (deg.length) {
    lines.push(
      deg.map((d) => d.name).join("、") +
        " で応答の遅延を確認しています。状況を注視しています。"
    );
  } else {
    lines.push(
      "監視対象 " + total + " 件のサービスは、すべて正常に稼働しています。"
    );
  }
  if (
    slowest &&
    typeof slowest.responseTime === "number" &&
    slowest.responseTime > 500
  ) {
    lines.push(
      slowest.name +
        " の応答時間が " +
        slowest.responseTime +
        "ms とやや高めの水準です。"
    );
  }
  if (players > 0) {
    lines.push("現在、Minecraft サーバーには " + players + " 名が接続しています。");
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
    <p class="report__note">
      稼働状況は10分間隔で自動的に取得・更新されます。
    </p>
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
