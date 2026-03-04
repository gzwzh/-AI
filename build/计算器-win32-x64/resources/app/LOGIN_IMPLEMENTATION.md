# 登录功能实现文档

## 概述

本文档描述了"软件端通过网页端同步登录"功能的完整实现。该功能允许用户在软件端点击登录后，通过浏览器完成认证，软件端通过轮询同步登录状态。

## 核心功能

### 1. UI/UX 交互

#### 登录按钮位置
- 位置：右上角（Home 页面 header 中）
- 样式：圆形按钮，与主题切换按钮相邻
- 图标：未登录时显示用户图标，登录后显示用户头像

#### 交互状态

**未登录状态：**
- 点击按钮显示登录面板
- 面板包含"使用浏览器登录"按钮
- 显示登录提示信息

**登录中状态：**
- 显示加载动画
- 提示"正在登录中..."
- 提供"取消登录"按钮
- 提示用户在浏览器中完成登录

**已登录状态：**
- 按钮显示用户头像
- 点击显示用户信息面板
- 显示用户昵称和头像
- 提供"退出登录"按钮

### 2. 登录流程

#### 流程步骤

1. **生成签名的临时会话ID**
   - 使用 `generateSignedNonce()` 生成包含 nonce、timestamp、signature 的对象
   - 签名算法：HMAC-SHA256
   - 密钥：`7530bfb1ad6c41627b0f0620078fa5ed`

2. **编码 nonce**
   - 使用 `encodeSignedNonce()` 将 nonce 编码为 URL 安全字符串
   - 支持在 URL 中传输

3. **获取网页登录地址**
   - 调用 `/soft_desktop/get_web_login_url` 接口
   - 获取网页端登录地址

4. **唤起浏览器**
   - 使用 `window.open()` 打开外部浏览器
   - 将编码后的 nonce 作为查询参数传递

5. **轮询获取 Token**
   - 调用 `/user/desktop_get_token` 接口
   - 轮询间隔：2 秒
   - 最大超时：300 秒

6. **获取用户信息**
   - 调用 `/soft_desktop/get_user_info` 接口
   - 获取用户头像和昵称

7. **持久化存储**
   - Token 存储在 localStorage
   - 用户信息存储在 localStorage
   - 应用启动时自动恢复登录状态

### 3. 异常处理

#### 超时控制
- 轮询最大时长：300 秒
- 超时后自动停止轮询
- 恢复未登录状态
- 显示超时错误提示

#### 手动取消
- 轮询期间提供"取消登录"按钮
- 点击后立即停止轮询
- 清除所有登录状态

#### 错误处理
- 网络错误：显示错误提示，允许重试
- 签名验证失败：显示错误提示
- Token 过期：自动清除登录状态

## 文件结构

```
src/
├── services/
│   └── auth.ts                 # 认证 API 服务
├── stores/
│   └── auth.ts                 # 认证状态管理（Zustand）
├── components/
│   ├── LoginButton.tsx         # 登录按钮组件
│   └── LoginButton.scss        # 登录按钮样式
├── views/
│   └── Home.tsx                # 主页（集成登录按钮）
└── __tests__/
    └── auth.test.ts            # 登录功能测试
```

## API 接口

### 1. 获取网页端登录地址
```
POST /soft_desktop/get_web_login_url
响应: { code: 1, data: { login_url: "..." } }
```

### 2. 获取登录令牌
```
POST /user/desktop_get_token
参数: client_type=desktop&client_nonce=<encoded_nonce>
响应: { code: 1, data: { token: "..." } }
```

### 3. 检查是否登录
```
POST /user/check_login
参数: token=<token>
响应: { code: 1, msg: "已登录" }
```

### 4. 获取用户信息
```
POST /soft_desktop/get_user_info
Header: token=<token>
响应: { code: 1, data: { user_info: { avatar: "...", nickname: "..." } } }
```

### 5. 退出登录
```
POST /logout
Header: token=<token>
响应: { code: 1, msg: "成功" }
```

## 测试

### 运行测试

```bash
# 安装依赖
npm install

# 运行测试
npm run test:auth
```

### 测试用例

测试文件位置：`src/__tests__/auth.test.ts`

#### 测试1：HMAC-SHA256 签名算法
- 验证签名生成的正确性
- 验证签名的可验证性

#### 测试2：URL 安全编码和解码
- 验证编码后的字符串只包含 URL 安全字符
- 验证解码后的数据与原始数据一致

#### 测试3：时间戳防重放
- 验证时间戳正确递增
- 验证防重放机制有效

#### 测试4：轮询超时机制
- 验证轮询在指定时间后停止
- 验证超时时间设置正确

#### 测试5：手动取消轮询
- 验证取消标志正确设置
- 验证轮询立即停止

#### 测试6：多个 nonce 的唯一性
- 验证生成的 nonce 都是唯一的
- 验证 100 个 nonce 中没有重复

#### 测试7：签名的不可伪造性
- 验证篡改的 nonce 无法通过验证
- 验证防篡改机制有效

### 运行测试

```bash
# 使用 Node.js 直接运行测试
node --loader ts-node/esm src/__tests__/auth.test.ts

# 或使用 tsx（推荐）
npx tsx src/__tests__/auth.test.ts
```

## 使用指南

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 启动 Electron 开发环境
npm run electron:dev
```

### 生产构建

```bash
# 构建应用
npm run build

# 构建 Electron 应用
npm run electron:build
```

## 状态管理

### Zustand Store

使用 Zustand 管理认证状态：

```typescript
import { useAuthStore } from '@/stores/auth'

// 获取状态
const token = useAuthStore((state) => state.token)
const userInfo = useAuthStore((state) => state.userInfo)
const isLoading = useAuthStore((state) => state.isLoading)

// 调用方法
const { setToken, setUserInfo, clearAuth } = useAuthStore()
```

### 本地存储

- Token 存储键：`auth_token`
- 用户信息存储键：`user_info`
- 应用启动时自动恢复登录状态

## 安全考虑

### 密钥管理
- 密钥硬编码在代码中（仅用于演示）
- 生产环境应从安全配置源读取
- 不应在客户端代码中暴露密钥

### 签名验证
- 使用 HMAC-SHA256 算法
- 包含时间戳防重放攻击
- 签名不可伪造

### Token 存储
- Token 存储在 localStorage
- 生产环境应考虑使用更安全的存储方式
- 建议设置 Token 过期时间

## 浏览器兼容性

- 使用 Web Crypto API 进行签名
- 支持所有现代浏览器
- Electron 环境完全支持

## 常见问题

### Q: 如何修改轮询超时时间？
A: 在 `LoginButton.tsx` 中修改 `pollToken` 调用的第二个参数（单位：秒）

### Q: 如何修改轮询间隔？
A: 在 `src/services/auth.ts` 中修改 `pollToken` 函数中的 `setTimeout` 时间（单位：毫秒）

### Q: 如何处理 Token 过期？
A: 在 `checkLogin` 函数中添加过期检查逻辑，或在 API 响应中检查 401 状态码

### Q: 如何支持多个登录账户？
A: 修改 Store 结构以支持多个 Token，或实现账户切换功能

## 后续改进

1. **Token 刷新机制**
   - 实现 Token 自动刷新
   - 处理 Token 过期场景

2. **生物识别登录**
   - 支持指纹/面部识别
   - 提高安全性

3. **登录历史**
   - 记录登录时间和设备信息
   - 提供登录设备管理

4. **社交登录**
   - 支持第三方登录（微信、QQ 等）
   - 简化登录流程

5. **双因素认证**
   - 支持短信/邮箱验证
   - 提高账户安全性
