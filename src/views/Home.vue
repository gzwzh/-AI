<script setup lang="ts">
import { moduleCategories } from '@/config/modules'
import ModuleCard from '@/components/ModuleCard.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="home">
    <header class="header">
      <h1 class="title">鲲穹AI计算器</h1>
      <ThemeToggle />
    </header>
    
    <main class="main">
      <section v-for="category in moduleCategories" :key="category.id" class="category">
        <h2 class="category-title">{{ category.name }}</h2>
        <div class="module-grid">
          <ModuleCard 
            v-for="module in category.modules" 
            :key="module.id" 
            :module="module" 
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.home {
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

.title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.category {
  margin-bottom: 40px;
}

.category-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 20px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-color);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  justify-items: center;
}

@media (min-width: 768px) {
  .module-grid {
    grid-template-columns: repeat(auto-fill, 120px);
    justify-content: start;
  }
}
</style>
