/**
 * API 配置文件
 * 包含所有 API 端点和密钥配置
 */

// API 基础地址
export const API_BASE_URL = 'https://api-web.kunqiongai.com'

// 客户端与服务端约定的密钥
// 注意：生产环境中应从安全配置源读取，不应硬编码
export const SECRET_KEY = '7530bfb1ad6c41627b0f0620078fa5ed'

// API 端点
export const API_ENDPOINTS = {
  // 登录相关
  GET_WEB_LOGIN_URL: '/soft_desktop/get_web_login_url',
  GET_TOKEN: '/user/desktop_get_token',
  CHECK_LOGIN: '/user/check_login',
  GET_USER_INFO: '/soft_desktop/get_user_info',
  LOGOUT: '/logout',

  // 广告相关
  GET_ADV: '/soft_desktop/get_adv',
  
  // 需求定制相关
  GET_CUSTOM_URL: '/soft_desktop/get_custom_url',
  
  // 问题反馈
  GET_FEEDBACK_URL: '/soft_desktop/get_feedback_url'
}

// 轮询配置
export const POLL_CONFIG = {
  // 轮询间隔（毫秒）
  INTERVAL: 2000,
  // 轮询超时（秒）
  TIMEOUT: 300,
  // 网络请求超时（毫秒）
  REQUEST_TIMEOUT: 5000
}

// 存储键
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  THEME: 'theme'
}
