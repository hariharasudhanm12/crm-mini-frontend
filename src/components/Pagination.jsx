// Pagination component with previous, numbered pages, and next buttons
import React from "react";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import "./Pagination.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate visible page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, and window around currentPage
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    }
  }

  // Deduplicate and insert ellipsis logic
  const visiblePagesWithGaps = [];
  let prevPage = null;
  for (const page of pages) {
    if (prevPage && page - prevPage > 1) {
      visiblePagesWithGaps.push("...");
    }
    visiblePagesWithGaps.push(page);
    prevPage = page;
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeftOutlinedIcon fontSize="small" />
      </button>

      <div className="pagination-numbers">
        {visiblePagesWithGaps.map((page, index) =>
          page === "..." ? (
            <span key={`gap-${index}`} className="pagination-gap">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`pagination-number ${page === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRightOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}
