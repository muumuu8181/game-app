#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quiz App Launcher - Pythonワンライナー実行スクリプト
使い方: python -c "$(curl -s https://raw.githubusercontent.com/muumuu8181/quiz-app/master/run.py)"
"""

import os
import sys
import subprocess
import platform
import time
import webbrowser
from pathlib import Path

def main():
    print("🎯 Quiz App Launcher 起動中...")
    
    # 作業ディレクトリを設定
    home_dir = Path.home()
    work_dir = home_dir / "projects" / "quiz-app"
    
    # Gitがインストールされているか確認
    try:
        subprocess.run(["git", "--version"], capture_output=True, check=True)
    except:
        print("❌ エラー: Gitがインストールされていません")
        print("https://git-scm.com/downloads からインストールしてください")
        sys.exit(1)
    
    # リポジトリが存在しない場合はクローン
    if not work_dir.exists():
        print("📥 quiz-appをクローンしています...")
        work_dir.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "git", "clone", 
            "https://github.com/muumuu8181/quiz-app.git",
            str(work_dir)
        ])
    else:
        print("📂 既存のquiz-appディレクトリを使用します")
        os.chdir(work_dir)
        print("🔄 最新版に更新中...")
        subprocess.run(["git", "pull", "origin", "master"])
    
    # ディレクトリに移動
    os.chdir(work_dir)
    
    # サーバーを起動
    print("🚀 サーバーを起動します...")
    
    # Python標準のHTTPサーバーを使用
    import http.server
    import socketserver
    import threading
    
    PORT = 8000
    Handler = http.server.SimpleHTTPRequestHandler
    
    def run_server():
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    
    # サーバーをバックグラウンドで起動
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    print(f"📡 サーバーを起動しました (http://localhost:{PORT})")
    
    # ブラウザを開く
    time.sleep(2)
    print("🌐 ブラウザを開いています...")
    webbrowser.open(f"http://localhost:{PORT}")
    
    print("\n✅ Quiz Appが起動しました！")
    print("🛑 終了するには Ctrl+C を押してください\n")
    
    # サーバーを実行し続ける
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Quiz App を終了しました")
        sys.exit(0)

if __name__ == "__main__":
    main()