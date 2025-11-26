const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let serverProcess = null;
let mainWindow = null;
let serverPort = null;

// Find an available port (simple random port selection)
function getRandomPort() {
  return Math.floor(Math.random() * (65535 - 5001) + 5001);
}

// Start the C# server
function startCSharpServer() {
  return new Promise((resolve, reject) => {
    serverPort = getRandomPort();
    
    // Path to the C# server
    const serverPath = path.join(__dirname, '..', 'Server', 'bin', 'Debug', 'net10.0', 'Server.dll');
    
    console.log(`Starting C# server on port ${serverPort}`);
    console.log(`Server path: ${serverPath}`);
    
    // Check if server exists
    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server not found at ${serverPath}. Please build the server first.`));
      return;
    }
    
    // Start the server with dotnet
    serverProcess = spawn('dotnet', [serverPath, serverPort.toString()], {
      cwd: path.join(__dirname, '..', 'Server')
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data.toString()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data.toString()}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Wait a bit for server to start
    setTimeout(() => {
      resolve(serverPort);
    }, 2000);
  });
}

// Stop the C# server
function stopCSharpServer() {
  if (serverProcess) {
    console.log('Stopping C# server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// Create the Electron window
function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Inject the API URL into the window
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      window.API_URL = 'http://localhost:${port}';
    `);
  });

  // Load the React app
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  console.log(`Loading frontend from: ${frontendPath}`);
  
  mainWindow.loadFile(frontendPath);

  // Open DevTools in development
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    const port = await startCSharpServer();
    console.log(`C# server started on port ${port}`);
    createWindow(port);
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(serverPort);
    }
  });
});

app.on('window-all-closed', () => {
  stopCSharpServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopCSharpServer();
});

app.on('will-quit', () => {
  stopCSharpServer();
});
