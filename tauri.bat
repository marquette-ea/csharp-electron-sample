@echo off
echo Building C# Server...
cd Server
dotnet build --configuration Release
if errorlevel 1 (
    echo Failed to build C# server
    pause
    exit /b 1
)

echo Building React frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo Failed to build frontend
    pause
    exit /b 1
)

echo Building Tauri app...
cd ..\tauri
call npm install
if errorlevel 1 (
    echo Failed to install Tauri dependencies
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo Failed to build Tauri app
    pause
    exit /b 1
)

echo Build complete!