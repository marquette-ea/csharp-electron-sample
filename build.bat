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

REM Install Electron dependencies
echo Installing Electron dependencies...
cd electron
call npm install
cd ..

echo Build complete! Run 'cd electron && npm start' to launch the application.
pause
