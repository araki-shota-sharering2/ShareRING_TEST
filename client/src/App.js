// /client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home'; // ホーム画面のインポート

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* ルートURLでHomeコンポーネントを表示 */}
        <Route path="/" element={<Home />} />
        {/* 他のページのルーティングもここに追加 */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
