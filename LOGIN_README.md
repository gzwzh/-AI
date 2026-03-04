# 鲲穹AI计算器 - 登录功能

## 📋 概述

本项目已完整实现"软件端通过网页端同步登录"功能。用户可以在软件端点击登录按钮，通过浏览器完成认证，软件端自动同步登录状态。

## ✨ 主要特性

- 🔐 **安全认证**：HMAC-SHA256 签名，时间戳防重放
- 🌐 **浏览器集成**：自动唤起系统浏览器进行登录
- 🔄 **智能轮询**：自动轮询获取登录令牌
- 💾 **状态持久化**：自动保存和恢复登录状态
- 🎨 **美观 UI**：与项目风格一致的登录界面
- ⚡ **快速响应**：流畅的用户体验
- 📱 **响应式设计**：支持各种屏幕尺寸
- 🧪 **完整测试**：7 个全面的测试用例

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行测试

```bash
npm run test:auth
```

### 3. 启动开发环境

**Web 模式：**
```bash
npm run dev
```

**Electron 模式：**
```bash
npm run electron:dev
```

### 4. 测试登录功能

1. 打开应用
2. 点击右上角的用户按钮
3. 点击"使用浏览器登录"
4. 在浏览器中完成登录
5. 应用自动同步登录状态

## 📁 项目结构

```
src/
├── services/auth.ts           # 认证 API 服务
├── stores/auth.ts             # 状态管理（Zustand）
├── components/
│   ├── LoginButton.tsx        # 登录按钮组件
│   └── LoginButton.scss       # 登录按钮样式
├── config/api.ts              # API 配置
├── views/Home.tsx             # 主页（已集成登录）
└── __tests__/auth.test.ts     # 测试套件
```

## 📚 文档

- **[LOGIN_IMPLEMENTATION.md](./LOGIN_IMPLEMENTATION.md)** - 详细实现文档
- **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - 集成指南
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 实现总结
- **[CHECKLIST.md](./CHECKLIST.md)** - 完成检查清单

## 🔧 核心 API

### 认证服务 (`src/services/auth.ts`)

```typescript
// 生成签名的 nonce
const signedNonce = await generateSignedNonce()

// 编码为 URL 安全字符串
const encoded = encodeSignedNonce(signedNonce)

// 获取网页登录地址
const loginUrl = await getWebLoginUrl()

// 轮询获取 Token
const token = await pollToken(encoded, 300)

// 获取用户信息
const userInfo = await getUserInfo(token)

// 退出登录
await logout(token)
```

### 状态管理 (`src/stores/auth.ts`)

```typescript
import { useAuthStore } from '@/stores/auth'

// 获取状态
const token = useAuthStore((state) => state.token)
const userInfo = useAuthStore((state) => state.userInfo)
const isLoading = useAuthStore((state) => state.isLoading)

// 调用方法
const { setToken, setUserInfo, clearAuth } = useAuthStore()
```

## 🧪 测试

### 运行所有测试

```bash
npm run test:auth
```

### 测试覆盖

- ✓ HMAC-SHA256 签名算法
- ✓ URL 安全编码/解码
- ✓ 时间戳防重放
- ✓ 轮询超时机制
- ✓ 手动取消轮询
- ✓ nonce 唯一性
- ✓ 签名不可伪造

## 🎯 使用示例

### 基础使用

```typescript
import LoginButton from '@/components/LoginButton'

function App() {
  return (
    <div>
      <header>
        <h1>我的应用</h1>
        <LoginButton />
      </header>
    </div>
  )
}
```

### 检查登录状态

```typescript
import { useAuthStore } from '@/stores/auth'

function MyComponent() {
  const { token, userInfo } = useAuthStore()
  
  if (!token) {
    return <div>请先登录</div>
  }
  
  return <div>欢迎，{userInfo?.nickname}</div>
}
```

### 手动登录

```typescript
import { useAuthStore } from '@/stores/auth'
import { generateSignedNonce, encodeSignedNonce, pollToken, getUserInfo } from '@/services/auth'

async function handleLogin() {
  const { setToken, setUserInfo } = useAuthStore()
  
  try {
    const signedNonce = await generateSignedNonce()
    const encoded = encodeSignedNonce(signedNonce)
    const token = await pollToken(encoded)
    const info = await getUserInfo(token)
    
    setToken(token)
    setUserInfo(info)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

## ⚙️ 配置

### 修改 API 端点

编辑 `src/config/api.ts`：

```typescript
export const API_BASE_URL = 'https://your-api-server.com'
```

### 修改轮询超时

在 `LoginButton.tsx` 中修改：

```typescript
const token = await pollToken(encoded, 600)  // 改为 600 秒
```

### 修改轮询间隔

编辑 `src/services/auth.ts`：

```typescript
await new Promise(resolve => setTimeout(resolve, 3000))  // 改为 3 秒
```

## 🔒 安全特性

- **HMAC-SHA256 签名**：确保数据完整性
- **时间戳防重放**：防止重放攻击
- **签名验证**：防止数据篡改
- **Token 持久化**：安全存储认证令牌
- **自动过期处理**：处理 Token 过期场景

## 🌐 浏览器兼容性

- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+
- ✓ Electron 28+

## 📱 平台支持

- ✓ Windows
- ✓ macOS
- ✓ Linux
- ✓ Web
- ✓ Electron

## 🐛 故障排除

### 登录按钮不显示

检查：
1. 是否在 Home.tsx 中导入了 LoginButton
2. 是否在 header 中添加了组件
3. 浏览器控制台是否有错误

### 登录页面无法打开

检查：
1. 网络连接是否正常
2. API 端点是否正确
3. 浏览器是否阻止了弹窗

### 轮询无法获取 Token

检查：
1. 是否在浏览器中完成了登录
2. 网络连接是否正常
3. 浏览器控制台是否有错误

## 📖 更多信息

- 详细实现：[LOGIN_IMPLEMENTATION.md](./LOGIN_IMPLEMENTATION.md)
- 快速开始：[QUICK_START.md](./QUICK_START.md)
- 集成指南：[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- API 文档：[接入文档.md](./接入文档.md)

## 🎓 学习资源

### 核心概念

1. **HMAC-SHA256 签名**
   - 用于生成不可伪造的签名
   - 确保数据完整性

2. **时间戳防重放**
   - 防止相同请求被重复使用
   - 增强安全性

3. **轮询机制**
   - 定期检查登录状态
   - 自动获取登录令牌

4. **状态管理**
   - 使用 Zustand 管理认证状态
   - 支持持久化存储

### 相关技术

- React 18
- TypeScript
- Zustand
- Web Crypto API
- Electron

## 🤝 贡献

欢迎提交问题和改进建议！

## 📄 许可证

MIT License

## 📞 支持

如有问题，请查看：
- 文档：[LOGIN_IMPLEMENTATION.md](./LOGIN_IMPLEMENTATION.md)
- 测试：[src/__tests__/auth.test.ts](./src/__tests__/auth.test.ts)
- 接入文档：[接入文档.md](./接入文档.md)

---

**版本**：1.0.0  
**最后更新**：2026-01-06  
**状态**：✓ 生产就绪
