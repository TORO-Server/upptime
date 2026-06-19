<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import SiteCard from "./components/SiteCard.vue";

const data = ref(null);
const error = ref(false);
const loading = ref(true);
let timer = null;

async function load() {
  try {
    const url = `${import.meta.env.BASE_URL}data/summary.json?_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data.value = await res.json();
    error.value = false;
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
  timer = setInterval(load, 60000);
});
onUnmounted(() => clearInterval(timer));

const overall = computed(() => {
  const sites = data.value?.sites ?? [];
  if (sites.length === 0) return { key: "up", text: "—" };
  const down = sites.filter((s) => s.status === "down").length;
  const degraded = sites.filter((s) => s.status === "degraded").length;
  if (down === sites.length) return { key: "down", text: "全システム停止中" };
  if (down > 0) return { key: "down", text: "一部のシステムで障害が発生しています" };
  if (degraded > 0) return { key: "degraded", text: "一部でパフォーマンスが低下しています" };
  return { key: "up", text: "すべてのシステムは正常に稼働中" };
});

const updatedAt = computed(() => {
  if (!data.value?.generatedAt) return "";
  const d = new Date(data.value.generatedAt);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div class="page">
    <header class="header">
      <img
        v-if="data?.logoUrl"
        class="logo"
        :src="data.logoUrl"
        alt=""
        @error="(e) => (e.target.style.display = 'none')"
      />
      <h1>{{ data?.name || "TORO Status" }}</h1>
      <p v-if="data?.intro?.title" class="intro-title">{{ data.intro.title }}</p>
      <p v-if="data?.intro?.message" class="intro-msg">{{ data.intro.message }}</p>
    </header>

    <div v-if="loading" class="state">読込中…</div>

    <div v-else-if="error" class="state error">
      ステータスデータの取得に失敗しました。しばらくしてから再度お試しください。
    </div>

    <template v-else>
      <div class="banner" :class="overall.key">
        <span class="banner-dot" />
        {{ overall.text }}
      </div>

      <main class="grid">
        <SiteCard v-for="s in data.sites" :key="s.slug" :site="s" />
      </main>

      <footer class="footer">
        <span v-if="updatedAt">最終更新: {{ updatedAt }}</span>
        <span class="sep">·</span>
        <span>独自実装 (Vue.js + GitHub Actions)</span>
        <span class="sep">·</span>
        <a v-if="data?.github" :href="data.github" target="_blank" rel="noopener">GitHub</a>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 920px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}
.header {
  text-align: center;
  margin-bottom: 28px;
}
.logo {
  height: 64px;
  width: auto;
  margin-bottom: 12px;
}
.header h1 {
  margin: 0 0 6px;
  font-size: 1.9rem;
}
.intro-title {
  margin: 4px 0 2px;
  font-weight: 600;
}
.intro-msg {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.92rem;
}
.state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
.state.error {
  color: var(--down);
}
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: var(--radius);
  font-weight: 600;
  margin-bottom: 24px;
}
.banner-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
}
.banner.up {
  color: var(--up);
  background: var(--up-bg);
}
.banner.degraded {
  color: var(--degraded);
  background: var(--degraded-bg);
}
.banner.down {
  color: var(--down);
  background: var(--down-bg);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
.footer {
  margin-top: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.82rem;
}
.footer .sep {
  margin: 0 8px;
  opacity: 0.5;
}
</style>
