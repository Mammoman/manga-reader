import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import useMangaReader from '../hooks/useMangaReader';
import '../styles/Reader.css';

const Reader = () => {
  const { id } = useParams();
  const { chapters, currentChapter, pages, isLoading, error, changeChapter } = useMangaReader(id);
  const [currentPage, setCurrentPage] = useState(0);

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (chapters.indexOf(currentChapter) < chapters.length - 1) {
      changeChapter(chapters[chapters.indexOf(currentChapter) + 1]);
      setCurrentPage(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (chapters.indexOf(currentChapter) > 0) {
      changeChapter(chapters[chapters.indexOf(currentChapter) - 1]);
      setCurrentPage(0);
    }
  };

  return (
    <motion.div
      className="reader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Manga Reader</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {currentChapter && (
        <div className="chapter-info">
          <h3>Chapter {currentChapter.attributes.chapter}: {currentChapter.attributes.title}</h3>
          <select onChange={(e) => changeChapter(chapters[e.target.value])}>
            {chapters.map((chapter, index) => (
              <option key={chapter.id} value={index}>
                Chapter {chapter.attributes.chapter}
              </option>
            ))}
          </select>
        </div>
      )}
      {pages.length > 0 && (
        <div className="page-container">
          <img src={pages[currentPage]} alt={`Page ${currentPage + 1}`} />
          <div className="page-controls">
            <button onClick={handlePrevPage} disabled={currentPage === 0 && chapters.indexOf(currentChapter) === 0}>
              Previous
            </button>
            <span>{currentPage + 1} / {pages.length}</span>
            <button onClick={handleNextPage} disabled={currentPage === pages.length - 1 && chapters.indexOf(currentChapter) === chapters.length - 1}>
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reader;
