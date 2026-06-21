<script setup lang="ts">
import type { Summary, Status } from "~/types";

// ビルド時: サーバーAPIが public/data/summary.json を読み込んでHTMLに埋め込む
// JS有効時: 60秒ごとに静的ファイルを直接フェッチして更新
const { data, pending, error: fetchError } = useAsyncData<Summary>(
  "summary",
  () => $fetch("/api/summary")
);

async function clientRefresh(): Promise<void> {
  try {
    const res = await $fetch<Summary>(`/data/summary.json?_=${Date.now()}`, {
      cache: "no-store",
    });
    data.value = res;
  } catch {
    // エラー時は既存データを維持
  }
}

let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => void clientRefresh(), 60000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const github = computed(
  () => data.value?.github ?? "https://github.com/TORO-Server/upptime"
);

const navItems = computed(() => [
  { label: "トップ", href: "#top" },
  { label: "現在の稼働状況", href: "#status" },
  { label: "このサイトについて", href: "#about" },
  { label: "サービス一覧", href: "#services" },
  { label: "関連リンク", href: "#links" },
  { label: "ソースコード", href: github.value, external: true },
]);

const overall = computed<{ key: Status; text: string }>(() => {
  const sites = data.value?.sites ?? [];
  if (sites.length === 0) return { key: "up", text: "—" };
  const down = sites.filter((s) => s.status === "down").length;
  const degraded = sites.filter((s) => s.status === "degraded").length;
  if (down === sites.length)
    return { key: "down", text: "すべてのサービスが停止しています" };
  if (down > 0)
    return { key: "down", text: "一部のサービスで障害が発生しています" };
  if (degraded > 0)
    return { key: "degraded", text: "一部のサービスで応答が遅延しています" };
  return { key: "up", text: "すべてのサービスが正常に稼働しています" };
});

const updatedAt = computed(() =>
  data.value?.generatedAt ? fmtDateTimeJp(data.value.generatedAt) : ""
);
const updatedDate = computed(() =>
  data.value?.generatedAt ? fmtDateJp(data.value.generatedAt) : ""
);
const thisYear = computed(() =>
  data.value?.generatedAt
    ? new Date(data.value.generatedAt).getFullYear()
    : new Date().getFullYear()
);

useHead({
  title: computed(() =>
    data.value?.name
      ? `${data.value.name} // 稼働状況モニター`
      : "TORO STATUS // 稼働状況モニター"
  ),
});
</script>

<template>
  <div class="page">
    <div class="frame">
      <!-- ===== 見出し ===== -->
      <header id="top" class="masthead">
        <h1 class="rainbow glow">{{ data?.name || "TORO Status" }}</h1>
        <p class="subtitle">{{ data?.intro?.title || "TORO サーバー 稼働状況モニター" }}</p>
        <p class="intro">
          {{ data?.intro?.message || "TORO サーバーで提供する各サービスの稼働状況を、リアルタイムに監視・公開しています。障害や遅延が発生した場合は、本ページに反映されます。" }}
        </p>
        <p v-if="updatedAt" class="updated">最終更新：{{ updatedAt }}</p>
      </header>

      <Marquee
        text="TORO サーバー 稼働状況モニター ／ 各サービスの稼働状況を24時間自動で監視しています ／ 障害・メンテナンス情報は本ページにてお知らせいたします"
      />

      <div v-if="pending" class="state">読み込み中です…</div>
      <div v-else-if="fetchError" class="state error">
        ステータスデータの読み込みに失敗しました。<br />
        しばらく経ってから再度お試しください。
      </div>

      <div v-else class="cols">
        <!-- ===== 左メニュー ===== -->
        <aside class="col-nav">
          <RetroNav :items="navItems" :last-update="updatedDate" />
        </aside>

        <!-- ===== 本文 ===== -->
        <main class="col-body">
          <!-- 現在の稼働状況 -->
          <section id="status" class="sec">
            <h2 class="jp-head">■ 現在の稼働状況</h2>
            <div class="banner" :class="overall.key">
              <span class="banner-dot" />{{ overall.text }}
            </div>
            <div class="panel">
              <StatusBar
                :sites="data?.sites ?? []"
                :generated-at="data?.generatedAt ?? null"
              />
            </div>
          </section>

          <RetroDivider variant="wave" />

          <!-- このサイトについて -->
          <section id="about" class="sec">
            <h2 class="jp-head">■ このサイトについて</h2>
            <div class="panel"><AboutBox /></div>
          </section>

          <RetroDivider variant="double" />

          <!-- サービス一覧 -->
          <section id="services" class="sec">
            <h2 class="jp-head">■ サービス一覧</h2>
            <div class="grid">
              <SiteCard v-for="s in data?.sites" :key="s.slug" :site="s" />
            </div>
          </section>

          <RetroDivider variant="wave" />
          <!-- 関連リンク -->
          <section id="links" class="sec">
            <h2 class="jp-head">■ 関連リンク</h2>
            <div class="panel"><LinksSection :github="github" /></div>
          </section>
        </main>
      </div>

      <!-- ===== フッター ===== -->
      <footer class="foot">
        <div class="foot__rule">──────────────────────────</div>
        <p>本ページは TORO サーバー運営チームが提供する公式ステータスページです。</p>
        <p class="foot__sub">
          Since 2024<span v-if="updatedAt"> ／ 最終更新 {{ updatedAt }}</span><br />
          Powered by TypeScript · Nuxt.js · GitHub Actions
        </p>
        <p class="foot__tech">© {{ thisYear }} TORO Server. All rights reserved.</p>
        <div class="foot__rule">──────────────────────────</div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 980px;
  margin: 0 auto;
  padding: 16px 10px 44px;
}
.frame {
  background: var(--paper);
  border: 3px double var(--rule);
  box-shadow: 0 0 0 1px #fff, 0 6px 30px rgba(0, 0, 0, 0.5);
  padding: 12px 14px 18px;
}

/* ---- masthead ---- */
.masthead {
  text-align: center;
  padding: 8px 4px 12px;
  border-bottom: 1px dashed var(--rule-soft);
  scroll-margin-top: 12px;
}
.masthead h1 {
  margin: 0 0 6px;
  font-size: clamp(2rem, 7vw, 3.2rem);
  font-weight: 900;
  letter-spacing: 0.04em;
}
.subtitle {
  margin: 0 0 8px;
  font-family: var(--mono);
  color: var(--rule);
  font-weight: bold;
  letter-spacing: 0.04em;
}
.intro {
  margin: 0 auto 6px;
  max-width: 760px;
  color: var(--ink);
  font-size: 0.92rem;
  line-height: 1.8;
}
.updated {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
}

/* ---- columns ---- */
.cols {
  display: grid;
  grid-template-columns: 184px 1fr;
  gap: 14px;
  padding-top: 12px;
}
.col-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: start;
  position: sticky;
  top: 8px;
}
.col-body {
  min-width: 0;
}
@media (max-width: 720px) {
  .cols {
    grid-template-columns: 1fr;
  }
  .col-nav {
    position: static;
  }
}

/* ---- panel + heading ---- */
.panel {
  background: var(--paper);
  border: 1px solid var(--rule-soft);
  padding: 10px 12px;
}
.sec {
  scroll-margin-top: 12px;
  margin: 2px 0;
}
.jp-head {
  margin: 6px 0 8px;
  padding: 4px 10px;
  font-size: 1.02rem;
  color: var(--rule);
  background: var(--paper-head);
  border-left: 6px solid #c01a5b;
  border-bottom: 1px solid var(--rule-soft);
}

/* ---- status banner ---- */
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 14px;
  font-weight: bold;
  margin: 0 0 12px;
  border: 2px ridge;
  font-family: "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
}
.banner-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
}
.banner.up {
  color: var(--up);
  background: #eafff1;
  border-color: var(--up);
}
.banner.degraded {
  color: var(--degraded);
  background: #fff7e0;
  border-color: var(--degraded);
}
.banner.down {
  color: var(--down);
  background: #ffecec;
  border-color: var(--down);
  animation: alarm 1s steps(2, start) infinite;
}
@keyframes alarm {
  50% {
    background: #ffd6d6;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 12px;
}
@media (max-width: 460px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* ---- footer ---- */
.foot {
  margin-top: 16px;
  text-align: center;
  color: var(--ink);
  font-size: 0.82rem;
}
.foot__rule {
  color: var(--rule-soft);
  font-family: var(--mono);
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
}
.foot p {
  margin: 8px 0;
}
.foot__sub {
  color: var(--ink-soft);
  font-size: 0.76rem;
}
.foot__tech {
  font-family: var(--mono);
  color: var(--ink-soft);
  font-size: 0.74rem;
}

/* ---- retro title (design 維持) ---- */
.rainbow {
  background: linear-gradient(
    90deg,
    #ff0040,
    #ff8c00,
    #ffd000,
    #00b050,
    #0080ff,
    #6a3cff,
    #ff00aa,
    #ff0040
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: rainbow-shift 6s linear infinite;
}
@keyframes rainbow-shift {
  to {
    background-position: 200% center;
  }
}
.glow {
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.25));
}
.state {
  text-align: center;
  padding: 40px 16px;
  font-family: var(--mono);
  color: var(--rule);
}
.state.error {
  color: var(--down);
}
@media (prefers-reduced-motion: reduce) {
  .rainbow,
  .banner.down {
    animation: none;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 8px 4px 24px;
  }
  .frame {
    padding: 8px 8px 12px;
  }
}
</style>
