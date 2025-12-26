<script setup lang="ts">
import type { ModuleItem } from '@/config/modules'
import ModuleIcon from './ModuleIcon.vue'

defineProps<{
  module: ModuleItem
}>()
</script>

<template>
  <router-link :to="module.route" class="module-card">
    <div class="card-icon">
      <ModuleIcon :name="module.icon" />
    </div>
    <span class="card-name">{{ module.name }}</span>
  </router-link>
</template>

<style lang="scss" scoped>
.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: var(--card-bg);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text);
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--shadow);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow);
    background: var(--hover);
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    color: var(--primary-color);
  }
  
  .card-name {
    font-size: 14px;
    text-align: center;
  }
}
</style>
