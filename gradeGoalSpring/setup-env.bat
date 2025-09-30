@echo off
REM GradeGoal Environment Variables Setup Script
REM Run this script to set up your environment variables for local development

echo GradeGoal Environment Setup
echo =========================
echo.

REM Check if .env file exists
if exist ".env" (
    echo Loading environment variables from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
            echo Set %%a
        )
    )
) else (
    echo No .env file found. Please create one based on env.example
    echo Example:
    echo   MAIL_USERNAME=your-email@gmail.com
    echo   MAIL_PASSWORD=your-16-character-app-password
    echo.
    echo Or set environment variables manually:
    echo   set MAIL_USERNAME=your-email@gmail.com
    echo   set MAIL_PASSWORD=your-app-password
    pause
    exit /b 1
)

echo.
echo Environment variables set successfully!
echo You can now run: mvnw.cmd spring-boot:run
pause