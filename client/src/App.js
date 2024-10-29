// /client/src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import Notifications from './pages/Notifications';
import ViewPost from './pages/ViewPost';
import CreatePost from './pages/CreatePost';
import RingNavi from './pages/RingNavi';
import Achievements from './pages/Achievements';
import Fitness from './pages/Fitness';
import MyMap from './pages/MyMap';
import RingKeeper from './pages/RingKeeper';
import Group from './pages/Group';
import MyRing from './pages/MyRing';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="loading">Loading, please wait...</div>;
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/viewpost" element={<ViewPost />} />
        <Route path="/createpost" element={<CreatePost />} />
        <Route path="/ringnavi" element={<RingNavi />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/mymap" element={<MyMap />} />
        <Route path="/ringkeeper" element={<RingKeeper />} />
        <Route path="/group" element={<Group />} />
        <Route path="/myring" element={<MyRing />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
