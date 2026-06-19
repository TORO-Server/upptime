<script setup lang="ts">
defineProps<{ label?: string }>();
</script>

<template>
  <div class="uc" role="note">
    <span class="uc__worker">🚧</span>
    <span class="uc__text">{{ label ?? "このページは常時 UNDER CONSTRUCTION です" }}</span>
    <span class="uc__worker">👷</span>
  </div>
</template>

<style scoped>
.uc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 6px 10px;
  font-family: "Courier New", monospace;
  font-weight: bold;
  color: #111;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
  background: repeating-linear-gradient(
    45deg,
    #ffd400 0,
    #ffd400 16px,
    #1a1a1a 16px,
    #1a1a1a 32px
  );
  background-size: 200% 100%;
  border: 3px ridge #ffd400;
  animation: uc-slide 1.6s linear infinite;
}
.uc__text {
  padding: 2px 10px;
  background: #ffd400;
  border: 1px solid #1a1a1a;
}
.uc__worker {
  font-size: 1.2rem;
  text-shadow: none;
}
@keyframes uc-slide {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 64px 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .uc {
    animation: none;
  }
}
</style>
