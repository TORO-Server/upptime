<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

const props = withDefaults(
  defineProps<{ base?: number; digits?: number }>(),
  { base: 13337, digits: 7 }
);

const count = ref(props.base);

onMounted(() => {
  // Classic "hit counter" — persisted locally since there is no backend.
  const KEY = "toro-status-visits";
  let n = 0;
  try {
    n = Number(localStorage.getItem(KEY) ?? "0") || 0;
    n += 1;
    localStorage.setItem(KEY, String(n));
  } catch {
    n = 1;
  }
  count.value = props.base + n;
});

const cells = computed(() =>
  String(count.value)
    .padStart(props.digits, "0")
    .slice(-props.digits)
    .split("")
);
</script>

<template>
  <div class="counter">
    <span class="counter__label">YOU ARE VISITOR #</span>
    <span class="counter__box">
      <span v-for="(d, i) in cells" :key="i" class="counter__digit">{{ d }}</span>
    </span>
  </div>
</template>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Courier New", monospace;
}
.counter__label {
  color: #9fe6ff;
  font-size: 0.74rem;
  letter-spacing: 0.05em;
}
.counter__box {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  background: #000;
  border: 2px inset #444;
  border-radius: 2px;
}
.counter__digit {
  display: inline-block;
  min-width: 1ch;
  padding: 1px 4px;
  background: #0a0a0a;
  color: #39ff14;
  font-weight: bold;
  font-size: 1.05rem;
  text-shadow: 0 0 6px #39ff14;
  border: 1px solid #1a1a1a;
}
</style>
