# 4択クイズアプリ

インタラクティブな4択クイズアプリケーション。様々なジャンルの問題を楽しく解答できます。

## 特徴

- 🎯 **多様な問題**: 一般知識、科学、歴史、文化など幅広いジャンル
- 🎨 **美しいデザイン**: モダンなUIとアニメーション
- 📱 **レスポンシブ**: PC・スマートフォン対応
- 🏆 **スコア機能**: 正解数とスコアの表示
- 🔄 **リアルタイム**: 即座に正解・不正解を表示

## デモ

https://muumuu8181.github.io/quiz-app/

## 使用方法

### オンラインで使用
上記のデモリンクにアクセスしてください。

### ローカルで使用
```bash
# リポジトリをクローン
git clone https://github.com/muumuu8181/quiz-app.git

# ディレクトリに移動
cd quiz-app

# ローカルサーバーで開く（例：Python）
python -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

## ファイル構成

```
quiz-app/
├── index.html      # メインのHTMLファイル
├── style.css       # スタイルシート
├── script.js       # メインのJavaScriptファイル
├── questions.js    # クイズ問題データ
├── images/         # 画像ファイル
└── README.md       # このファイル
```

## 技術スタック

- **HTML5**: セマンティックなマークアップ
- **CSS3**: モダンなスタイリングとアニメーション
- **JavaScript (ES6+)**: インタラクティブな機能
- **Responsive Design**: モバイルファースト

## カスタマイズ

### 問題の追加
`questions.js`ファイルに新しい問題を追加できます：

```javascript
{
    question: "新しい問題文",
    options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    correct: 0, // 正解のインデックス（0-3）
    explanation: "解説文"
}
```

### スタイルの変更
`style.css`を編集してデザインをカスタマイズできます。

## ライセンス

MIT License

## 貢献

Issue や Pull Request をお待ちしています。

## 作者

muumuu8181

---

🎯 楽しいクイズ体験をお楽しみください！