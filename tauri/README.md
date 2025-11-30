# Tauri Application

This folder contains the Tauri version of the application, which provides a Rust-based alternative to the Electron version.

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (v16 or later)
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

## Development

To run the application in development mode:

### Windows
```batch
..\tauri-dev.bat
```

### Linux/macOS
```bash
../tauri-dev.sh
```

This will:
1. Build the C# server (Debug configuration)
2. Install frontend dependencies
3. Build the React frontend
4. Install Tauri dependencies
5. Start the Tauri app in development mode

## Building

To build the application for production:

### Windows
```batch
..\tauri.bat
```

### Linux/macOS
```bash
../tauri.sh
```

This will create a distributable package in `src-tauri/target/release/bundle/`.

## Architecture

The Tauri application follows the same architecture as the Electron version:

1. **Tauri (Rust)** - Manages the desktop application window and starts/stops the C# server
2. **C# ASP.NET Server** - Provides the backend API
3. **React Frontend** - The user interface, built with TypeScript and Vite

The main differences from Electron:

- Uses Rust instead of Node.js for the desktop shell
- Smaller bundle size
- Better performance and security
- Uses Tauri's invoke system instead of Electron's IPC

## Key Files

- `src-tauri/src/main.rs` - Main Rust application entry point
- `src-tauri/src/lib.rs` - Core Tauri application logic with server management
- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/Cargo.toml` - Rust dependencies
- `package.json` - Node.js dependencies for Tauri CLI

## API Integration

The frontend automatically detects whether it's running in Tauri or Electron and uses the appropriate API:

- **Tauri**: Uses `@tauri-apps/api` to invoke Rust functions
- **Electron**: Uses the contextBridge API
- **Web**: Falls back to default localhost URLs

This allows the same React frontend to work across all platforms.