#!/bin/bash
set -e

echo "Building C# Server..."
cd Server
dotnet build --configuration Debug

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Starting Tauri app in development mode..."
cd ../tauri
npm install
npm run dev