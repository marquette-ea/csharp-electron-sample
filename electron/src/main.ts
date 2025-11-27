import { app, BrowserWindow } from 'electron';
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

    console.log('Starting C# server...');
    console.log(`Server path: ${serverPath}`);

    // Check if server exists
    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server not found at ${serverPath}. Please build the server first.`));
      return;
    }

    // Start the server with dotnet (no port argument, let it pick its own)
    serverProcess = spawn('dotnet', [serverPath], {
      cwd: path.join(__dirname, '..', '..', 'Server')
    });

    let portResolved = false;

    serverProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`Server: ${output}`);

      // Parse the port from server output - try multiple formats
      let portMatch = output.match(/SERVER_PORT:(\d+)/);
      if (!portMatch) {
        // Fallback: parse standard ASP.NET output "Now listening on: http://localhost:PORT"
        portMatch = output.match(/Now listening on: http:\/\/localhost:(\d+)/);
      }
      if (!portMatch) {
        // Another fallback: parse "Server starting on http://localhost:PORT"
        portMatch = output.match(/Server starting on http:\/\/localhost:(\d+)/);
      }

      if (portMatch && !portResolved) {
        serverPort = parseInt(portMatch[1], 10);
        console.log(`Detected server port: ${serverPort}`);
        portResolved = true;
        resolve(serverPort);
      }
    });

    serverProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.error(`Server Error: ${output}`);

      // Also check stderr for our custom port output
      const portMatch = output.match(/SERVER_PORT:(\d+)/);
      if (portMatch && !portResolved) {
        serverPort = parseInt(portMatch[1], 10);
        console.log(`Detected server port from stderr: ${serverPort}`);
        portResolved = true;
        resolve(serverPort);
      }
    });

    serverProcess.on('error', (error: Error) => {
      console.error('Failed to start server:', error);
      if (!portResolved) {
        reject(error);
      }
    });

    serverProcess.on('close', (code: number | null) => {
      console.log(`Server process exited with code ${code}`);
      if (!portResolved) {
        reject(new Error(`Server exited with code ${code} before port was detected`));
      }
    });

    // Timeout after 10 seconds if port is not detected
    setTimeout(() => {
      if (!portResolved) {
        reject(new Error('Timeout: Could not detect server port within 10 seconds'));
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

  // Inject the API URL into the window
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.executeJavaScript(`
      window.API_URL = 'http://localhost:${port}';
    `);
  });

  // Load the React app
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html');
  console.log(`Loading frontend from: ${frontendPath}`);

  mainWindow.loadFile(frontendPath);

  // Open DevTools for development/debugging
  // In production, consider removing this or adding a condition
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