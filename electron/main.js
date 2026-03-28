const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const os = require('os')

const isDev = !app.isPackaged

function isWsl() {
  return process.platform === 'linux' && (
    Boolean(process.env.WSL_INTEROP) ||
    os.release().toLowerCase().includes('microsoft')
  )
}

function spawnDetached(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
      ...options
    })

    child.once('error', reject)
    child.once('spawn', () => {
      child.unref()
      resolve()
    })
  })
}

function escapePowerShellString(value) {
  return String(value).replace(/'/g, "''")
}

function openExternalUrl(url) {
  if (!url || typeof url !== 'string') {
    return Promise.reject(new Error('Invalid external URL'))
  }

  if (isWsl()) {
    const escapedUrl = escapePowerShellString(url)
    const openers = [
      () => spawnDetached('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `Start-Process '${escapedUrl}'`
      ]),
      () => spawnDetached('cmd.exe', ['/c', 'start', '""', url], { shell: true }),
      () => spawnDetached('xdg-open', [url]),
      () => shell.openExternal(url)
    ]

    return openers.reduce(
      (promise, open) => promise.catch(() => open()),
      Promise.reject(new Error('No external opener available in WSL'))
    )
  }

  return shell.openExternal(url)
}

function createWindow() {
  Menu.setApplicationMenu(null)

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 700,
    minHeight: 560,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    title: '全能计算器',
    icon: path.join(__dirname, '../public/计算器.ico')
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDev) {
    win.loadURL('http://localhost:5175/')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    openExternalUrl(url).catch((error) => {
      console.error('Failed to open external URL:', error)
    })
  })

  win.webContents.setWindowOpenHandler((details) => {
    openExternalUrl(details.url).catch((error) => {
      console.error('Failed to open external URL:', error)
    })
    return { action: 'deny' }
  })
}

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('open-external', async (event, url) => {
  if (!url) {
    return { success: false, error: 'Missing URL' }
  }

  await openExternalUrl(url)
  return { success: true }
})

ipcMain.handle('http-request', async (event, options = {}) => {
  const { url, method = 'GET', headers = {}, body } = options

  if (!url) {
    return { ok: false, status: 0, error: 'Missing URL' }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body
    })

    const text = await response.text()
    return {
      ok: response.ok,
      status: response.status,
      text
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message || String(error)
    }
  }
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
