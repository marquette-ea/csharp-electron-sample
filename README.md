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

## Setup & Build

### 1. Build the C# Server

```bash
cd Server
dotnet build
```

### 2. Build the React Frontend

```bash
cd frontend
npm install
npm run build
```

### 3. Install Electron Dependencies

```bash
cd electron
npm install
```

## Running the Application

### Option 1: Run with Electron (Recommended)

This will start the C# server on a random port and open the Electron window:

```bash
cd electron
npm start
```

### Option 2: Run Components Separately (Development)

**Terminal 1 - Start C# Server:**
```bash
cd Server
dotnet run 5000
```

**Terminal 2 - Start React Dev Server:**
```bash
cd frontend
npm run dev
```

Then open your browser to `http://localhost:5173`

## API Endpoints

The C# server provides the following endpoints:

- `GET /` - Server status
- `GET /api/info` - Server information (version, timestamp)
- `GET /api/hello/{name}` - Personalized greeting

## How It Works

1. **Electron Startup**: The Electron main process (`electron/main.js`) starts first
2. **C# Server**: Electron spawns the C# server process on a random port (5001-65535)
3. **Frontend Loading**: Electron loads the built React app from `frontend/dist`
4. **API Communication**: The React app communicates with the C# server via the injected API_URL
5. **Lifecycle Management**: When Electron closes, it automatically stops the C# server

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

For frontend development, you can modify `src/App.tsx` to use a fixed API URL instead of the window object:

```typescript
const apiUrl = 'http://localhost:5000'
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

## License

ISC