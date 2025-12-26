<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()

const typeNames: Record<string, string> = {
  currency: '汇率换算',
  relative: '亲戚称呼',
  mortgage: '房贷计算',
  tax: '个税计算',
  date: '日期计算',
  radix: '进制转换',
  uppercase: '大写金额',
  finance: '理财计算',
  formula: '万能公式',
}

const typeName = computed(() => typeNames[route.params.type as string] || '工具')
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
