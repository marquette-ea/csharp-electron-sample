@echo off
echo Building C# ASP.NET + TypeScript React + Electron Sample...

echo Building C# Server...
cd Server
dotnet build -c Release
cd ..

echo Building React Frontend...
cd frontend
call npm install
call npm run build
cd ..

echo Building Electron TypeScript...
cd electron
call npm install
call npm run build
cd ..

echo Building Tauri...
cd tauri
call npm install
call npm run build
cd ..