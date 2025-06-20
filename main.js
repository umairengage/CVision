const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: __dirname + '/preload.js' // Agar tum preload.js use karna chaho
    }
  });

  // Yahan tum index.html ya koi external website load kar sakte ho
  win.loadFile('index.html');
  // ya phir: win.loadURL('https://tumhariwebsite.com');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
