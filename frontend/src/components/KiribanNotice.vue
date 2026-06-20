<script setup lang="ts">
// キリ番通知 — 踏み逃げ禁止・掲示板(GitHub)へ報告、というあの文化。
import { computed } from "vue";
import { useVisitorCount } from "../composables/useVisitorCount.ts";

const props = defineProps<{ github?: string | null }>();
const { total } = useVisitorCount();

const KIRIBAN = [
  10000, 11111, 12345, 22222, 33333, 44444, 50000, 55555, 66666, 77777, 88888,
  99999, 100000,
];

const discussions = computed(() =>
  props.github ? `${props.github}/discussions` : "https://github.com/TORO-Server/upptime/discussions"
);

type KState =
  | { kind: "hit"; n: number }
  | { kind: "near"; n: number; remain: number }
  | { kind: "missed"; n: number }
  | { kind: "none"; next: number | null };

const state = computed<KState>(() => {
  const n = total.value;
  if (KIRIBAN.includes(n)) return { kind: "hit", n };
  const near = KIRIBAN.find((k) => n < k && k - n <= 3);
  if (near) return { kind: "near", n: near, remain: near - n };
  const missed = KIRIBAN.find((k) => n > k && n - k <= 2);
  if (missed) return { kind: "missed", n: missed };
  const next = KIRIBAN.find((k) => k > n) ?? null;
  return { kind: "none", next };
});
</script>

<template>
  <div class="kiriban" :class="state.kind">
    <div class="kiriban__head">★☆ キリ番のお知らせ ☆★</div>

    <p v-if="state.kind === 'hit'" class="kiriban__body big">
      ☆祝☆ キリ番おめでとうございます！！<br />
      あなたは記念すべき <b>{{ state.n.toLocaleString() }}</b> 人目の来訪者です ヽ(^o^)丿<br />
      <a :href="discussions" target="_blank" rel="noopener">掲示板(GitHub Discussions)へご報告</a>
      いただいた方には、管理人手描きのキリ番プレゼント絵をさしあげます (≧▽≦)
    </p>

    <p v-else-if="state.kind === 'near'" class="kiriban__body">
      あと <b>{{ state.remain }}</b> で <b>{{ state.n.toLocaleString() }}</b> のキリ番です！<br />
      ここで止めて踏むもよし…でも踏み逃げは厳禁ですよ (`･ω･´)
    </p>

    <p v-else-if="state.kind === 'missed'" class="kiriban__body">
      あっ…たったいま <b>{{ state.n.toLocaleString() }}</b> のキリ番、通り過ぎちゃった？<br />
      ふ・み・に・げ は ぜったいダメですからね〜 (T_T)
    </p>

    <p v-else class="kiriban__body">
      10000 / 12345 / 22222 / 77777 / 100000 … はキリ番です！<br />
      <template v-if="state.next">
        つぎのキリ番は <b>{{ state.next.toLocaleString() }}</b>。
      </template>
      踏んだら
      <a :href="discussions" target="_blank" rel="noopener">掲示板(GitHub)</a>
      へ教えてね φ(..)
    </p>

    <p class="kiriban__rule">
      【お願い】キリ番の踏み逃げは固くお断りしております m(_ _)m
    </p>
  </div>
</template>

<style scoped>
.kiriban {
  border: 2px dashed var(--rule);
  background: var(--paper-head);
  padding: 8px 12px;
  text-align: center;
  color: var(--ink);
  font-size: 0.88rem;
}
.kiriban.hit {
  border-style: solid;
  border-color: #e0407a;
  background: #fff0c8;
  animation: kira 0.9s steps(2, start) infinite;
}
@keyframes kira {
  50% {
    background: #ffe2f0;
  }
}
.kiriban__head {
  font-weight: bold;
  color: #c01a5b;
  margin-bottom: 4px;
}
.kiriban__body {
  margin: 4px 0;
}
.kiriban__body.big {
  font-size: 1rem;
}
.kiriban__body b {
  color: #cc1122;
  font-size: 1.05em;
}
.kiriban__rule {
  margin: 6px 0 0;
  font-size: 0.74rem;
  color: var(--ink-soft);
}
@media (prefers-reduced-motion: reduce) {
  .kiriban.hit {
    animation: none;
  }
}
</style>
