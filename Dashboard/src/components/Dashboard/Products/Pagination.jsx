import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // No pagination if there's only one page

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Adjust as needed

    // Add first page
    if (currentPage > 3) {
      pageNumbers.push(1);
    }

    // Add ellipsis before current block
    if (currentPage > 4) {
      pageNumbers.push('...');
    }

    // Add pages around the current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis after current block
    if (currentPage < totalPages - 3) {
      pageNumbers.push('...');
    }

    // Add last page
    if (currentPage < totalPages - 2) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        className={`px-3 py-2 rounded ${
          currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'
        }`}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={index} className="px-3 py-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 rounded ${
              currentPage === page ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-800'
            }`}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        className={`px-3 py-2 rounded ${
          currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'
        }`}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
