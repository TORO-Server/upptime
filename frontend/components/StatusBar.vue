<script setup lang="ts">
// 稼働サマリー（現在時刻・監視件数・稼働中・平均応答）。中立・敬体。
// 時計は ClientOnly で包む — サーバー側では最終チェック時刻を表示し、
// JS有効時のみリアルタイム時計に切り替わる（ハイドレーション不一致を防ぐ）。
import type { SiteSummary } from "~/types";

const props = defineProps<{ sites: SiteSummary[]; generatedAt: string | null }>();

const now = ref<Date | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  now.value = new Date();
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const clock = computed(() => (now.value ? fmtClockJp(now.value) : ""));
const total = computed(() => (props.sites ?? []).length);
const upCount = computed(
  () => (props.sites ?? []).filter((s) => s.status === "up").length
);
const avgRt = computed(() => {
  const rt = (props.sites ?? [])
    .map((s) => s.responseTime)
    .filter((v): v is number => typeof v === "number");
  if (!rt.length) return null;
  return Math.round(rt.reduce((a, b) => a + b, 0) / rt.length);
});
</script>

<template>
  <div class="bar">
    <ClientOnly>
      <div class="bar__clock">現在時刻：{{ clock }}</div>
    </ClientOnly>
    <div class="bar__stats">
      監視対象：<b>{{ total }}</b> 件 ／ 稼働中：<b class="up">{{ upCount }}</b> 件 ／
      平均応答時間：<b>{{ avgRt ?? "—" }}</b> ms
    </div>
    <div v-if="generatedAt" class="bar__upd">
      最終チェック：{{ fmtDateTimeJp(generatedAt) }}
    </div>
  </div>
</template>

<style scoped>
.bar {
  font-family: var(--mono);
  color: var(--ink);
  font-size: 0.86rem;
  line-height: 1.7;
}
.bar__clock {
  font-weight: bold;
  color: var(--rule);
}
.bar__stats b {
  color: var(--ink);
}
.bar__stats .up {
  color: var(--up);
}
.bar__upd {
  color: var(--ink-soft);
  font-size: 0.78rem;
}
</style>
