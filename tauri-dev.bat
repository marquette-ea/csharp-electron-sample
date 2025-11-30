@echo off
echo Building C# Server...
cd Server
dotnet build --configuration Debug
if errorlevel 1 (
    echo Failed to build C# server
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Building frontend...
call npm run build
if errorlevel 1 (
    echo Failed to build frontend
    pause
    exit /b 1
)

echo Starting Tauri app in development mode...
cd ..\tauri
call npm install
if errorlevel 1 (
    echo Failed to install Tauri dependencies
    pause
    exit /b 1
)

call npm run dev