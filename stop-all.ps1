Write-Host "🛑 Stopping Gutzo Services..." -ForegroundColor Yellow

# Ports used by Gutzo services:
# 3000: Customer App
# 3001: Partner App
# 3002: Mock Shadowfax
# 5000: Node Backend
$ports = @(3000, 3001, 3002, 5000)

foreach ($port in $ports) {
    # Find TCP connections on the specified port
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($conns) {
        foreach ($conn in $conns) {
            $procId = $conn.OwningProcess
            # Check if the process still exists and isn't a system idle process (PID 0)
            if ($procId -gt 0) {
                $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                
                if ($proc) {
                    Write-Host "Killing process '$($proc.ProcessName)' (PID: $procId) on port $port..."
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } else {
        Write-Host "No process found on port $port." -ForegroundColor Gray
    }
}

Write-Host "✅ All Gutzo services stopped." -ForegroundColor Green
