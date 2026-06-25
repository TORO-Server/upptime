<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>();

const is404 = computed(() => props.error.statusCode === 404);

const title = computed(() =>
  is404.value ? "404 // ページが見つかりません" : `${props.error.statusCode} // エラーが発生しました`
);

useHead({ title });

function handleError() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <div class="page">
    <div class="frame">
      <header class="masthead">
        <h1 class="rainbow glow">TORO Status</h1>
        <p class="subtitle">TORO サーバー 稼働状況モニター</p>
      </header>

      <div class="body">
        <div class="err-box">
          <div class="err-code">{{ error.statusCode }}</div>
          <div class="err-bar" />
          <p class="err-title">
            <template v-if="is404">
              ページが見つかりません
            </template>
            <template v-else>
              エラーが発生しました
            </template>
          </p>
          <p class="err-msg">
            <template v-if="is404">
              お探しのページは存在しないか、移動・削除された可能性があります。<br />
              URL をご確認のうえ、トップページよりアクセスしてください。
            </template>
            <template v-else>
              予期しないエラーが発生しました。<br />
              しばらく時間をおいてから再度お試しください。
            </template>
          </p>

          <div class="err-ascii">
            <pre>{{ is404 ? `┌─────────────────────────────┐
│   ERROR 404 — NOT FOUND     │
│   ページが存在しません       │
└─────────────────────────────┘` : `┌─────────────────────────────┐
│   SERVER ERROR              │
│   エラーが発生しました       │
└─────────────────────────────┘` }}</pre>
          </div>

          <button class="btn-home" @click="handleError">
            ▶ トップページへ戻る
          </button>
        </div>
      </div>

      <footer class="foot">
        <div class="foot__rule">──────────────────────────</div>
        <p class="foot__sub">Powered by TypeScript · Nuxt.js · GitHub Actions</p>
        <p class="foot__tech">© {{ new Date().getFullYear() }} TORO Server. All rights reserved.</p>
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
}
.masthead h1 {
  margin: 0 0 6px;
  font-size: clamp(2rem, 7vw, 3.2rem);
  font-weight: 900;
  letter-spacing: 0.04em;
}
.subtitle {
  margin: 0;
  font-family: var(--mono);
  color: var(--rule);
  font-weight: bold;
  letter-spacing: 0.04em;
}

/* ---- error body ---- */
.body {
  padding: 32px 16px;
  display: flex;
  justify-content: center;
}
.err-box {
  background: var(--paper);
  border: 2px ridge var(--rule-soft);
  padding: 28px 32px;
  text-align: center;
  max-width: 520px;
  width: 100%;
}
.err-code {
  font-family: var(--mono);
  font-size: clamp(3.5rem, 12vw, 6rem);
  font-weight: 900;
  color: var(--down);
  line-height: 1;
  margin-bottom: 4px;
  text-shadow: 3px 3px 0 rgba(204, 17, 34, 0.2);
  animation: flicker 3s steps(1, end) infinite;
}
@keyframes flicker {
  0%, 92%, 96%, 100% { opacity: 1; }
  93%, 95% { opacity: 0.6; }
  94% { opacity: 0.85; }
}
.err-bar {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--down) 0px,
    var(--down) 8px,
    transparent 8px,
    transparent 14px
  );
  margin: 8px 0 16px;
}
.err-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--rule);
  margin: 0 0 12px;
  font-family: "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
}
.err-msg {
  font-size: 0.9rem;
  color: var(--ink-soft);
  line-height: 1.8;
  margin: 0 0 20px;
}
.err-ascii {
  background: var(--paper-alt);
  border: 1px solid var(--rule-soft);
  padding: 10px 14px;
  margin: 0 0 24px;
  text-align: left;
  overflow-x: auto;
}
.err-ascii pre {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--rule);
  white-space: pre;
}
.btn-home {
  display: inline-block;
  padding: 8px 24px;
  background: var(--paper-head);
  border: 2px outset var(--rule);
  color: var(--rule);
  font-family: var(--mono);
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  transition: none;
}
.btn-home:hover {
  background: var(--rule);
  color: var(--paper);
  border-style: inset;
}
.btn-home:active {
  border-style: inset;
  transform: translate(1px, 1px);
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
.foot p { margin: 8px 0; }
.foot__sub {
  color: var(--ink-soft);
  font-size: 0.76rem;
}
.foot__tech {
  font-family: var(--mono);
  color: var(--ink-soft);
  font-size: 0.74rem;
}

/* ---- rainbow (index.vue と共通) ---- */
.rainbow {
  background: linear-gradient(
    90deg,
    #ff0040, #ff8c00, #ffd000, #00b050, #0080ff, #6a3cff, #ff00aa, #ff0040
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: rainbow-shift 6s linear infinite;
}
@keyframes rainbow-shift {
  to { background-position: 200% center; }
}
.glow {
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.25));
}

@media (max-width: 480px) {
  .page { padding: 8px 4px 24px; }
  .frame { padding: 8px 8px 12px; }
  .err-box { padding: 20px 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .rainbow, .err-code { animation: none; }
}
</style>
