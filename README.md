# C# ASP.NET + TypeScript React + Electron Sample

This project demonstrates a desktop application built with:
- **Backend**: C# ASP.NET Core minimal API (runs on a random port)
- **Frontend**: TypeScript React with Vite
- **Desktop**: Electron wrapper

## Project Structure

```
.
├── Server/          # C# ASP.NET Core minimal API
├── frontend/        # TypeScript React application
└── electron/        # Electron wrapper application
```

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

## Quick Start

### Build Everything (Recommended)

**Linux/macOS:**
```bash
. ./build.sh
```

**Windows:**
```batch
cmd /c build.bat
```

### Manual Build

**1. Build the C# Server:**
```bash
cd Server
dotnet build -c Release
cd ..
```

**2. Build the React Frontend:**
```bash
cd frontend
npm install
npm run build
cd ..
```

**3. Build Electron TypeScript:**
```bash
cd electron
npm install
npm run build
cd ..
```

## Running the Application

### Option 1: Run with Electron

This will start the C# server on a random port and open the Electron window:

**Linux/macOS:**
```bash
. ./electron.sh
```

**Windows:**
```batch
cmd /c electron.bat
```

### Option 2: Run as a web server

This will start the C# server port 5000, after which you can open in your browser at https://localhost:5000

**Linux/macOS:**
```bash
. ./web.sh
```

**Windows:**
```batch
cmd /c web.bat
```

## How It Works

1. **Electron Startup**: The Electron main process (`electron/dist/main.js` compiled from TypeScript) starts first
2. **C# Server**: Electron spawns the C# server process with port 0 (OS assigns a random available port)
3. **Port Discovery**: The server outputs `SERVER_PORT:XXXXX` to stdout, which Electron parses to get the actual port
4. **Frontend Loading**: Electron loads the built React app from `frontend/dist`
5. **API Communication**: The React app communicates with the C# server via `window.electron.apiUrl` exposed through Electron's preload script
6. **Lifecycle Management**: When Electron closes, it automatically stops the C# server

## Development

### C# Server Development

```bash
cd Server
dotnet watch run 5000
```

### React Frontend Development

```bash
cd frontend
npm run dev
```

### Electron Development

The Electron app is written in TypeScript. To develop:

```bash
cd electron
npm run dev  # Compiles TypeScript and runs Electron
```

## Building for Production

1. Build the C# server in Release mode:
```bash
cd Server
dotnet publish -c Release
```

2. Build the React frontend:
```bash
cd frontend
npm run build
```

3. Package the Electron app (requires additional configuration with electron-builder or similar)
