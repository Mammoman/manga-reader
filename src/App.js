import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import MangaList from './pages/MangaList';
import Reader from './pages/Reader';
import Navigation from './components/Navigation';
import Search from './pages/Search';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/manga-list" element={<MangaList />} />
        <Route path="/manga-list/:id" element={<MangaList />} />
        <Route path="/reader/:id" element={<Reader />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
