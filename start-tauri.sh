#!/bin/bash
# ChefMind Tauri App Launcher

echo "Starting ChefMind Tauri Application..."
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src-tauri" ]; then
    echo "Error: Please run this script from the ChefMind project root directory"
    exit 1
fi

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start the Tauri development server
echo "Starting Tauri development server..."
echo "The application window should appear shortly."
echo "If the window doesn't appear, please ensure you have a GUI environment running."
echo ""

npm run tauri:dev