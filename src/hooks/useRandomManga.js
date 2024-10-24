import { useState, useEffect } from 'react';
import axios from 'axios';

const baseUrl = 'https://api.mangadex.org';

const useRandomManga = (page = 1) => {
  const [manga, setManga] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomManga = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseUrl}/manga`, {
          params: {
            limit: 20,
            offset: (page - 1) * 20,
            order: { updatedAt: 'desc' }
          }
        });
        setManga(response.data.data);
      } catch (error) {
        console.error('Error fetching random manga:', error);
        setError('An error occurred while fetching manga. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomManga();
  }, [page]);

  return { manga, isLoading, error };
};

export default useRandomManga;
