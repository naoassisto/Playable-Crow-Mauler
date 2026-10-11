@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage-Windows.ps1" -Mode install %*
set "result=%errorlevel%"
pause
exit /b %result%
