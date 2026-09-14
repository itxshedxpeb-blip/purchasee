# PostgreSQL Password Reset Script
# This script resets the postgres user password to 'postgres'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Password Reset Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Stop PostgreSQL service" -ForegroundColor Yellow
Write-Host "2. Temporarily modify authentication to trust" -ForegroundColor Yellow
Write-Host "3. Reset postgres password to 'postgres'" -ForegroundColor Yellow
Write-Host "4. Restore original authentication" -ForegroundColor Yellow
Write-Host "5. Restart PostgreSQL service" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 1: Stopping PostgreSQL service..." -ForegroundColor Cyan
Stop-Service -Name "postgresql-x64-18" -Force
Start-Sleep -Seconds 3
Write-Host "Service stopped." -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Modifying pg_hba.conf..." -ForegroundColor Cyan
$pgDataPath = "C:\Program Files\PostgreSQL\18\data"
$pgHbaPath = "$pgDataPath\pg_hba.conf"
$pgHbaBackup = "$pgDataPath\pg_hba.conf.backup"

# Backup original file
Copy-Item $pgHbaPath $pgHbaBackup -Force
Write-Host "Backup created at: $pgHbaBackup" -ForegroundColor Green

# Read and modify pg_hba.conf
$content = Get-Content $pgHbaPath
$newContent = $content -replace 'scram-sha-256', 'trust'
$newContent = $newContent -replace 'md5', 'trust'
Set-Content $pgHbaPath $newContent -Force
Write-Host "Authentication temporarily set to 'trust'" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Starting PostgreSQL service..." -ForegroundColor Cyan
Start-Service -Name "postgresql-x64-18"
Start-Sleep -Seconds 5
Write-Host "Service started." -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Resetting password..." -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1 | Out-Null
Write-Host "Password reset to 'postgres'" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Restoring original authentication..." -ForegroundColor Cyan
Stop-Service -Name "postgresql-x64-18" -Force
Start-Sleep -Seconds 3
Copy-Item $pgHbaBackup $pgHbaPath -Force
Start-Service -Name "postgresql-x64-18"
Start-Sleep -Seconds 5
Write-Host "Authentication restored." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL password has been reset to: postgres" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to your project directory" -ForegroundColor Yellow
Write-Host "2. Run: npx prisma generate" -ForegroundColor Yellow
Write-Host "3. Run: npx prisma migrate dev --name init" -ForegroundColor Yellow
Write-Host "4. Run: npm run prisma:seed" -ForegroundColor Yellow
Write-Host "5. Restart: npm run dev" -ForegroundColor Yellow
Write-Host ""
pause
