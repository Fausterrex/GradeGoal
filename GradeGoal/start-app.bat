@echo off
echo Starting GradeGoal Application...
echo.

echo Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /k "cd backend && mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Starting React Frontend...
start "React Frontend" cmd /k "npm run dev"

echo.
echo Both applications are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo H2 Console: http://localhost:8080/h2-console
echo.
echo Press any key to exit this script...
pause > nul

