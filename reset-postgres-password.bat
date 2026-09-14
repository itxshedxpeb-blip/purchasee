@echo off
echo ========================================
echo PostgreSQL Password Reset Script
echo ========================================
echo.
echo This script will reset the PostgreSQL 'postgres' user password to 'postgres'
echo to match the default credentials in the .env file.
echo.
echo PostgreSQL is currently running on your system.
echo.
pause

cd /d "C:\Program Files\PostgreSQL\18\bin"

echo.
echo Attempting to connect to PostgreSQL...
echo.

psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Password has been reset.
    echo ========================================
    echo.
    echo Your PostgreSQL password is now: postgres
    echo.
    echo Next steps:
    echo 1. Navigate to your project directory
    echo 2. Run: npx prisma generate
    echo 3. Run: npx prisma migrate dev --name init
    echo 4. Run: npm run prisma:seed
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Could not reset password
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Current password is different from expected
    echo 2. PostgreSQL is not running
    echo 3. PostgreSQL path is incorrect
    echo.
    echo Manual instructions:
    echo 1. Open Command Prompt as Administrator
    echo 2. Navigate to: C:\Program Files\PostgreSQL\18\bin
    echo 3. Run: psql -U postgres
    echo 4. Enter your current password when prompted
    echo 5. Run: ALTER USER postgres WITH PASSWORD 'postgres';
    echo 6. Exit with: \q
    echo.
)

pause
