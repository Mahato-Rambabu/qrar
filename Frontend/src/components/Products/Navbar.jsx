import React, { useState, useRef, useEffect, useCallback } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSearchSuggestions } from "../../api/productApi";

const Navbar = ({ categoryName }) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const searchBarRef = useRef(null);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const restaurantId = new URLSearchParams(location.search).get('restaurantId');

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowNoResults(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowNoResults(false);

      const fetchedSuggestions = await fetchSearchSuggestions(query, restaurantId);

      setSuggestions(fetchedSuggestions || []);
      if (fetchedSuggestions.length === 0) {
        setShowNoResults(true);
      }
    } catch (err) {
      setError('Failed to fetch suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const debounceFetchSuggestions = useCallback((query) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 500);
  }, []);

  const onSearchChange = (query) => {
    setSearchTerm(query);
    setShowNoResults(false);
    debounceFetchSuggestions(query);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm('');
    setSuggestions([]);

    const categoryId = suggestion.category || 'all';

    navigate(
      `/products?categoryId=${categoryId}&highlightedProductId=${suggestion._id}&restaurantId=${restaurantId}`
    );
  };

  const handleSearchToggle = () => {
    setShowSearchBar((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
    };

    if (showSearchBar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchBar]);

  const handleBackButtonClick = () => {
    if (restaurantId) {
      navigate(`/home?restaurantId=${restaurantId}`);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="flex justify-between items-center text-black px-4 py-2 shadow h-[8%] relative">
      <div className="flex items-center gap-2">
        <button
          onClick={handleBackButtonClick}
          className="flex items-center gap-1"
        >
          <RiArrowLeftSLine size={32} />
        </button>
        <h1 className={`font-bold ${showSearchBar && "hidden sm:block"} sm:block`}>
          {categoryName}
        </h1>
      </div>

      {showSearchBar ? (
        <div
          ref={searchBarRef}
          className="absolute top-2/4 right-4 transform -translate-y-2/4 w-[70%] sm:w-1/2"
          role="search"
        >
          <div className="p-4 flex gap-4 items-center bg-gray-100 rounded-lg h-12">
            <FaSearch
              className="text-gray-500 text-xl hover:rounded-full hover:bg-gray-200 p-2 cursor-pointer"
              size={40}
            />
            <input
              type="text"
              placeholder="Search"
              className="outline-none pl-2 bg-gray-100 w-full"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search Input"
            />
            <button
              className="text-gray-500 text-lg px-2 rounded hover:bg-gray-200"
              onClick={() => setShowSearchBar(false)}
              aria-label="Close search"
            >
              ✕
            </button>
          </div>

          {searchTerm && (
            <div
              className="absolute top-full left-0 w-full bg-white shadow-md rounded-lg mt-1 z-20"
              role="listbox"
              aria-expanded="true"
            >
              {loading && <p className="p-2 text-gray-500">Loading...</p>}
              {!loading && error && (
                <p className="p-2 text-red-500" role="alert">
                  {error}
                </p>
              )}
              {!loading && !error && suggestions.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion._id}
                      className="hover:bg-gray-200"
                      role="option"
                    >
                      <button
                        className="flex items-center gap-4 w-full text-left p-2 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <img
                          src={suggestion.img}
                          alt={suggestion.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <span>{suggestion.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!loading && !error && showNoResults && (
                <p className="p-2 text-gray-500">No products found.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <FaSearch
          className="cursor-pointer mr-6 text-lg"
          onClick={handleSearchToggle}
          aria-label="Toggle search"
        />
      )}
    </div>
  );
};

export default Navbar;
