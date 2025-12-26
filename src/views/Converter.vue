<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()

const typeNames: Record<string, string> = {
  length: '长度转换',
  area: '面积转换',
  volume: '体积转换',
  temperature: '温度转换',
  speed: '速度转换',
  time: '时间转换',
  weight: '重量转换',
  power: '功率转换',
  heat: '热量转换',
  force: '力转换',
  pressure: '压强转换',
  capacity: '容量转换',
  data: '数据存储转换',
}

const typeName = computed(() => typeNames[route.params.type as string] || '单位转换')
</script>

<template>
  <div class="page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">{{ typeName }}</h1>
      <ThemeToggle />
    </header>
    
    <main class="main">
      <div class="placeholder">
        <p>{{ typeName }} 功能开发中...</p>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--hover);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.main {
  max-width: 800px;
  margin: 0 auto;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: var(--card-bg);
  border-radius: 16px;
  color: var(--text-secondary);
  font-size: 18px;
}
</style>
