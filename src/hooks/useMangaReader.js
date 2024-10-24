import { useState, useEffect } from 'react';
import axios from 'axios';

const baseUrl = 'https://api.mangadex.org';

const useMangaReader = (mangaId) => {
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseUrl}/manga/${mangaId}/feed`, {
          params: { translatedLanguage: ['en'], order: { chapter: 'asc' } }
        });
        setChapters(response.data.data);
        if (response.data.data.length > 0) {
          setCurrentChapter(response.data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
        setError('An error occurred while fetching chapters. Please try again.');
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
      const response = await axios.get(`${baseUrl}/at-home/server/${chapterId}`);
      const serverBaseUrl = response.data.baseUrl;
      const chapterHash = response.data.chapter.hash;
      const pageFilenames = response.data.chapter.data;
      const pageUrls = pageFilenames.map(filename => `${serverBaseUrl}/data/${chapterHash}/${filename}`);
      setPages(pageUrls);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setError('An error occurred while fetching pages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeChapter = (chapter) => {
    setCurrentChapter(chapter);
    fetchPages(chapter.id);
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
    changeChapter
  };
};

export default useMangaReader;
   