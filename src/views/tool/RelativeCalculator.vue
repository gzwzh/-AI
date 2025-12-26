<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import relationship from 'relationship.js'

const router = useRouter()
const chain = ref<string[]>([])
const gender = ref<'male' | 'female'>('male')
const isReverse = ref(false) // 互查模式

// 关系的中文名称映射（用于显示和传给 relationship.js）
const relationLabels: Record<string, string> = {
  'f': '爸爸', 'm': '妈妈', 'h': '老公', 'w': '老婆',
  'ob': '哥哥', 'lb': '弟弟', 'os': '姐姐', 'ls': '妹妹',
  's': '儿子', 'd': '女儿'
}

// 每个关系的性别（用于同性关系检测）
const relationGender: Record<string, 'male' | 'female'> = {
  'f': 'male', 'm': 'female', 'h': 'male', 'w': 'female',
  'ob': 'male', 'lb': 'male', 'os': 'female', 'ls': 'female',
  's': 'male', 'd': 'female'
}

// 检测是否为同性关系（如：男性的丈夫，或舅舅的丈夫）
const checkSameSexRelation = computed(() => {
  if (chain.value.length === 0) return false
  
  // 检查第一个关系是否与用户性别冲突
  const firstRelation = chain.value[0]
  if (gender.value === 'male' && firstRelation === 'h') return true
  if (gender.value === 'female' && firstRelation === 'w') return true
  
  // 检查链中的关系
  if (chain.value.length < 2) return false
  
  for (let i = 0; i < chain.value.length - 1; i++) {
    const current = chain.value[i]
    const next = chain.value[i + 1]
    const currentGender = relationGender[current]
    
    // 如果当前是男性，下一个是"夫"，则为同性关系
    if (currentGender === 'male' && next === 'h') return true
    // 如果当前是女性，下一个是"妻"，则为同性关系
    if (currentGender === 'female' && next === 'w') return true
  }
  return false
})

const addRelation = (value: string) => {
  chain.value.push(value)
}

const removeLastRelation = () => {
  chain.value.pop()
}

const clearChain = () => {
  chain.value = []
  isReverse.value = false
}

// 互查功能
const toggleReverse = () => {
  isReverse.value = !isReverse.value
}

// 自然语言显示：我的妈妈的哥哥的弟弟
const getChainDisplay = computed(() => {
  if (chain.value.length === 0) return ''
  return '我的' + chain.value.map(v => relationLabels[v] || v).join('的')
})

// 将关系链转换为 relationship.js 需要的格式
const getRelationText = computed(() => {
  if (chain.value.length === 0) return ''
  return chain.value.map(v => relationLabels[v] || v).join('的')
})

// 使用 relationship.js 计算结果
const result = computed(() => {
  if (chain.value.length === 0) return null
  if (checkSameSexRelation.value) return { error: '暂时不支持同性关系查询' }
  
  const text = getRelationText.value
  const sex = gender.value === 'male' ? 1 : 0
  
  try {
    // 我叫TA什么
    const myCallResult = relationship({
      text: text,
      sex: sex,
      reverse: false
    })
    
    // TA叫我什么
    const theirCallResult = relationship({
      text: text,
      sex: sex,
      reverse: true
    })
    
    const myCall = Array.isArray(myCallResult) && myCallResult.length > 0 
      ? myCallResult[0] 
      : '关系较远或未收录'
    
    const theirCall = Array.isArray(theirCallResult) && theirCallResult.length > 0 
      ? theirCallResult[0] 
      : '关系较远或未收录'
    
    if (isReverse.value) {
      return { myCall: theirCall, theirCall: myCall }
    }
    return { myCall, theirCall }
  } catch (e) {
    return { myCall: '计算出错', theirCall: '计算出错' }
  }
})
</script>

<template>
  <div class="tool-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">亲戚称呼</h1>
      <ThemeToggle />
    </header>
    <main class="tool-content">
      <div class="gender-select">
        <span class="label">我的性别：</span>
        <button :class="{ active: gender === 'male' }" @click="gender = 'male'">男</button>
        <button :class="{ active: gender === 'female' }" @click="gender = 'female'">女</button>
      </div>
      
      <div class="display-area">
        <div class="chain-display">
          <span v-if="chain.length === 0" class="placeholder">点击下方按钮添加关系</span>
          <span v-else class="chain-text">{{ getChainDisplay }}</span>
        </div>
        <div class="result-display" v-if="result">
          <template v-if="'error' in result">
            <div class="error-msg">{{ result.error }}</div>
          </template>
          <template v-else>
            <div class="result-row">
              <span class="label">{{ isReverse ? 'TA叫我：' : '我叫TA：' }}</span>
              <span class="value">{{ result.myCall }}</span>
            </div>
            <div class="result-row reverse">
              <span class="label">{{ isReverse ? '我叫TA：' : 'TA叫我：' }}</span>
              <span class="value">{{ result.theirCall }}</span>
            </div>
          </template>
        </div>
      </div>
      
      <div class="relation-buttons">
        <!-- 第一行：夫、妻、退格、清空 -->
        <div class="button-row">
          <button class="rel-btn spouse" @click="addRelation('h')">夫</button>
          <button class="rel-btn spouse" @click="addRelation('w')">妻</button>
          <button class="rel-btn action" @click="removeLastRelation" :disabled="chain.length === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <button class="rel-btn action" @click="clearChain" :disabled="chain.length === 0">C</button>
        </div>
        <!-- 第二行：父、母、兄、弟 -->
        <div class="button-row">
          <button class="rel-btn parent" @click="addRelation('f')">父</button>
          <button class="rel-btn parent" @click="addRelation('m')">母</button>
          <button class="rel-btn sibling" @click="addRelation('ob')">兄</button>
          <button class="rel-btn sibling" @click="addRelation('lb')">弟</button>
        </div>
        <!-- 第三行：姐、妹、子、女 -->
        <div class="button-row">
          <button class="rel-btn sibling" @click="addRelation('os')">姐</button>
          <button class="rel-btn sibling" @click="addRelation('ls')">妹</button>
          <button class="rel-btn child" @click="addRelation('s')">子</button>
          <button class="rel-btn child" @click="addRelation('d')">女</button>
        </div>
        <!-- 第四行：互查、计算 -->
        <div class="button-row bottom-row">
          <button class="rel-btn reverse-btn" :class="{ active: isReverse }" @click="toggleReverse">互查</button>
          <button class="rel-btn calc-btn">=</button>
        </div>
      </div>
      
      <div class="examples">
        <div class="example-title">常见称呼示例</div>
        <div class="example-list">
          <div class="example-item"><span class="path">父 → 父</span><span class="name">爷爷</span></div>
          <div class="example-item"><span class="path">母 → 母</span><span class="name">外婆</span></div>
          <div class="example-item"><span class="path">父 → 兄</span><span class="name">伯父</span></div>
          <div class="example-item"><span class="path">父 → 弟</span><span class="name">叔叔</span></div>
          <div class="example-item"><span class="path">母 → 兄/弟</span><span class="name">舅舅</span></div>
          <div class="example-item"><span class="path">父 → 姐/妹</span><span class="name">姑姑</span></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.tool-page { height: 100vh; background: var(--bg); padding: 12px; display: flex; flex-direction: column; overflow: hidden; }
.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; margin-bottom: 8px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.back-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: var(--card-bg); color: var(--text); cursor: pointer;
  &:hover { background: var(--hover); }
  svg { width: 18px; height: 18px; }
}
.title { font-size: 20px; font-weight: 600; color: var(--text); }
.tool-content {
  flex: 1; max-width: 500px; margin: 0 auto; width: 100%; background: var(--card-bg);
  border-radius: 12px; padding: 12px; box-shadow: 0 4px 20px var(--shadow);
  display: flex; flex-direction: column; overflow: hidden;
}
.gender-select {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-shrink: 0;
  .label { font-size: 15px; color: var(--text-secondary); }
  button {
    padding: 8px 18px; border: 1px solid var(--border); border-radius: 16px;
    background: var(--bg); color: var(--text); font-size: 15px; cursor: pointer;
    &.active { background: var(--primary-color); border-color: var(--primary-color); color: white; }
  }
}
.display-area { 
  background: var(--bg); border-radius: 10px; padding: 14px; margin-bottom: 10px;
  min-height: 100px; flex-shrink: 0;
}
.chain-display {
  font-size: 17px; color: var(--text); margin-bottom: 10px; min-height: 40px;
  line-height: 1.4;
  .placeholder { color: var(--text-secondary); font-size: 15px; }
  .chain-text { color: var(--primary-color); font-weight: 500; }
}
.result-display { padding-top: 10px; border-top: 1px solid var(--border); }
.result-row {
  display: flex; align-items: center; margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
  .label { font-size: 14px; color: var(--text-secondary); width: 70px; }
  .value { font-size: 26px; font-weight: 700; color: var(--primary-color); }
  &.reverse .value { color: #27ae60; }
}
.error-msg {
  font-size: 14px; color: #e74c3c; text-align: center; padding: 8px 0;
}
.relation-buttons { 
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; flex-shrink: 0;
}
.button-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
}
.bottom-row {
  grid-template-columns: 1fr 1fr;
}
.rel-btn {
  padding: 16px 6px; border: 1px solid var(--border); border-radius: 6px; 
  font-size: 20px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  background: var(--bg); color: var(--text);
  display: flex; align-items: center; justify-content: center;
  &:hover:not(:disabled) { background: var(--hover); }
  &:active:not(:disabled) { transform: scale(0.95); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  
  &.spouse { background: #fff3e0; color: #e65100; border-color: #ffcc80; }
  &.parent { background: #fce4ec; color: #c2185b; border-color: #f8bbd9; }
  &.sibling { background: #e3f2fd; color: #1565c0; border-color: #90caf9; }
  &.child { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
  &.action { background: var(--bg); color: var(--text-secondary); }
  
  &.reverse-btn {
    background: var(--bg); color: var(--text);
    &.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
  }
  &.calc-btn { 
    background: #ff9800; color: white; border-color: #ff9800;
    font-size: 22px; font-weight: 700;
  }
}
.examples { padding-top: 12px; border-top: 1px solid var(--border); flex: 1; overflow: auto; }
.example-title { font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; }
.example-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.example-item {
  display: flex; justify-content: space-between; padding: 8px 12px;
  background: var(--bg); border-radius: 6px; font-size: 14px;
  .path { color: var(--text-secondary); }
  .name { color: var(--text); font-weight: 500; }
}

// 深色模式适配
:root[data-theme="dark"] {
  .rel-btn {
    &.spouse { background: #4a3728; color: #ffb74d; border-color: #6d4c41; }
    &.parent { background: #4a2c3a; color: #f48fb1; border-color: #6d3b50; }
    &.sibling { background: #1e3a5f; color: #64b5f6; border-color: #2c5282; }
    &.child { background: #1e4620; color: #81c784; border-color: #2e7d32; }
  }
}
</style>
