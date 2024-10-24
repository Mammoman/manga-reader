import { useState } from 'react';
import axios from 'axios';

const baseUrl = 'https://api.mangadex.org';

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}/manga`, {
        params: {
          title: searchTerm,
          limit: 24,
          order: { relevance: 'desc' }
        }
      });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error fetching manga:', error);
      setError('An error occurred while fetching manga. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    error,
    handleSearch
  };
};

export default useSearch;
