<script setup lang="ts">
// 罫線GIF的なセクション区切り。当時は花柄や星のラインGIFを置いた。
withDefaults(defineProps<{ variant?: "wave" | "star" | "double" | "flower" }>(), {
  variant: "star",
});
const CH: Record<string, string> = {
  wave: "〜",
  star: "★彡",
  double: "＝",
  flower: "❀",
};
</script>

<template>
  <div class="divider" :class="variant" aria-hidden="true">
    {{ (CH[variant] ?? "─").repeat(80) }}
  </div>
</template>

<style scoped>
.divider {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
  height: 1.4em;
  line-height: 1.4em;
  margin: 10px 0;
  font-family: var(--mono);
  font-size: 0.9rem;
  user-select: none;
}
.divider.wave {
  color: #4aa3ff;
}
.divider.star {
  color: #e0407a;
}
.divider.double {
  color: var(--rule);
}
.divider.flower {
  color: #d06ab0;
}
</style>
