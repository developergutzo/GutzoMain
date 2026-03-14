Write-Host "🚀 Starting Gutzo Services..." -ForegroundColor Green

$root = Get-Location

# 1. Start Node Backend (Debug Mode - attach VS Code debugger on port 9229)
Write-Host "Starting Node Backend (Debug Mode)..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root\nodebackend'; npx nodemon --inspect src/server.js"

# 2. Start Customer App
Write-Host "Starting Customer App..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run dev:customer"

# 3. Start Partner App
Write-Host "Starting Partner App..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run dev:partner"

# 4. Start Shadowfax Mock
Write-Host "Starting Shadowfax Mock..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root\mock-shadowfax-app'; npm run dev"

Write-Host "✅ All services launched in separate windows." -ForegroundColor Green
