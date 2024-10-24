import React from 'react';
import { motion } from 'framer-motion';
import useSearch from '../hooks/useSearch';
import MangaCard from './MangaCard';

const Search = () => {
  const { searchTerm, setSearchTerm, searchResults, isLoading, error, handleSearch } = useSearch();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Search Manga</h2>
      <form onSubmit={handleSearch} className='search'>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for Manga"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="search-results">
        {searchResults.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </motion.div>
  );
};

export default Search;
