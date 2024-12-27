import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const baseUrl = 'https://api.mangadex.org';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const useRandomManga = (page = 1) => {
  const [manga, setManga] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    const fetchSingleManga = async (retries = 0) => {
      try {
        const response = await axios.get(`${baseUrl}/manga/random`, {
          params: {
            includes: ['cover_art'],
            contentRating: ['safe', 'suggestive']
          }
        });
        return response.data.data;
      } catch (error) {
        if (retries < MAX_RETRIES && error.response?.status === 429) { // Rate limit error
          await delay(RETRY_DELAY * (retries + 1));
          return fetchSingleManga(retries + 1);
        }
        throw error;
      }
    };

    const fetchRandomManga = async () => {
      setIsLoading(true);
      setError(null);

      if (cache.current[page]) {
        setManga(cache.current[page]);
        setIsLoading(false);
        return;
      }

      try {
        const mangaPromises = [];
        for (let i = 0; i < 20; i++) {
          
          mangaPromises.push(delay(i * 100).then(() => fetchSingleManga()));
        }

        const mangaData = await Promise.all(mangaPromises);
        cache.current[page] = mangaData;
        setManga(mangaData);
      } catch (error) {
        console.error('Error fetching random manga:', error);
        setError('An error occurred while fetching manga chottomatte.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomManga();
  }, [page]);

  return { manga, isLoading, error };
};

export default useRandomManga;
