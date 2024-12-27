import { useState, useEffect } from 'react';
import axios from 'axios';

const baseUrl = 'https://api.mangadex.org';
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const useMangaReader = (mangaId) => {
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const fetchWithRetry = async (fetchFn, retries = 0) => {
    try {
      return await fetchFn();
    } catch (error) {
      if (retries < MAX_RETRIES && error.response?.status === 429) {
        await delay(RETRY_DELAY * Math.pow(2, retries));
        return fetchWithRetry(fetchFn, retries + 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchChapters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchWithRetry(() => 
          axios.get(`${baseUrl}/manga/${mangaId}/feed`, {
            params: { 
              translatedLanguage: ['en'], 
              order: { chapter: 'asc' },
              limit: 100,  
              includes: ['scanlation_group']  
            }
          })
        );
        
        
        const sortedChapters = response.data.data.sort((a, b) => {
          return parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter);
        });
        
        setChapters(sortedChapters);
        if (sortedChapters.length > 0) {
          setCurrentChapter(sortedChapters[0]);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
        setError(error.response?.status === 429 
          ? 'Rate limit reached. Please wait a moment and try again.'
          : 'An error occurred while fetching chapters. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (mangaId) {
      fetchChapters();
    }
  }, [mangaId]);

  const fetchPages = async (chapterId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry(() =>
        axios.get(`${baseUrl}/at-home/server/${chapterId}`)
      );
      
      const { baseUrl: serverBaseUrl, chapter } = response.data;
      const { hash, data: pageFilenames } = chapter;
      
      
      const quality = 'data';
      const pageUrls = pageFilenames.map(filename => 
        `${serverBaseUrl}/${quality}/${hash}/${filename}`
      );
      
      
      pageUrls.slice(0, 3).forEach(url => {
        const img = new Image();
        img.src = url;
      });

      setPages(pageUrls);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setError(error.response?.status === 429 
        ? 'Rate limit reached. Please wait a moment and try again.'
        : 'An error occurred while fetching pages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeChapter = async (chapter) => {
    setCurrentChapter(chapter);
    await fetchPages(chapter.id);
  };


  const getChapterNumber = (chapter) => {
    return chapter?.attributes?.chapter || 'N/A';
  };

  
  const getAdjacentChapters = () => {
    if (!currentChapter || chapters.length === 0) return { next: null, prev: null };
    
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
    return {
      next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
      prev: currentIndex > 0 ? chapters[currentIndex - 1] : null
    };
  };

  useEffect(() => {
    if (currentChapter) {
      fetchPages(currentChapter.id);
    }
  }, [currentChapter]);

  return {
    chapters,
    currentChapter,
    pages,
    isLoading,
    error,
    changeChapter,
    getChapterNumber,
    getAdjacentChapters
  };
};

export default useMangaReader;
   
