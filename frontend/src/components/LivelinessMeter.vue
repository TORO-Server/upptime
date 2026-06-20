<script setup lang="ts">
// ただいまの時刻 + 鯖のにぎわい/ごきげん。当時のJS時計・アクセスランプ風。
import { ref, computed, onMounted, onUnmounted } from "vue";
import { fmtClockJp, fmtDateTimeJp } from "../utils/jst.ts";
import type { SiteSummary } from "../types.ts";

const props = defineProps<{ sites: SiteSummary[]; generatedAt: string | null }>();

const now = ref<number>(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const clock = computed(() => fmtClockJp(now.value));

const players = computed(() =>
  (props.sites ?? []).reduce((a, s) => a + (s.players?.online ?? 0), 0)
);
const upCount = computed(
  () => (props.sites ?? []).filter((s) => s.status === "up").length
);
const total = computed(() => (props.sites ?? []).length);

const avgRt = computed(() => {
  const rt = (props.sites ?? [])
    .map((s) => s.responseTime)
    .filter((v): v is number => typeof v === "number");
  if (!rt.length) return null;
  return Math.round(rt.reduce((a, b) => a + b, 0) / rt.length);
});

const nigiwai = computed(() => {
  const p = players.value;
  if (p === 0) return { mark: "○", text: "すいてます" };
  if (p < 5) return { mark: "◎", text: "ふつう" };
  return { mark: "★", text: "にぎやか！" };
});

const gokigen = computed(() => {
  const a = avgRt.value;
  if (a === null) return { mark: "—", text: "そくてい中" };
  if (a < 300) return { mark: "◎", text: "ばっちり" };
  if (a < 600) return { mark: "○", text: "まあまあ" };
  return { mark: "△", text: "おもめ" };
});

const patrol = computed(() => {
  const t = total.value;
  const u = upCount.value;
  const tail = u === t ? "(全部げんき！)" : "(" + (t - u) + "件 ようちゅうい)";
  return "ただいま " + t + "鯖 を見回り中 (`･ω･´)ゞ  稼働中 " + u + " / " + t + " " + tail;
});
</script>

<template>
  <div class="live">
    <div class="live__clock">ただいまの時刻 … {{ clock }}</div>
    <div class="live__patrol">{{ patrol }}</div>
    <div class="live__meters">
      <span>
        ただいまの にぎわい：<b>{{ nigiwai.mark }} {{ nigiwai.text }}</b>
        (マイクラ {{ players }}人)
      </span>
      <span>
        鯖のごきげん：<b>{{ gokigen.mark }} {{ gokigen.text }}</b>
        <template v-if="avgRt !== null">(平均 {{ avgRt }}ms)</template>
      </span>
    </div>
    <div v-if="generatedAt" class="live__upd">
      さいしゅうチェック：{{ fmtDateTimeJp(generatedAt) }}
    </div>
  </div>
</template>

<style scoped>
.live {
  font-family: var(--mono);
  color: var(--ink);
  font-size: 0.86rem;
  line-height: 1.7;
}
.live__clock {
  font-weight: bold;
  color: var(--rule);
}
.live__patrol {
  color: #0a8a2f;
}
.live__meters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 22px;
  margin-top: 2px;
}
.live__meters b {
  color: #c01a5b;
}
.live__upd {
  color: var(--ink-soft);
  font-size: 0.78rem;
  margin-top: 2px;
}
</style>
