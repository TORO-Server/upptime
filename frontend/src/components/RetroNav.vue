<script setup lang="ts">
// 左メニュー(・[ とっぷ ]形式)。ひらがな多用がやわらかさの肝。
interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}
defineProps<{ items: NavItem[]; lastUpdate?: string }>();
</script>

<template>
  <nav class="nav">
    <div class="nav__title">★ めにゅー ★</div>
    <ul class="nav__list">
      <li v-for="(it, i) in items" :key="i">
        ・<a
          :href="it.href"
          :target="it.external ? '_blank' : undefined"
          :rel="it.external ? 'noopener' : undefined"
          >[ {{ it.label }} ]</a
        ><span v-if="it.external" class="ext">↗</span>
      </li>
    </ul>
    <div class="nav__rule">─────────</div>
    <div v-if="lastUpdate" class="nav__upd">
      こうしん<br />{{ lastUpdate }}
    </div>
    <div class="nav__rule">─────────</div>
    <div class="nav__rec">
      <span class="rec-blink">●</span> REC<br />
      24時間 かんし中
    </div>
  </nav>
</template>

<style scoped>
.nav {
  background: var(--paper-alt);
  border: 1px solid var(--rule);
  padding: 8px 10px;
  font-size: 0.84rem;
  color: var(--ink);
}
.nav__title {
  text-align: center;
  font-weight: bold;
  color: #c01a5b;
  border-bottom: 1px dashed var(--rule-soft);
  padding-bottom: 4px;
  margin-bottom: 6px;
}
.nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav__list li {
  padding: 2px 0;
  white-space: nowrap;
}
.nav__list .ext {
  font-size: 0.7rem;
  color: var(--ink-soft);
  margin-left: 1px;
}
.nav__rule {
  color: var(--rule-soft);
  text-align: center;
  font-family: var(--mono);
  margin: 6px 0;
  overflow: hidden;
}
.nav__upd {
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--ink-soft);
  text-align: center;
}
.nav__rec {
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--down);
  text-align: center;
}
.rec-blink {
  animation: rec 1s steps(2, start) infinite;
}
@keyframes rec {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rec-blink {
    animation: none;
  }
}
</style>
