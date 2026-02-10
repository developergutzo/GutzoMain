#!/bin/bash

# Gutzo Stop-All Script
# Stops: Node Backend (5000), Customer App (3000), Partner App (3001), and Mock Shadowfax (3002)

echo "🛑 Stopping Gutzo Services..."

# Function to kill process on a specific port
kill_port() {
  PORT=$1
  NAME=$2
  # Find PIDs using the port
  PIDs=$(lsof -t -i:$PORT)
  
  if [ -n "$PIDs" ]; then
    echo "Found $NAME on port $PORT (PIDs: $PIDs). Killing..."
    # Kill all PIDs found
    echo "$PIDs" | xargs kill -9
    echo "✅ stopped $NAME."
  else
    echo "ℹ️  $NAME on port $PORT is not active."
  fi
}

# 1. Stop Node Backend
kill_port 5000 "Node Backend"

# 2. Stop Customer App
kill_port 3000 "Customer App"

# 3. Stop Partner App
kill_port 3001 "Partner App"

# 4. Stop Shadowfax Mock
kill_port 3002 "Shadowfax Mock"

echo "🏁 All services check complete."
