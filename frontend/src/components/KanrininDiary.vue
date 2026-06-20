<script setup lang="ts">
// 管理人のにっき / こうしんりれき。summary.json の状態から日誌を自動生成する。
// テキストサイト調・口語・顔文字。最新の1件だけ NEW! を点滅。
import { computed } from "vue";
import { fmtDateJp } from "../utils/jst.ts";
import type { SiteSummary } from "../types.ts";

const props = defineProps<{ sites: SiteSummary[]; generatedAt: string | null }>();

interface Entry {
  date: string;
  lines: string[];
  isNew: boolean;
}

const entries = computed<Entry[]>(() => {
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

  const today: string[] = [];
  if (down.length) {
    today.push(
      "ありゃっ、" +
        down.map((d) => d.name).join("・") +
        " が落ちてるみたい…ごめんなさい m(_ _)m すぐ見てきます！"
    );
  } else if (deg.length) {
    today.push(
      deg.map((d) => d.name).join("・") +
        " がちょっと重いかも。ようすみ中です (´・ω・`)"
    );
  } else {
    today.push(
      "きょうも " + total + "個 のサービス、ぜんぶ元気にうごいてました！(^o^)/"
    );
  }
  if (players > 0) {
    today.push("いま " + players + "人 がマイクラで遊んでます ｷﾀ━(ﾟ∀ﾟ)━!");
  } else {
    today.push("マイクラ鯖はいまガラ空き…だれかあそびにきてー (´；ω；｀)");
  }
  if (
    slowest &&
    typeof slowest.responseTime === "number" &&
    slowest.responseTime > 500
  ) {
    today.push(
      slowest.name +
        " がちょっと重め(" +
        slowest.responseTime +
        "ms)。みんな見に来てるのかな (^^;"
    );
  }

  const day = 86400000;
  return [
    { date: fmtDateJp(baseMs), lines: today, isNew: true },
    {
      date: fmtDateJp(baseMs - day),
      lines: ["いじょうなし。へいわが いちばん なのれす (´ー｀)"],
      isNew: false,
    },
    {
      date: fmtDateJp(baseMs - 2 * day),
      lines: ["さーば部屋のそうじをしました。ぴかぴか！ (`･ω･´)ゞ"],
      isNew: false,
    },
  ];
});
</script>

<template>
  <div class="diary">
    <div v-for="(en, i) in entries" :key="i" class="diary__entry">
      <div class="diary__date">
        ■ {{ en.date }}
        <span v-if="en.isNew" class="diary__new">NEW!</span>
      </div>
      <p class="diary__body">
        <template v-for="(l, j) in en.lines" :key="j">{{ l }}<br /></template>
      </p>
    </div>
    <p class="diary__foot">
      ★毎日更新中★ … というか10分おきに更新されてます(自動)。管理人のマメさは折り紙つき！ｗ
    </p>
  </div>
</template>

<style scoped>
.diary {
  color: var(--ink);
  font-size: 0.9rem;
}
.diary__entry {
  padding: 4px 0 8px;
  border-bottom: 1px dotted var(--rule-soft);
  margin-bottom: 6px;
}
.diary__date {
  font-weight: bold;
  color: var(--rule);
  margin-bottom: 2px;
}
.diary__new {
  color: #fff;
  background: #cc1122;
  font-size: 0.7rem;
  padding: 0 4px;
  margin-left: 6px;
  animation: new-blink 0.8s steps(2, start) infinite;
}
@keyframes new-blink {
  50% {
    opacity: 0.2;
  }
}
.diary__body {
  margin: 0;
  line-height: 1.7;
}
.diary__foot {
  margin: 4px 0 0;
  font-size: 0.76rem;
  color: var(--ink-soft);
}
@media (prefers-reduced-motion: reduce) {
  .diary__new {
    animation: none;
  }
}
</style>
