$dbPath = "C:\Users\tusha\.gemini\antigravity\scratch\escape_room\backend\escape_room.db"
$railwayUrl = "https://escape-room-production-b75f.up.railway.app/api/upload_db"

Write-Host "Reading local database..." -ForegroundColor Cyan
$dbBytes = [System.IO.File]::ReadAllBytes($dbPath)
Write-Host "Database size: $($dbBytes.Length) bytes" -ForegroundColor Cyan

Write-Host "Uploading to Railway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $railwayUrl -Method POST -Body $dbBytes -ContentType "application/octet-stream"
    Write-Host "SUCCESS: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
