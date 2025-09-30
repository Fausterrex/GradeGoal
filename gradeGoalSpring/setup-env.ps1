# GradeGoal Environment Variables Setup Script
# Run this script to set up your environment variables for local development

Write-Host "GradeGoal Environment Setup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Set $name" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "No .env file found. Please create one based on env.example" -ForegroundColor Red
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  MAIL_USERNAME=your-email@gmail.com" -ForegroundColor Gray
    Write-Host "  MAIL_PASSWORD=your-16-character-app-password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or set environment variables manually:" -ForegroundColor Yellow
    Write-Host "  `$env:MAIL_USERNAME = 'your-email@gmail.com'" -ForegroundColor Gray
    Write-Host "  `$env:MAIL_PASSWORD = 'your-app-password'" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "You can now run: .\mvnw.cmd spring-boot:run" -ForegroundColor Cyan