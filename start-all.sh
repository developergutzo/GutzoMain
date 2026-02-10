#!/bin/bash

# Gutzo Start-All Script
# Starts: Node Backend, Customer App, Partner App, and Mock Shadowfax Service

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting Gutzo Services..."

# 1. Start Node Backend (Port 5000 likely)
echo "Starting Node Backend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/nodebackend' && npm run dev\""

# 2. Start Customer App (Port 3000 likely)
echo "Starting Customer App..."
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR' && npm run dev:customer\""

# 3. Start Partner App (Port 3001 likely)
echo "Starting Partner App..."
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR' && npm run dev:partner\""

# 4. Start Shadowfax Mock (Port 3002)
echo "Starting Shadowfax Mock..."
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/mock-shadowfax-app' && npm run dev\""

echo "✅ All services launched in separate Terminal tabs/windows."
