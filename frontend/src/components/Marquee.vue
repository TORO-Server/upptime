<script setup lang="ts">
defineProps<{ text: string }>();
</script>

<template>
  <div class="marquee">
    <div class="marquee__track">
      <span>{{ text }}</span>
      <span aria-hidden="true">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  overflow: hidden;
  white-space: nowrap;
  border: 2px ridge #00ffe1;
  background: #000010;
  padding: 5px 0;
}
.marquee__track {
  display: inline-flex;
  gap: 5rem;
  padding-left: 100%;
  animation: marquee-scroll 26s linear infinite;
  will-change: transform;
}
.marquee__track span {
  font-family: "Courier New", monospace;
  font-weight: bold;
  color: #fff066;
  text-shadow: 0 0 6px #ff0;
  font-size: 0.92rem;
}
@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .marquee__track {
    animation: none;
    padding-left: 0;
  }
}
</style>
