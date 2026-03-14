const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

// 判断是否为开发环境：检查是否通过 electron . 启动且有 node_modules
const isDev = !app.isPackaged

function createWindow() {
  // 隐藏菜单栏
  Menu.setApplicationMenu(null)
  
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 700,
    minHeight: 560,
    frame: false, // 彻底隐藏原生边框和标题栏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    title: 'All Calculator',
    icon: path.join(__dirname, '../public/计算器.ico')
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDev) {
    win.loadURL('http://localhost:5175/')
    win.webContents.openDevTools() // 开发模式打开调试工具
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 处理外部链接，在系统默认浏览器中打开
  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // 处理页面内的链接点击
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }  // 阻止在Electron中打开新窗口
  })
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.on('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.minimize()
})

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('window-close', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.close()
})

ipcMain.handle('check-update', async (event, software, version) => {
  try {
    const url = `http://software.kunqiongai.com:8000/api/v1/updates/check/?software=${software}&version=${version}`
    console.log('Checking update:', url)
    const response = await fetch(url)
    const data = await response.json()
    console.log('Update response:', data)
    return data
  } catch (error) {
    console.error('Check update error:', error)
    return { has_update: false, error: error.message }
  }
})

ipcMain.handle('start-update', (event, updateInfo) => {
  let installDir = path.dirname(app.getPath('exe'))
  let updaterPath = path.join(installDir, 'updater.exe')
  let exeName = path.basename(app.getPath('exe'))

  if (isDev) {
    updaterPath = path.join(__dirname, '..', 'updater.exe')
    installDir = path.join(__dirname, '..')
  } else {
    // 生产环境下，如果 updater.exe 不在 exe 同级目录，可能在 resources 目录或其他位置
    // 根据 package.json 配置，extraFiles: [{"from": "updater.exe", "to": "."}]
    // 这意味着它应该在 exe 同级目录下。
    // 但是，有些情况下（如 nsis 安装后），可能需要检查路径。
    // 另外，如果是未打包运行（虽然 !isDev，但可能是 electron 启动的），需要注意。
    
    // 检查文件是否存在，如果不存在尝试 resources 目录（防止配置变更）
    const fs = require('fs')
    if (!fs.existsSync(updaterPath)) {
        const resourcePath = path.join(process.resourcesPath, '..', 'updater.exe')
        if (fs.existsSync(resourcePath)) {
            updaterPath = resourcePath
        }
    }
  }

  const args = [
    '--url', updateInfo.download_url,
    '--hash', updateInfo.package_hash || '',
    '--dir', installDir,
    '--exe', exeName,
    '--pid', process.pid.toString()
  ]

  console.log('Starting updater:', updaterPath, args)

  try {
    const subprocess = spawn(updaterPath, args, {
      detached: true,
      stdio: 'ignore'
    })
    
    subprocess.on('error', (err) => {
      console.error('Failed to spawn updater (subprocess error):', err)
    })

    subprocess.unref()
    app.quit()
  } catch (e) {
    console.error('Failed to spawn updater:', e)
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
