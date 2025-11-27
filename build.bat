@echo off
echo Building C# ASP.NET + TypeScript React + Electron Sample...

REM Build C# Server
echo Building C# Server...
cd Server
dotnet build -c Release
cd ..

REM Build React Frontend
echo Building React Frontend...
cd frontend
call npm install
call npm run build
cd ..

REM Build Electron TypeScript
echo Building Electron TypeScript...
cd electron
call npm install
call npm run build
cd ..

