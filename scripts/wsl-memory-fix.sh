#!/bin/bash

# WSL Memory Management Script
echo "🔧 WSL Memory Cleanup and Optimization"
echo "======================================="

# Show current memory usage
echo "📊 Current WSL Memory Usage:"
free -m

# Clear system caches
echo "🧹 Clearing system caches..."
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1

# Kill any lingering Node processes
echo "🔄 Cleaning up lingering Node processes..."
pkill -f "node.*react-scripts" 2>/dev/null || true
pkill -f "node.*webpack" 2>/dev/null || true

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Show memory after cleanup
echo "📊 Memory after cleanup:"
free -m

echo "✅ WSL memory cleanup complete!"
echo ""
echo "💡 To prevent WSL memory issues, consider adding to ~/.wslconfig:"
echo "[wsl2]"
echo "memory=6GB"
echo "processors=4"
echo ""