#!/bin/bash
set -e

echo "Building C# ASP.NET + TypeScript React + Electron Sample..."

# Build C# Server
echo "Building C# Server..."
cd Server
dotnet build -c Release
cd ..

# Build React Frontend
echo "Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

# Install Electron dependencies
echo "Installing Electron dependencies..."
cd electron
npm install
npm run build
cd ..

echo "Build complete! Run 'cd electron && npm start' to launch the application."
