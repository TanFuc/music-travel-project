#!/bin/bash
# Check Setup Script for Linux/macOS or Git Bash

echo "----------------------------------------"
echo "🎵 FSell Music-Travel Project Check 🎵"
echo "----------------------------------------"

# 1. Install dependencies
echo "📦 Installing root dependencies..."
pnpm install

echo "📦 Installing backend dependencies..."
cd backend && pnpm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && pnpm install && cd ..

# 2. Check Backend
echo "----------------------------------------"
echo "🚀 Validating Backend..."
echo "----------------------------------------"
cd backend
pnpm run validate
BACKEND_STATUS=$?
cd ..

# 3. Check Frontend
echo "----------------------------------------"
echo "🎨 Validating Frontend..."
echo "----------------------------------------"
cd frontend
pnpm run validate
FRONTEND_STATUS=$?
cd ..

# Summary
echo "----------------------------------------"
if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ]; then
    echo "✅ All checks passed! Ready for production deployment."
    exit 0
else
    echo "❌ Some checks failed! Please review the console output above."
    if [ $BACKEND_STATUS -ne 0 ]; then echo "  - Backend validation failed =("; fi
    if [ $FRONTEND_STATUS -ne 0 ]; then echo "  - Frontend validation failed =("; fi
    exit 1
fi
