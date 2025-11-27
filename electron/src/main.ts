import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let serverProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;
let serverPort: number | null = null;

// Start the C# server
function startCSharpServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    // Path to the C# server (try Release first, then Debug)
    let serverPath = path.join(__dirname, '..', '..', 'Server', 'bin', 'Release', 'net10.0', 'Server.dll');
    if (!fs.existsSync(serverPath)) {
      serverPath = path.join(__dirname, '..', '..', 'Server', 'bin', 'Debug', 'net10.0', 'Server.dll');
    }

    console.log('Starting C# server with OS-assigned port');
    console.log(`Server path: ${serverPath}`);

    // Check if server exists
    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server not found at ${serverPath}. Please build the server first.`));
      return;
    }

    // Start the server with port 0 (OS assigns random port)
    serverProcess = spawn('dotnet', [serverPath, '0'], {
      cwd: path.join(__dirname, '..', '..', 'Server')
    });

    let portResolved = false;

    serverProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`Server: ${output}`);

      // Look for the SERVER_PORT line
      const portMatch = output.match(/SERVER_PORT:(\d+)/);
      if (portMatch && !portResolved) {
        const port = parseInt(portMatch[1], 10);
        serverPort = port;
        portResolved = true;
        console.log(`Server port assigned: ${port}`);
        resolve(port);
      }
    });

    serverProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Server Error: ${data.toString()}`);
    });

    serverProcess.on('error', (error: Error) => {
      console.error('Failed to start server:', error);
      if (!portResolved) {
        reject(error);
      }
    });

    serverProcess.on('close', (code: number | null) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Timeout if port is not received within 10 seconds
    setTimeout(() => {
      if (!portResolved) {
        reject(new Error('Timeout waiting for server to report port'));
      }
    }, 10000);
  });
}

// Stop the C# server
function stopCSharpServer(): void {
  if (serverProcess) {
    console.log('Stopping C# server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// Create the Electron window
function createWindow(port: number): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the React app
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html');
  console.log(`Loading frontend from: ${frontendPath}`);

  mainWindow.loadFile(frontendPath);

  // Open DevTools only in development
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle IPC request for API URL
ipcMain.handle('get-api-url', () => {
  if (serverPort) {
    return `http://localhost:${serverPort}`;
  }
  return 'http://localhost:5000'; // fallback
});

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
    if (BrowserWindow.getAllWindows().length === 0 && serverPort) {
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
