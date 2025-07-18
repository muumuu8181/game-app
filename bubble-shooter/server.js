const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, 'public')));

// ルートページ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌈 カラフル重力パズルゲームが起動しました！`);
    console.log(`🎮 ブラウザで http://localhost:${PORT} を開いてください`);
    console.log(`📱 スマホからも同じURLでアクセスできます`);
    console.log(`🎯 同じ色の球を3つ以上つなげて消そう！`);
});