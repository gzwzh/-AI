export interface IElectronAPI {
  getAppVersion: () => Promise<string>
  checkUpdate: (software: string, version: string) => Promise<any>
  startUpdate: (updateInfo: any) => Promise<void>
  minimize: () => void
  maximize: () => void
  close: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
