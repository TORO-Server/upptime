<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import SiteCard from "./components/SiteCard.vue";
import ServerRoom from "./components/ServerRoom.vue";
import Marquee from "./components/Marquee.vue";
import RetroNav from "./components/RetroNav.vue";
import AccessCounter from "./components/AccessCounter.vue";
import KiribanNotice from "./components/KiribanNotice.vue";
import KanrininDiary from "./components/KanrininDiary.vue";
import ProfileBox from "./components/ProfileBox.vue";
import LinksSection from "./components/LinksSection.vue";
import LivelinessMeter from "./components/LivelinessMeter.vue";
import RetroDivider from "./components/RetroDivider.vue";
import UnderConstruction from "./components/UnderConstruction.vue";
import { fmtDateJp, fmtDateTimeJp, daysBetween } from "./utils/jst.ts";
import type { Summary, Status } from "./types.ts";

const SINCE = "2024-11-01T00:00:00+09:00";

const data = ref<Summary | null>(null);
const error = ref(false);
const loading = ref(true);
const selectedSlug = ref<string | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;
let flashTimer: ReturnType<typeof setTimeout> | null = null;

async function load(): Promise<void> {
  try {
    const url = `${import.meta.env.BASE_URL}data/summary.json?_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data.value = (await res.json()) as Summary;
    error.value = false;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void load();
  timer = setInterval(() => void load(), 60000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (flashTimer) clearTimeout(flashTimer);
});

const github = computed(
  () => data.value?.github ?? "https://github.com/TORO-Server/upptime"
);

const navItems = computed(() => [
  { label: "とっぷ", href: "#top" },
  { label: "ぷろふぃーる", href: "#about" },
  { label: "さーばのようす", href: "#server-room" },
  { label: "さーびすいちらん", href: "#services" },
  { label: "こうしんりれき", href: "#diary" },
  { label: "りんく", href: "#links" },
  { label: "けいじばん", href: `${github.value}/discussions`, external: true },
  { label: "そーすこーど", href: github.value, external: true },
]);

const roomSites = computed(() =>
  (data.value?.sites ?? []).map((s) => ({
    slug: s.slug,
    name: s.name,
    status: s.status,
  }))
);

const overall = computed<{ key: Status; text: string }>(() => {
  const sites = data.value?.sites ?? [];
  if (sites.length === 0) return { key: "up", text: "—" };
  const down = sites.filter((s) => s.status === "down").length;
  const degraded = sites.filter((s) => s.status === "degraded").length;
  if (down === sites.length) return { key: "down", text: "ぜんぶ おやすみ中です…(T_T)" };
  if (down > 0) return { key: "down", text: "いちぶ ダウンしています ごめんなさい m(_ _)m" };
  if (degraded > 0) return { key: "degraded", text: "いちぶ ちょっと不調かも (´・ω・`)" };
  return { key: "up", text: "ぜんぶ げんきに かどう中です！(^o^)/" };
});

const updatedAt = computed(() =>
  data.value?.generatedAt ? fmtDateTimeJp(data.value.generatedAt) : ""
);
const updatedDate = computed(() =>
  data.value?.generatedAt ? fmtDateJp(data.value.generatedAt) : ""
);
const openDays = computed(() =>
  daysBetween(SINCE, data.value?.generatedAt ?? new Date())
);
const thisYear = computed(() =>
  data.value?.generatedAt
    ? new Date(data.value.generatedAt).getFullYear()
    : new Date().getFullYear()
);

function onSelect(slug: string): void {
  selectedSlug.value = slug;
  const el = document.getElementById(`site-${slug}`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => (selectedSlug.value = null), 2600);
}
</script>

<template>
  <div class="page">
    <div class="frame">
      <!-- ===== 見出し / テキストサイト風口上 ===== -->
      <header id="top" class="masthead">
        <h1 class="rainbow glow">{{ data?.name || "TORO STATUS" }}</h1>
        <p class="kojo">
          ようこそ！TORO サーバー　かどうじょうきょうの　コーナーへ！！<br />
          ここは 管理人が <span class="big">毎　日　せっせと</span><br />
          サーバーの 生死を 見守る　<span class="pink">ヒミツの 観測所</span>　なのれす。<br />
          <span class="soft">…まあ、たいてい　元気なんですけどね (´ー｀)</span>
        </p>
        <p class="since">
          Since 2024.11.01 ／ 開設 <b>{{ openDays }}</b> 日目
          <template v-if="updatedDate"> ／ さいしゅうこうしん {{ updatedDate }}</template>
        </p>
      </header>

      <Marquee
        text="★彡 いらっしゃいませ〜 当サイトは TORO サーバーの かどうじょうきょうを 24時間 みまもる こじんサイトです ／／ キリ番ふんだら けいじばんへ ほうこくしてね ／／ ゆっくりしていってね (^o^)丿 彡★"
      />

      <div v-if="loading" class="state">▓▒░ NOW LOADING … よみこみ中 ░▒▓</div>
      <div v-else-if="error" class="state error">
        ⚠ ステータスデータの よみこみに しっぱいしました。<br />
        しばらくしてから もういちど おためしください m(_ _)m
      </div>

      <div v-else class="cols">
        <!-- ===== 左メニュー ===== -->
        <aside class="col-nav">
          <RetroNav :items="navItems" :last-update="updatedDate" />
          <div class="panel">
            <AccessCounter />
          </div>
        </aside>

        <!-- ===== 本文 ===== -->
        <main class="col-body">
          <div class="panel">
            <KiribanNotice :github="github" />
          </div>

          <RetroDivider variant="star" />

          <!-- ぷろふぃーる -->
          <section id="about" class="sec">
            <h2 class="jp-head">■ ぷろふぃーる（かんりにん しょうかい）</h2>
            <div class="panel"><ProfileBox :github="github" /></div>
          </section>

          <RetroDivider variant="wave" />

          <!-- うちのさーば(3D) -->
          <section id="server-room" class="sec wafu">
            <h2 class="wafu__bar">【 うちの さーば（自慢） 】</h2>
            <div class="wafu__screen">
              <ServerRoom :sites="roomSites" @select="onSelect" />
            </div>
            <p class="wafu__legend">
              これが TORO のサーバ計算機です！マウスで ぐりぐり 動かせるよ (^^)<br />
              <b class="led-g">●みどり＝げんき</b>
              ／ <b class="led-y">●きいろ＝ちょっと不調</b>
              ／ <b class="led-r">●あか＝おやすみ中</b>
            </p>
            <div class="panel">
              <LivelinessMeter
                :sites="data?.sites ?? []"
                :generated-at="data?.generatedAt ?? null"
              />
            </div>
          </section>

          <RetroDivider variant="double" />

          <!-- さーびす いちらん -->
          <section id="services" class="sec">
            <h2 class="jp-head">■ さーびす いちらん（ただいまの ようす）</h2>
            <div class="banner" :class="overall.key">
              <span class="banner-dot" />{{ overall.text }}
            </div>
            <div class="grid">
              <SiteCard
                v-for="s in data?.sites"
                :key="s.slug"
                :site="s"
                :flash="s.slug === selectedSlug"
              />
            </div>
          </section>

          <RetroDivider variant="star" />

          <!-- こうしんりれき / にっき -->
          <section id="diary" class="sec">
            <h2 class="jp-head">■ こうしんりれき ／ かんりにんの にっき</h2>
            <div class="panel">
              <KanrininDiary
                :sites="data?.sites ?? []"
                :generated-at="data?.generatedAt ?? null"
              />
            </div>
          </section>

          <RetroDivider variant="flower" />

          <!-- りんく -->
          <section id="links" class="sec">
            <h2 class="jp-head">■ りんく ／ 相互リンク募集中</h2>
            <div class="panel"><LinksSection :github="github" /></div>
          </section>

          <UnderConstruction
            label="このコーナーは ただいま製作中です。完成までしばらくお待ちくださいませ m(_ _)m"
          />
        </main>
      </div>

      <!-- ===== 和フッター ===== -->
      <footer class="foot">
        <div class="foot__rule">──────────────────────────</div>
        <p>
          このサイトは <b>とろ</b> が こじんてきに 運営しています。<br />
          Netscape Navigator 4.0 ／ Internet Explorer 4.0 以上 推奨 ・
          がめんかいぞうど 800×600 でごらんください。
        </p>
        <p class="foot__sub">
          ♪ BGM：なし（このサイトは おとが でません。むかしは MIDI ながれてたのにね (^^;）<br />
          <span v-if="updatedAt">さいしゅうチェック {{ updatedAt }} ・</span>
          リンクフリー ・ Copyright(C) 1999-{{ thisYear }} TORO SERVER
        </p>
        <p class="foot__tech">
          — powered by TypeScript + Vue.js + three.js + GitHub Actions —
        </p>
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
  margin: 0 0 8px;
  font-size: clamp(2rem, 7vw, 3.2rem);
  font-weight: 900;
  letter-spacing: 0.04em;
}
.kojo {
  margin: 0 0 8px;
  color: var(--ink);
  font-size: 0.96rem;
  line-height: 1.9;
}
.kojo .big {
  font-size: 1.25em;
  font-weight: bold;
  color: #1d4ed8;
}
.kojo .pink {
  color: #c01a5b;
  font-weight: bold;
}
.kojo .soft {
  color: var(--ink-soft);
  font-size: 0.88em;
}
.since {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.76rem;
  color: var(--ink-soft);
}
.since b {
  color: #c01a5b;
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

/* ---- generic panel + heading ---- */
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

/* ---- 3D の和枠 ---- */
.wafu__bar {
  margin: 0;
  padding: 5px 10px;
  font-size: 1.02rem;
  color: #fff;
  background: linear-gradient(90deg, #1a2a6b, #3a4a86);
  border: 1px solid var(--rule);
  text-align: center;
  letter-spacing: 0.06em;
}
.wafu__screen {
  border: 2px inset #cfd6f0;
  background: #02030a;
}
.wafu__legend {
  margin: 6px 0 10px;
  font-size: 0.86rem;
  color: var(--ink);
  text-align: center;
}
.led-g {
  color: var(--up);
}
.led-y {
  color: var(--degraded);
}
.led-r {
  color: var(--down);
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

/* ---- retro text effects ---- */
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
</style>
