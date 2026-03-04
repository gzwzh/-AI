# 登录功能集成指南

## 概述

本指南说明如何在现有项目中集成"软件端通过网页端同步登录"功能。

## 已实现的功能

### 1. 核心服务层 (`src/services/auth.ts`)

提供以下函数：

```typescript
// 生成带签名的临时会话ID
export async function generateSignedNonce(): Promise<SignedNonce>

// 编码签名的nonce为URL安全字符串
export function encodeSignedNonce(signedNonce: SignedNonce): string

// 获取网页端登录地址
export async function getWebLoginUrl(): Promise<string>

// 轮询获取Token
export async function pollToken(
  encodedNonce: string,
  timeout?: number,
  onCancel?: () => boolean
): Promise<string>

// 检查是否登录
export async function checkLogin(token: string): Promise<boolean>

// 获取用户信息
export async function getUserInfo(token: string): Promise<UserInfo>

// 退出登录
export async function logout(token: string): Promise<void>
```

### 2. 状态管理 (`src/stores/auth.ts`)

使用 Zustand 管理认证状态：

```typescript
interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  isLoading: boolean
  error: string | null
  isPolling: boolean
  pollCancelFlag: boolean
  
  // 方法
  setToken: (token: string | null) => void
  setUserInfo: (userInfo: UserInfo | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setIsPolling: (polling: boolean) => void
  setPollCancelFlag: (flag: boolean) => void
  initializeAuth: () => Promise<void>
  clearAuth: () => void
}
```

### 3. UI 组件 (`src/components/LoginButton.tsx`)

提供完整的登录 UI 组件，包括：
- 登录按钮
- 登录面板
- 用户信息面板
- 加载状态
- 错误提示

### 4. 集成到主页 (`src/views/Home.tsx`)

登录按钮已集成到主页右上角。

## 使用方式

### 基础使用

#### 1. 在组件中获取登录状态

```typescript
import { useAuthStore } from '@/stores/auth'

function MyComponent() {
  const { token, userInfo, isLoading } = useAuthStore()
  
  if (isLoading) return <div>加载中...</div>
  if (!token) return <div>未登录</div>
  
  return <div>欢迎，{userInfo?.nickname}</div>
}
```

#### 2. 手动触发登录

```typescript
import { useAuthStore } from '@/stores/auth'
import { generateSignedNonce, encodeSignedNonce, pollToken, getUserInfo } from '@/services/auth'

async function handleLogin() {
  const { setToken, setUserInfo } = useAuthStore()
  
  try {
    // 生成签名的nonce
    const signedNonce = await generateSignedNonce()
    const encodedNonce = encodeSignedNonce(signedNonce)
    
    // 轮询获取Token
    const newToken = await pollToken(encodedNonce)
    setToken(newToken)
    
    // 获取用户信息
    const info = await getUserInfo(newToken)
    setUserInfo(info)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

#### 3. 手动退出登录

```typescript
import { useAuthStore } from '@/stores/auth'
import { logout } from '@/services/auth'

async function handleLogout() {
  const { token, clearAuth } = useAuthStore()
  
  try {
    if (token) {
      await logout(token)
    }
    clearAuth()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
```

### 高级使用

#### 1. 自定义轮询超时

```typescript
// 修改轮询超时为 600 秒
const token = await pollToken(encodedNonce, 600)
```

#### 2. 监听轮询取消

```typescript
// 在轮询期间检查取消标志
const cancelFlag = useAuthStore((state) => state.pollCancelFlag)

if (cancelFlag) {
  // 处理取消逻辑
}
```

#### 3. 自定义错误处理

```typescript
import { useAuthStore } from '@/stores/auth'

function MyComponent() {
  const error = useAuthStore((state) => state.error)
  
  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => useAuthStore.setState({ error: null })}>
          关闭
        </button>
      </div>
    )
  }
}
```

## 集成到其他页面

### 在其他页面中添加登录按钮

```typescript
import LoginButton from '@/components/LoginButton'

function MyPage() {
  return (
    <div>
      <header>
        <h1>我的页面</h1>
        <LoginButton />
      </header>
      {/* 页面内容 */}
    </div>
  )
}
```

### 在其他页面中检查登录状态

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

function ProtectedPage() {
  const { token, initializeAuth } = useAuthStore()
  
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])
  
  if (!token) {
    return <div>请先登录</div>
  }
  
  return <div>受保护的内容</div>
}
```

## API 集成

### 在 API 请求中使用 Token

```typescript
import { useAuthStore } from '@/stores/auth'

async function fetchUserData() {
  const token = useAuthStore((state) => state.token)
  
  const response = await fetch('/api/user/data', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  return response.json()
}
```

### 处理 Token 过期

```typescript
async function apiCall(url: string, options: RequestInit = {}) {
  const { token, clearAuth } = useAuthStore()
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'token': token || ''
    }
  })
  
  if (response.status === 401) {
    // Token 过期，清除登录状态
    clearAuth()
    // 重定向到登录页面或显示登录提示
  }
  
  return response.json()
}
```

## 自定义配置

### 修改 API 端点

编辑 `src/config/api.ts`：

```typescript
export const API_BASE_URL = 'https://your-api-server.com'
export const API_ENDPOINTS = {
  GET_WEB_LOGIN_URL: '/your/custom/endpoint',
  // ...
}
```

### 修改轮询配置

编辑 `src/config/api.ts`：

```typescript
export const POLL_CONFIG = {
  INTERVAL: 3000,      // 轮询间隔改为 3 秒
  TIMEOUT: 600,        // 轮询超时改为 600 秒
  REQUEST_TIMEOUT: 10000  // 请求超时改为 10 秒
}
```

### 修改存储键

编辑 `src/config/api.ts`：

```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'my_custom_token_key',
  USER_INFO: 'my_custom_user_info_key',
  THEME: 'my_custom_theme_key'
}
```

## 样式自定义

### 修改登录按钮样式

编辑 `src/components/LoginButton.scss`：

```scss
.login-button {
  width: 50px;  // 修改按钮大小
  height: 50px;
  background: #your-color;  // 修改背景色
  // ...
}
```

### 修改登录面板样式

编辑 `src/components/LoginButton.scss`：

```scss
.login-panel {
  max-width: 400px;  // 修改面板宽度
  border-radius: 16px;  // 修改圆角
  // ...
}
```

## 测试

### 运行单元测试

```bash
npm run test:auth
```

### 手动测试登录流程

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问 `http://localhost:5173`
3. 点击右上角的用户按钮
4. 点击"使用浏览器登录"
5. 在浏览器中完成登录
6. 验证软件端是否同步了登录状态

### 测试错误处理

1. 断开网络连接
2. 点击登录按钮
3. 验证是否显示错误提示
4. 恢复网络连接后重试

## 常见问题

### Q: 如何在 Electron 中使用？
A: 项目已支持 Electron，运行 `npm run electron:dev` 即可

### Q: 如何处理 CORS 问题？
A: 确保后端 API 配置了正确的 CORS 头，或使用代理

### Q: 如何在生产环境中安全存储 Token？
A: 考虑使用 HttpOnly Cookie 或更安全的存储方案

### Q: 如何实现自动登录？
A: 在应用启动时调用 `initializeAuth()` 恢复登录状态

### Q: 如何支持多个登录账户？
A: 修改 Store 结构以支持账户列表，或实现账户切换功能

## 故障排除

### 登录按钮不显示

检查：
1. 是否在 Home.tsx 中导入了 LoginButton
2. 是否在 header 中添加了 LoginButton 组件
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
4. API 响应是否正确

### Token 无法保存

检查：
1. localStorage 是否可用
2. 浏览器隐私模式是否启用
3. 存储空间是否充足

## 下一步

1. 根据需要自定义 UI 和样式
2. 集成到其他页面和功能
3. 实现 Token 刷新机制
4. 添加更多安全措施
5. 进行充分的测试和验证

## 参考资源

- [LOGIN_IMPLEMENTATION.md](./LOGIN_IMPLEMENTATION.md) - 详细实现文档
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [接入文档.md](./接入文档.md) - API 接口文档
- [src/__tests__/auth.test.ts](./src/__tests__/auth.test.ts) - 测试用例
