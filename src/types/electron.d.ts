export interface IElectronAPI {
  getAppVersion: () => Promise<string>
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
  request: (options: {
    url: string
    method?: string
    headers?: Record<string, string>
    body?: string
  }) => Promise<{
    ok: boolean
    status: number
    text?: string
    error?: string
  }>
  platform: string
  minimize: () => void
  maximize: () => void
  close: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
