<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div class="app" :class="themeStore.theme">
    <router-view />
  </div>
</template>

<style lang="scss">
.app {
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
  
  &.light {
    background-color: #f5f5f5;
    color: #333;
  }
  
  &.dark {
    background-color: #1a1a1a;
    color: #fff;
  }
}
</style>
