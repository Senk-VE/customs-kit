@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

set OUTPUT=CustomsKit_Code.txt

if exist "%OUTPUT%" del "%OUTPUT%"

echo ================================================>>"%OUTPUT%"
echo Customs Kit - Source Code Export>>"%OUTPUT%"
echo ================================================>>"%OUTPUT%"
echo.>>"%OUTPUT%"

call :AddFile "package.json"
call :AddFile "vite.config.ts"
call :AddFile ".gitignore"

call :AddFile "index.html"
call :AddFile "about.html"
call :AddFile "calc.html"
call :AddFile "currency.html"
call :AddFile "base64-converter.html"
call :AddFile "stat-analyzer.html"

call :ProcessFolder "public"
call :ProcessFolder "src"

echo.
echo ===============================================
echo Export complete!
echo File created:
echo %OUTPUT%
echo ===============================================
pause
exit /b


:AddFile
if exist "%~1" (
    echo.>>"%OUTPUT%"
    echo ==================================================>>"%OUTPUT%"
    echo FILE: %~1>>"%OUTPUT%"
    echo ==================================================>>"%OUTPUT%"
    type "%~1">>"%OUTPUT%"
    echo.>>"%OUTPUT%"
)
exit /b


:ProcessFolder
for /r "%~1" %%F in (*) do (

    set FILE=%%F
    set EXT=%%~xF

    if /I "!EXT!"==".js" call :AddFile "%%F"
    if /I "!EXT!"==".jsx" call :AddFile "%%F"
    if /I "!EXT!"==".ts" call :AddFile "%%F"
    if /I "!EXT!"==".tsx" call :AddFile "%%F"
    if /I "!EXT!"==".css" call :AddFile "%%F"
    if /I "!EXT!"==".html" call :AddFile "%%F"
    if /I "!EXT!"==".json" call :AddFile "%%F"
)
exit /b