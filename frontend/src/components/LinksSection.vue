<script setup lang="ts">
// りんく / 相互リンク募集。リンクフリー宣言 + 自前バナー(200x40) + 88x31バッジ。
import { computed } from "vue";
import RetroBadges from "./RetroBadges.vue";

const props = defineProps<{ github?: string | null }>();
const repo = computed(
  () => props.github ?? "https://github.com/TORO-Server/upptime"
);
const discussions = computed(() => `${repo.value}/discussions`);

const links: { label: string; href: string; note: string }[] = [
  { label: "そーすこーど(GitHub)", href: "", note: "→ うちの鯖の中身が まるみえ" },
  { label: "けいじばん(Discussions)", href: "", note: "→ ごようは こちらへどうぞ" },
  { label: "TORO サーバー本家", href: "https://torosaba.net/", note: "→ ほんけサイトはこちら" },
];
const resolved = computed(() =>
  links.map((l, i) => ({
    ...l,
    href: i === 0 ? repo.value : i === 1 ? discussions.value : l.href,
  }))
);
</script>

<template>
  <div class="links">
    <p class="links__intro">
      当サイトはリンクフリーです (^^)/ 報告は不要ですが、いただけると喜びます。<br />
      <b>相互リンク募集中！</b> GitHubの掲示板から こえをかけてね。
    </p>

    <ul class="links__list">
      <li v-for="(l, i) in resolved" :key="i">
        ・<a :href="l.href" target="_blank" rel="noopener">{{ l.label }}</a>
        <span class="links__note">{{ l.note }}</span>
      </li>
    </ul>

    <p class="links__banner-cap">
      ▼ バナーはこちらをお使いください (直リン禁止・保存してね) ▼
    </p>
    <div class="banner200">
      <span class="banner200__logo">▣</span>
      <span class="banner200__txt">
        <b>TORO STATUS</b><br />
        <small>status.torosaba.net</small>
      </span>
    </div>

    <p class="links__badge-cap">── おきにいり ボタン ──</p>
    <RetroBadges />
  </div>
</template>

<style scoped>
.links {
  color: var(--ink);
  font-size: 0.9rem;
}
.links__intro {
  margin: 0 0 8px;
}
.links__intro b {
  color: #c01a5b;
}
.links__list {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
}
.links__list li {
  padding: 2px 0;
}
.links__note {
  color: var(--ink-soft);
  font-size: 0.82rem;
  margin-left: 6px;
}
.links__banner-cap,
.links__badge-cap {
  text-align: center;
  color: var(--ink-soft);
  font-size: 0.78rem;
  margin: 10px 0 6px;
}
.banner200 {
  width: 200px;
  height: 40px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  background: linear-gradient(135deg, #05060e, #11173a);
  border: 2px ridge #5a6ab0;
  color: #fff;
  font-family: var(--mono);
}
.banner200__logo {
  font-size: 1.4rem;
  color: #35ff7b;
  text-shadow: 0 0 6px #35ff7b;
}
.banner200__txt b {
  color: #ffe600;
  letter-spacing: 0.04em;
}
.banner200__txt small {
  color: #9fe6ff;
  font-size: 0.62rem;
}
</style>
