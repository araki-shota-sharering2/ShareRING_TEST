// /server/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// MongoDB接続設定
mongoose.connect('mongodb://localhost:27017/sharering', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Could not connect to MongoDB...', err));

// APIルート設定
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/user', require('./routes/user'));

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
