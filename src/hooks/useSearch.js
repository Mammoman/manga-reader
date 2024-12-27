import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const baseUrl = 'https://api.mangadex.org';
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;
const DEBOUNCE_DELAY = 300; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimer = useRef(null);

  
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

  
  const debouncedSearch = useCallback((term) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(term);
    }, DEBOUNCE_DELAY);
  }, []);

  const performSearch = async (term, page = 1) => {
    if (!term.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry(() =>
        axios.get(`${baseUrl}/manga`, {
          params: {
            title: term,
            limit: 24,
            offset: (page - 1) * 24,
            order: { relevance: 'desc' },
            includes: ['cover_art', 'author', 'artist'],
            contentRating: ['safe', 'suggestive'],
            hasAvailableChapters: true
          }
        })
      );

      const { data, total } = response.data;
      setSearchResults(data || []);
      setTotalResults(total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching manga:', error);
      setError(
        error.response?.status === 429
          ? 'Rate limit reached. Please wait a moment and try again.'
          : 'An error occurred while searching manga. Please try again.'
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    await performSearch(searchTerm, 1);
  };

  
  const handleSearchInput = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  
  const handlePageChange = async (newPage) => {
    await performSearch(searchTerm, newPage);
  };

  
  const formatMangaData = (manga) => {
    const { attributes } = manga;
    return {
      id: manga.id,
      title: attributes.title.en || attributes.title.ja || Object.values(attributes.title)[0],
      description: attributes.description.en || Object.values(attributes.description)[0],
      coverArt: manga.relationships?.find(rel => rel.type === 'cover_art')?.attributes?.fileName,
      author: manga.relationships?.find(rel => rel.type === 'author')?.attributes?.name,
      status: attributes.status,
      year: attributes.year,
      tags: attributes.tags.map(tag => tag.attributes.name.en)
    };
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchInput,
    searchResults,
    isLoading,
    error,
    handleSearch,
    totalResults,
    currentPage,
    handlePageChange,
    formatMangaData,
    hasNextPage: searchResults.length > 0 && (currentPage * 24) < totalResults,
    hasPrevPage: currentPage > 1
  };
};

export default useSearch;
