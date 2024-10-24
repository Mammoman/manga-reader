import React, { useState } from 'react';
import MangaCard from './MangaCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useRandomManga from '../hooks/useRandomManga';
import '../styles/Home.css';

const Home = () => {
  const [page, setPage] = useState(1);
  const { manga, isLoading, error } = useRandomManga(page);

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >  
      <div className='home'>
        <h1>Welcome to Dayniel's Manga Reader</h1>
      </div>
      
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="container">
        {manga.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
      
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1}>Previous</button>
        <span>Page {page}</span>
        <button onClick={handleNextPage}>Next</button>
      </div>
      
      <Link to="/manga-list">Browse All Manga</Link>
    </motion.div>
  );
};

export default Home;
