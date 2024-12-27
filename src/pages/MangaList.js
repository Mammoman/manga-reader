import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Mangalist.css';
import useSearch from '../hooks/useSearch';
import { Link } from 'react-router-dom';

const MangaList = () => {
  const [mangaList, setMangaList] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);
  const { id } = useParams();
  const { searchTerm, setSearchTerm, searchResults, isLoading, error, handleSearch } = useSearch();

  useEffect(() => {
    const fetchManga = async () => {
      try {
        if (id) {
          const response = await axios.get(`https://api.mangadex.org/manga/${id}`);
          setSelectedManga(response.data.data);
        } else {
          const response = await axios.get('https://api.mangadex.org/manga');
          setMangaList(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching manga:', error);
      }
    };

    fetchManga();
  }, [id]);

  const renderManga = (manga) => {
    const coverRelationship = manga.relationships.find(rel => rel.type === 'cover_art');
    const coverFileName = coverRelationship?.attributes?.fileName;
    const mangaId = manga.id;

    const getCoverUrl = (size) => {
      if (!mangaId || !coverFileName) return '';
      const baseUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`;
      if (size && (size === 256 || size === 512)) {
        return `${baseUrl}.${size}.jpg`;
      }
      return baseUrl;
    };

    const coverUrl = getCoverUrl(256);

    return (
      <div className="manga-item" key={manga.id}>
        <img 
          className="manga-image" 
          src={coverUrl || '/images/no-image-available.jpg'} 
          alt={manga.attributes.title.en}
          onError={(e) => {
            console.error('Image failed to load:', coverUrl);
            e.target.src = '/images/fallback-image.jpeg';
            e.target.onerror = null; // Prevent infinite loop
          }}
        />
        <div className="manga-details">
          <h3 className="manga-title">{manga.attributes.title.en}</h3>
          <p className="manga-info">Author: {manga.relationships.find(rel => rel.type === 'author')?.attributes?.name || 'Unknown'}</p>
          <p className="manga-info">Year Released: {manga.attributes.year || 'Unknown'}</p>
          <p className='manga-chapt'>Latest Chapter: {manga?.attributes?.lastChapter || 'N/A'}</p>
          <div className="manga-rating">
            <span className="manga-rating-stars">{'★'.repeat(Math.round(manga.attributes.rating || 0))}</span>
            <span className="manga-rating-value">{manga.attributes.rating || 'No rating'}</span>
          </div>
          <div className="manga-genres">
            {manga.attributes.tags.map(tag => (
              <span key={tag.id} className="manga-genre">{tag.attributes.name.en}</span>
            ))}
          </div>
          <Link to={`/reader/${manga.id}`}>Read Manga</Link>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Manga List</h2>
      <form onSubmit={handleSearch} className='search'>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for Manga"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Chottomatte...' : 'Search'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {selectedManga ? (
        renderManga(selectedManga)
      ) : (
        (searchResults.length > 0 ? searchResults : mangaList).map(renderManga)
      )}
    </motion.div>
  );
};

export default MangaList;
