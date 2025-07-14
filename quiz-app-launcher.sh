#!/bin/bash

# Quiz App Launcher - 1コマンドで起動
# 使い方: ./quiz-app-launcher.sh

echo "🎯 Quiz App Launcher 起動中..."

# 作業ディレクトリを設定
WORK_DIR="$HOME/projects/quiz-app"

# リポジトリが存在しない場合はクローン
if [ ! -d "$WORK_DIR" ]; then
    echo "📥 quiz-appをクローンしています..."
    mkdir -p "$HOME/projects"
    cd "$HOME/projects"
    git clone https://github.com/muumuu8181/quiz-app.git
    cd quiz-app
else
    echo "📂 既存のquiz-appディレクトリを使用します"
    cd "$WORK_DIR"
    
    # 最新版に更新
    echo "🔄 最新版に更新中..."
    git pull origin master
fi

# 利用可能なサーバーを確認して起動
echo "🚀 サーバーを起動します..."

# Python3が利用可能な場合
if command -v python3 &> /dev/null; then
    echo "📡 Python3でサーバーを起動 (http://localhost:8000)"
    python3 -m http.server 8000 &
    SERVER_PID=$!
    
# Python2が利用可能な場合
elif command -v python &> /dev/null; then
    echo "📡 Python2でサーバーを起動 (http://localhost:8000)"
    python -m SimpleHTTPServer 8000 &
    SERVER_PID=$!
    
# Node.jsが利用可能な場合
elif command -v npx &> /dev/null; then
    echo "📡 Node.jsでサーバーを起動 (http://localhost:8000)"
    npx http-server -p 8000 &
    SERVER_PID=$!
    
else
    echo "❌ エラー: Python または Node.js がインストールされていません"
    echo "以下のいずれかをインストールしてください:"
    echo "  - Python: https://www.python.org/downloads/"
    echo "  - Node.js: https://nodejs.org/"
    exit 1
fi

# ブラウザを開く
sleep 2
echo "🌐 ブラウザを開いています..."

# OS別にブラウザを開く
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:8000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:8000" 2>/dev/null || echo "ブラウザで http://localhost:8000 を開いてください"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "http://localhost:8000"
else
    echo "ブラウザで http://localhost:8000 を開いてください"
fi

echo ""
echo "✅ Quiz Appが起動しました！"
echo "🛑 終了するには Ctrl+C を押してください"
echo ""

# Ctrl+Cでサーバーも終了
trap "kill $SERVER_PID 2>/dev/null; echo '👋 Quiz App を終了しました'; exit 0" INT

# サーバーが実行中の間待機
wait $SERVER_PID