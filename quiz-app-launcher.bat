@echo off
REM Quiz App Launcher for Windows - 1コマンドで起動
REM 使い方: quiz-app-launcher.bat

echo 🎯 Quiz App Launcher 起動中...

REM 作業ディレクトリを設定
set WORK_DIR=%USERPROFILE%\projects\quiz-app

REM リポジトリが存在しない場合はクローン
if not exist "%WORK_DIR%" (
    echo 📥 quiz-appをクローンしています...
    if not exist "%USERPROFILE%\projects" mkdir "%USERPROFILE%\projects"
    cd /d "%USERPROFILE%\projects"
    git clone https://github.com/muumuu8181/quiz-app.git
    cd quiz-app
) else (
    echo 📂 既存のquiz-appディレクトリを使用します
    cd /d "%WORK_DIR%"
    
    REM 最新版に更新
    echo 🔄 最新版に更新中...
    git pull origin master
)

REM 利用可能なサーバーを確認して起動
echo 🚀 サーバーを起動します...

REM Pythonが利用可能な場合
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 📡 Pythonでサーバーを起動 ^(http://localhost:8000^)
    start /b python -m http.server 8000
    goto :browser
)

REM Node.jsが利用可能な場合
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 📡 Node.jsでサーバーを起動 ^(http://localhost:8000^)
    start /b npx http-server -p 8000
    goto :browser
)

echo ❌ エラー: Python または Node.js がインストールされていません
echo 以下のいずれかをインストールしてください:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
pause
exit /b 1

:browser
REM ブラウザを開く
timeout /t 2 >nul
echo 🌐 ブラウザを開いています...
start http://localhost:8000

echo.
echo ✅ Quiz Appが起動しました！
echo 🛑 終了するにはこのウィンドウを閉じてください
echo.
pause