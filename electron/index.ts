// Native
import { join } from 'path';

// Packages
import { BrowserWindow, app, ipcMain, nativeTheme } from 'electron';

import isDev from 'electron-is-dev';

const height = 600;
const width = 800;

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: false,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../dist-vite/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  // Open the DevTools.
  // window.webContents.openDevTools();

  // For AppBar
  ipcMain.on('minimize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  });
  ipcMain.on('maximize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMaximized() ? window.restore() : window.maximize();
  });

  ipcMain.on('close', () => {
    window.close();
  });

  nativeTheme.themeSource = 'dark';
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process

ipcMain.on('login', async (event, { email, password }) => {
  try {
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    // Send the response back to the renderer process
    if (response.ok) {
      event.reply('login-response', data); // Send the token and user data
    } else {
      event.reply('login-response', { error: data.error || 'Login failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    event.reply('login-response', { error: 'An error occurred while logging in.' });
  }
});
