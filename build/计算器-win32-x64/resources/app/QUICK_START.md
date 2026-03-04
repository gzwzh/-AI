# 登录功能快速开始指南

## 安装依赖

```bash
npm install
```

## 运行测试

### 运行所有登录功能测试

```bash
npm run test:auth
```

测试将验证以下功能：
- ✓ HMAC-SHA256 签名算法正确性
- ✓ URL 安全编码/解码
- ✓ 时间戳防重放机制
- ✓ 轮询超时机制
- ✓ 手动取消轮询功能
- ✓ nonce 唯一性
- ✓ 签名不可伪造性

## 启动开发环境

### 方式1：Web 开发模式

```bash
npm run dev
```

然后在浏览器中打开 `http://localhost:5173`

### 方式2：Electron 开发模式

```bash
npm run electron:dev
```

这将同时启动 Vite 开发服务器和 Electron 应用

## 测试登录功能

### 在 Web 环境中测试

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问 `http://localhost:5173`
3. 点击右上角的用户按钮（未登录时显示用户图标）
4. 点击"使用浏览器登录"按钮
5. 浏览器将打开登录页面
6. 完成登录后，软件端将自动同步登录状态

### 在 Electron 环境中测试

1. 启动 Electron 开发环境：`npm run electron:dev`
2. 在 Electron 窗口中点击右上角的用户按钮
3. 点击"使用浏览器登录"按钮
4. 系统默认浏览器将打开登录页面
5. 完成登录后，Electron 窗口将自动同步登录状态

## 功能演示

### 登录流程

```
1. 点击用户按钮
   ↓
2. 显示登录面板
   ↓
3. 点击"使用浏览器登录"
   ↓
4. 生成签名的 nonce
   ↓
5. 打开浏览器登录页面
   ↓
6. 用户在浏览器中完成登录
   ↓
7. 软件端轮询获取 Token
   ↓
8. 获取用户信息
   ↓
9. 显示用户信息面板
```

### 已登录状态

- 用户按钮显示用户头像
- 点击按钮显示用户信息面板
- 面板显示用户昵称和头像
- 提供"退出登录"按钮

### 退出登录

1. 点击用户按钮
2. 点击"退出登录"按钮
3. 清除本地 Token 和用户信息
4. 返回未登录状态

## 项目结构

```
src/
├── services/
│   └── auth.ts                 # 认证 API 服务
│       ├── generateSignedNonce()      # 生成签名的 nonce
│       ├── encodeSignedNonce()        # 编码 nonce
│       ├── getWebLoginUrl()           # 获取网页登录地址
│       ├── pollToken()                # 轮询获取 Token
│       ├── checkLogin()               # 检查登录状态
│       ├── getUserInfo()              # 获取用户信息
│       └── logout()                   # 退出登录
│
├── stores/
│   └── auth.ts                 # Zustand 认证状态管理
│       ├── token              # 登录令牌
│       ├── userInfo           # 用户信息
│       ├── isLoading          # 加载状态
│       ├── isPolling          # 轮询状态
│       └── 各种 setter 方法
│
├── components/
│   ├── LoginButton.tsx        # 登录按钮组件
│   └── LoginButton.scss       # 登录按钮样式
│
├── views/
│   └── Home.tsx               # 主页（集成登录按钮）
│
└── __tests__/
    └── auth.test.ts           # 登录功能测试
```

## 关键代码示例

### 在组件中使用登录状态

```typescript
import { useAuthStore } from '@/stores/auth'

function MyComponent() {
  const token = useAuthStore((state) => state.token)
  const userInfo = useAuthStore((state) => state.userInfo)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) return <div>加载中...</div>
  if (!token) return <div>未登录</div>
  
  return <div>欢迎，{userInfo?.nickname}</div>
}
```

### 手动调用登录 API

```typescript
import { generateSignedNonce, encodeSignedNonce, pollToken } from '@/services/auth'

async function customLogin() {
  // 生成签名的 nonce
  const signedNonce = await generateSignedNonce()
  const encodedNonce = encodeSignedNonce(signedNonce)
  
  // 轮询获取 Token
  const token = await pollToken(encodedNonce, 300)
  
  // 使用 Token
  console.log('登录成功，Token:', token)
}
```

## 常见问题

### Q: 测试失败怎么办？
A: 检查 Node.js 版本（需要 14+），确保已安装所有依赖

### Q: 登录页面无法打开？
A: 检查网络连接，确保能访问 `https://api-web.kunqiongai.com`

### Q: 轮询一直没有获取到 Token？
A: 确保在浏览器中完成了登录，检查浏览器控制台是否有错误

### Q: 如何修改登录超时时间？
A: 在 `LoginButton.tsx` 中修改 `pollToken` 的第二个参数

### Q: 如何在生产环境中使用？
A: 运行 `npm run build` 构建应用，然后 `npm run electron:build` 打包 Electron 应用

## 下一步

1. 阅读 [LOGIN_IMPLEMENTATION.md](./LOGIN_IMPLEMENTATION.md) 了解详细实现
2. 查看 [src/__tests__/auth.test.ts](./src/__tests__/auth.test.ts) 了解测试用例
3. 根据需要自定义登录 UI 和流程

## 支持

如有问题，请查看：
- 接入文档：`接入文档.md`
- 实现文档：`LOGIN_IMPLEMENTATION.md`
- 测试文件：`src/__tests__/auth.test.ts`
