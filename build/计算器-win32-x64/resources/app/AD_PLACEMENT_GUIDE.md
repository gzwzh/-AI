# 广告位置指南

## 📍 推荐的广告位置

基于当前应用的布局和用户体验，以下是推荐的广告位置：

### 1. 顶部广告位 (adv_position_01) ⭐⭐⭐⭐⭐

**位置**：Header 下方，主内容上方

**优势**：
- ✅ 用户首先看到的位置
- ✅ 高曝光率
- ✅ 不影响主要功能
- ✅ 易于关闭

**尺寸建议**：1920×230 (全宽)

**实现方式**：
```tsx
<header>...</header>
<AdBanner position="top" adData={topAd} />
<main>...</main>
```

**用户体验**：⭐⭐⭐⭐⭐ (优秀)

---

### 2. 底部广告位 (adv_position_02) ⭐⭐⭐⭐

**位置**：主内容下方，页面底部

**优势**：
- ✅ 不影响主要内容
- ✅ 用户滚动到底部时看到
- ✅ 适合品牌宣传
- ✅ 易于关闭

**尺寸建议**：1920×230 (全宽)

**实现方式**：
```tsx
<main>...</main>
<AdBanner position="bottom" adData={bottomAd} />
```

**用户体验**：⭐⭐⭐⭐ (很好)

---

### 3. 侧边栏广告位 (adv_position_03) ⭐⭐⭐

**位置**：右侧侧边栏（仅桌面版）

**优势**：
- ✅ 不影响主要内容
- ✅ 持续可见（粘性）
- ✅ 适合竖向广告
- ✅ 移动设备自动隐藏

**尺寸建议**：300×400 (竖向)

**实现方式**：
```tsx
<div className="home-with-sidebar">
  <main>...</main>
  <aside>
    <AdBanner position="sidebar" adData={sidebarAd} />
  </aside>
</div>
```

**用户体验**：⭐⭐⭐ (良好)

**响应式**：
- 桌面版（≥1024px）：显示
- 平板版（768px-1024px）：隐藏
- 手机版（<768px）：隐藏

---

## 🎯 广告位置对比

| 位置 | 曝光率 | 用户体验 | 推荐度 | 尺寸 |
|------|--------|---------|--------|------|
| 顶部 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 1920×230 |
| 底部 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 1920×230 |
| 侧边栏 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 300×400 |

---

## 📱 响应式设计

### 桌面版 (≥1024px)
```
┌─────────────────────────────────────────┐
│  Header (登录、主题切换)                 │
├─────────────────────────────────────────┤
│  [顶部广告 1920×230]                    │
├──────────────────────────┬──────────────┤
│                          │              │
│  主内容区域              │ 侧边栏广告   │
│  (模块网格)              │ (300×400)    │
│                          │              │
├──────────────────────────┴──────────────┤
│  [底部广告 1920×230]                    │
└─────────────────────────────────────────┘
```

### 平板版 (768px-1024px)
```
┌─────────────────────────────────────────┐
│  Header                                 │
├─────────────────────────────────────────┤
│  [顶部广告 1920×230]                    │
├─────────────────────────────────────────┤
│  主内容区域 (模块网格)                  │
├─────────────────────────────────────────┤
│  [底部广告 1920×230]                    │
└─────────────────────────────────────────┘
```

### 手机版 (<768px)
```
┌──────────────────────┐
│  Header              │
├──────────────────────┤
│  [顶部广告 缩小]     │
├──────────────────────┤
│  主内容区域          │
│  (单列网格)          │
├──────────────────────┤
│  [底部广告 缩小]     │
└──────────────────────┘
```

---

## 🔧 实现方案

### 方案 A：仅顶部广告（推荐用于开始）

**优点**：
- 实现简单
- 用户体验好
- 曝光率高

**代码**：
```tsx
// src/views/Home.tsx
<header>...</header>
<AdBanner position="top" adData={topAd} />
<main>...</main>
```

---

### 方案 B：顶部 + 底部广告（推荐）

**优点**：
- 平衡的广告分布
- 不影响主要内容
- 用户体验好

**代码**：
```tsx
// src/views/Home.tsx
<header>...</header>
<AdBanner position="top" adData={topAd} />
<main>...</main>
<AdBanner position="bottom" adData={bottomAd} />
```

---

### 方案 C：三位置广告（完整方案）

**优点**：
- 最大化广告曝光
- 多种广告类型支持
- 灵活的布局

**代码**：
```tsx
// src/views/Home.tsx
<header>...</header>
<AdBanner position="top" adData={topAd} />
<div className="home-with-sidebar">
  <main>...</main>
  <aside>
    <AdBanner position="sidebar" adData={sidebarAd} />
  </aside>
</div>
<AdBanner position="bottom" adData={bottomAd} />
```

---

## 📊 广告数据配置

### 软件编号
```
soft_number: "10019"  // 鲲穹AI计算器
```

### 广告位置编码
```
adv_position_01  → 顶部广告
adv_position_02  → 底部广告
adv_position_03  → 侧边栏广告
```

### API 调用示例
```typescript
import { getTopAd, getBottomAd, getSidebarAd } from '@/services/ads'

// 获取顶部广告
const topAd = await getTopAd('10019')

// 获取底部广告
const bottomAd = await getBottomAd('10019')

// 获取侧边栏广告
const sidebarAd = await getSidebarAd('10019')
```

---

## 🎨 广告样式定制

### 广告容器样式
```scss
.ad-banner {
  // 背景色
  background: var(--card-bg);
  
  // 圆角
  border-radius: 8px;
  
  // 阴影
  box-shadow: 0 2px 8px var(--shadow);
  
  // 动画
  transition: all 0.3s ease;
}
```

### 广告图片样式
```scss
.ad-image {
  // 悬停效果
  &:hover {
    transform: scale(1.02);
  }
  
  // 对象适配
  object-fit: contain;
}
```

### 关闭按钮样式
```scss
.ad-close {
  // 位置
  position: absolute;
  top: 8px;
  right: 8px;
  
  // 大小
  width: 28px;
  height: 28px;
  
  // 样式
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
}
```

---

## 🚀 快速实现步骤

### 1. 添加顶部广告

编辑 `src/views/Home.tsx`：

```tsx
import AdBanner from '@/components/AdBanner'
import { getTopAd } from '@/services/ads'

export default function Home() {
  const [topAd, setTopAd] = useState(null)

  useEffect(() => {
    getTopAd('10019').then(ad => {
      if (ad) setTopAd(transformAd(ad))
    })
  }, [])

  return (
    <div className="home">
      <header>...</header>
      <AdBanner position="top" adData={topAd} />
      <main>...</main>
    </div>
  )
}
```

### 2. 添加底部广告

```tsx
import { getBottomAd } from '@/services/ads'

export default function Home() {
  const [bottomAd, setBottomAd] = useState(null)

  useEffect(() => {
    getBottomAd('10019').then(ad => {
      if (ad) setBottomAd(transformAd(ad))
    })
  }, [])

  return (
    <div className="home">
      <header>...</header>
      <AdBanner position="top" adData={topAd} />
      <main>...</main>
      <AdBanner position="bottom" adData={bottomAd} />
    </div>
  )
}
```

### 3. 添加侧边栏广告

编辑 `src/views/Home.scss`：

```scss
.home {
  display: flex;
  gap: 20px;
}

.home-main {
  flex: 1;
}

.home-sidebar {
  width: 300px;
}

@media (max-width: 1024px) {
  .home {
    flex-direction: column;
  }

  .home-sidebar {
    display: none;
  }
}
```

---

## 💡 最佳实践

### 1. 用户体验优先
- ✅ 提供关闭按钮
- ✅ 不阻挡主要内容
- ✅ 响应式设计
- ✅ 加载状态提示

### 2. 性能优化
- ✅ 异步加载广告
- ✅ 缓存广告数据
- ✅ 错误处理
- ✅ 加载超时控制

### 3. 分析追踪
- ✅ 记录广告展示
- ✅ 记录广告点击
- ✅ 分析用户行为
- ✅ 优化广告投放

### 4. 内容安全
- ✅ 验证广告 URL
- ✅ 检查图片加载
- ✅ 防止恶意脚本
- ✅ 隐私保护

---

## 📈 广告效果评估

### 关键指标
- **展示次数 (Impressions)**：广告被展示的次数
- **点击次数 (Clicks)**：用户点击广告的次数
- **点击率 (CTR)**：点击次数 / 展示次数
- **转化率 (Conversion)**：点击后的转化比例

### 优化建议
1. 监控各位置的 CTR
2. 根据数据调整广告位置
3. A/B 测试不同的广告尺寸
4. 定期更新广告内容

---

## 🎯 推荐方案

**对于初期**：
- 使用方案 A（仅顶部广告）
- 简单易实现
- 用户体验好
- 便于测试

**对于成熟期**：
- 使用方案 B（顶部 + 底部）
- 平衡的广告分布
- 最佳的用户体验
- 推荐长期使用

**对于高级阶段**：
- 使用方案 C（三位置）
- 最大化广告收益
- 需要优化用户体验
- 需要性能优化

---

## 📞 支持

如有问题，请参考：
- 广告服务：`src/services/ads.ts`
- 广告组件：`src/components/AdBanner.tsx`
- 广告样式：`src/components/AdBanner.scss`
- API 文档：`接入文档.md`

---

**推荐指数**：⭐⭐⭐⭐⭐  
**实现难度**：⭐⭐ (简单)  
**用户体验**：⭐⭐⭐⭐⭐ (优秀)
