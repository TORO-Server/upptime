<script setup lang="ts">
// アクセスカウンター(本日/昨日/累計の3行) — 日本の個人サイトの最象徴部品。
import { computed } from "vue";
import { useVisitorCount } from "../composables/useVisitorCount.ts";

const { total, today, yesterday } = useVisitorCount();

function pad(n: number): string {
  return String(n).padStart(7, "0");
}
const totalDigits = computed(() => pad(total.value).split(""));
</script>

<template>
  <div class="counter">
    <div class="counter__cap">▼ 当サイトへの来訪者数 ▼</div>
    <div class="counter__total">
      <span class="counter__lbl">Total</span>
      <span class="counter__box">
        <span v-for="(d, i) in totalDigits" :key="i" class="counter__digit">{{ d }}</span>
      </span>
    </div>
    <div class="counter__rows">
      <span>本日 : {{ pad(today) }}</span>
      <span>昨日 : {{ pad(yesterday) }}</span>
    </div>
    <p class="counter__welcome">
      ようこそ！あなたは <b>{{ total.toLocaleString() }}</b> 人目のお客様です (^o^)丿<br />
      ゆっくりしていってね。
    </p>
    <p class="counter__note">
      （カウンタは NINJA TOOLS 製 … ではなく localStorage 製です）
    </p>
  </div>
</template>

<style scoped>
.counter {
  text-align: center;
  font-family: var(--mono);
}
.counter__cap {
  color: #c01a5b;
  font-weight: bold;
  margin-bottom: 6px;
}
.counter__total {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.counter__lbl {
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.counter__box {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  background: #000;
  border: 2px inset #555;
}
.counter__digit {
  display: inline-block;
  min-width: 1ch;
  padding: 1px 4px;
  background: #0a0a0a;
  color: #39ff14;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 6px #39ff14;
  border: 1px solid #1a1a1a;
}
.counter__rows {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-top: 5px;
}
.counter__welcome {
  margin: 8px 0 2px;
  font-family: "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
  color: var(--ink);
  font-size: 0.9rem;
}
.counter__welcome b {
  color: #c01a5b;
}
.counter__note {
  margin: 0;
  font-size: 0.7rem;
  color: var(--ink-soft);
}
</style>
