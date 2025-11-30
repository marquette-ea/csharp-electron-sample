#!/bin/bash
set -e

echo "Building C# Server..."
cd Server
dotnet build --configuration Release

echo "Building React frontend..."
cd ../frontend
npm install
npm run build

echo "Building Tauri app..."
cd ../tauri
npm install
npm run build

cd ..

echo "Build complete!"