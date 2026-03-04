import { useAuthStore } from '@/stores/auth'
import {
  generateSignedNonce,
  encodeSignedNonce,
  getWebLoginUrl,
  pollToken,
  getUserInfo,
  logout
} from '@/services/auth'
import './LoginButton.scss'

export default function LoginButton() {
  const {
    token,
    userInfo,
    isLoading,
    setToken,
    setUserInfo,
    setIsLoading,
    setError,
    clearAuth
  } = useAuthStore()

  // 处理登录
  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('开始登录流程...')

      // 1. 生成带签名的nonce
      console.log('生成签名的 nonce...')
      const signedNonce = await generateSignedNonce()
      console.log('签名的 nonce:', signedNonce)
      
      const encodedNonce = encodeSignedNonce(signedNonce)
      console.log('编码后的 nonce:', encodedNonce)

      // 2. 获取网页端登录地址
      console.log('获取网页端登录地址...')
      const webLoginUrl = await getWebLoginUrl()
      console.log('网页端登录地址:', webLoginUrl)

      // 3. 打开浏览器登录页面
      const loginUrl = `${webLoginUrl}?client_type=desktop&client_nonce=${encodedNonce}`
      console.log('完整登录 URL:', loginUrl)
      
      const loginWindow = window.open(loginUrl, '_blank')
      if (!loginWindow) {
        setError('浏览器弹窗被阻止，请检查浏览器设置')
        setIsLoading(false)
        return
      }
      console.log('浏览器已打开')

      // 4. 轮询获取token（1秒超时）
      console.log('开始轮询获取 token...')
      try {
        const newToken = await pollToken(encodedNonce, 1)
        console.log('获取到 token:', newToken)
        setToken(newToken)

        // 5. 获取用户信息
        console.log('获取用户信息...')
        const info = await getUserInfo(newToken)
        console.log('用户信息:', info)
        setUserInfo(info)
        
        console.log('登录成功！')
      } catch (error) {
        console.error('轮询或获取用户信息失败:', error)
        if (error instanceof Error && error.message === '登录已取消') {
          console.log('用户取消了登录')
          setError('登录已取消')
        } else if (error instanceof Error && error.message === '登录超时') {
          console.log('登录超时')
          setError('登录超时，请重试')
        } else {
          setError(error instanceof Error ? error.message : '登录失败')
        }
        setToken(null)
        setUserInfo(null)
      }
    } catch (error) {
      console.error('登录流程错误:', error)
      setError(error instanceof Error ? error.message : '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理退出登录
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      if (token) {
        await logout(token)
      }
      clearAuth()
    } catch (error) {
      setError(error instanceof Error ? error.message : '退出登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 如果已登录，显示用户信息和退出按钮
  if (token && userInfo) {
    return (
      <div className="login-button-container">
        <button
          className="login-button logged-in"
          onClick={handleLogout}
          disabled={isLoading}
          title="点击退出登录"
        >
          <div className="user-avatar">
            <img src={userInfo.avatar} alt={userInfo.nickname} />
          </div>
          <span className="user-name">{userInfo.nickname}</span>
        </button>
      </div>
    )
  }

  // 未登录，显示登录按钮
  return (
    <div className="login-button-container">
      <button
        className="login-button"
        onClick={handleLogin}
        disabled={isLoading}
        title="点击登录"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="login-text">{isLoading ? '登录中...' : '登录/注册'}</span>
      </button>
    </div>
  )
}
