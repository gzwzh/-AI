const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

// 判断是否为开发环境：检查是否通过 electron . 启动且有 node_modules
const isDev = !app.isPackaged

function createWindow() {
  // 隐藏菜单栏
  Menu.setApplicationMenu(null)
  
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false,
    title: '计算器',
    icon: path.join(__dirname, '../public/计算器.ico')
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDev) {
    win.loadURL('http://localhost:5175/-AI/')
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
